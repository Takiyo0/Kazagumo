import { EventEmitter } from 'events';
import {
  CreatePlayerOptions,
  KazagumoEvents,
  Events,
  KazagumoError,
  KazagumoOptions as KazagumoOptionsOwO,
  KazagumoSearchOptions,
  KazagumoSearchResult,
  PlayerMovedChannels,
  PlayerMovedState,
  SearchResultTypes,
  SourceIDs,
  State,
} from './Modules/Interfaces';
import {
  Node,
  NodeOption,
  PlayerUpdate,
  Shoukaku,
  ShoukakuOptions,
  TrackExceptionEvent,
  TrackStuckEvent,
  WebSocketClosedEvent,
  Connector,
} from 'shoukaku';

import { KazagumoPlayer } from './Managers/KazagumoPlayer';
import { KazagumoTrack } from './Managers/Supports/KazagumoTrack';
import { Snowflake } from 'discord.js';

// Add other methods related to your base class

export class Kazagumo extends EventEmitter {
  /** Shoukaku instance */
  public shoukaku: Shoukaku;
  /** Kazagumo players */
  public readonly players: Map<string, KazagumoPlayer>;

  /**
   * Initialize a Kazagumo instance.
   * @param KazagumoOptions KazagumoOptions
   * @param connector Connector
   * @param nodes NodeOption[]
   * @param options ShoukakuOptions
   */
  constructor(
    public KazagumoOptions: KazagumoOptionsOwO,
    connector: Connector,
    nodes: NodeOption[],
    options: ShoukakuOptions = {},
  ) {
    super();

    this.shoukaku = new Shoukaku(connector, nodes, options);

    if (this.KazagumoOptions.plugins) {
      for (const [, plugin] of this.KazagumoOptions.plugins.entries()) {
        if (plugin.constructor.name !== 'KazagumoPlugin')
          throw new KazagumoError(1, 'Plugin must be an instance of KazagumoPlugin');
        plugin.load(this);
      }
    }

    this.players = new Map<string, KazagumoPlayer>();
  }
  public on<K extends keyof KazagumoEvents>(event: K, listener: (...args: KazagumoEvents[K][]) => void): this {
    super.on(event as string, (...args) => listener(...args));
    return this;
  }
  public once<K extends keyof KazagumoEvents>(event: K, listener: (...args: KazagumoEvents[K][]) => void): this {
    super.once(event as string, (...args) => listener(...args));
    return this;
  }
  public off<K extends keyof KazagumoEvents>(event: K, listener: (...args: KazagumoEvents[K][]) => void): this {
    super.off(event as string, (...args) => listener(...args));
    return this;
  }
  public emit<K extends keyof KazagumoEvents>(event: K, ...data: KazagumoEvents[K]): boolean {
    return super.emit(event as string, ...data);
  }
  /**
   * Create a player.
   * @param options CreatePlayerOptions
   * @returns Promise<KazagumoPlayer>
   */
  public async createPlayer<T extends KazagumoPlayer>(options: CreatePlayerOptions): Promise<T | KazagumoPlayer> {
    const exist = this.players.get(options.guildId);
    if (exist) return exist;

    let node;
    if (options.loadBalancer) node = this.getLeastUsedNode();
    else if (options.nodeName) node = this.shoukaku.getNode(options.nodeName);
    else node = this.shoukaku.getNode('auto');

    if (!options.deaf) options.deaf = false;
    if (!options.mute) options.mute = false;

    if (!node) throw new KazagumoError(3, 'No node found');

    const shoukakuPlayer = await node.joinChannel({
      guildId: options.guildId as string,
      channelId: options.voiceId as string,
      deaf: options.deaf,
      mute: options.mute,
      shardId: options.shardId && !isNaN(options.shardId) ? options.shardId : 0,
    });

    const kazagumoPlayer = new (this.KazagumoOptions.extends?.player ?? KazagumoPlayer)(
      this,
      shoukakuPlayer,
      {
        guildId: options.guildId,
        voiceId: options.voiceId,
        textId: options.textId,
        deaf: options.deaf,
        volume: isNaN(Number(options.volume)) ? 100 : (options.volume as number),
      },
      options.data,
    );
    this.players.set(options.guildId, kazagumoPlayer);
    this.emit(Events.PlayerCreate, kazagumoPlayer);
    return kazagumoPlayer;
  }

  /**
   * Get a player by guildId.
   * @param guildId Guild ID
   * @returns KazagumoPlayer | undefined
   */
  public getPlayer<T extends KazagumoPlayer>(guildId: Snowflake): (T | KazagumoPlayer) | undefined {
    return this.players.get(guildId);
  }

  /**
   * Destroy a player.
   * @param guildId Guild ID
   * @returns void
   */
  public destroyPlayer<T extends KazagumoPlayer>(guildId: Snowflake): void {
    const player = this.getPlayer<T>(guildId);
    if (!player) return;
    player.destroy();
    this.players.delete(guildId);
  }

  /**
   * Get a least used node.
   * @returns Node
   */
  public getLeastUsedNode(): Node {
    const nodes: Node[] = [...this.shoukaku.nodes.values()];

    const onlineNodes = nodes.filter((node) => node.state === State.CONNECTED);
    if (!onlineNodes.length) throw new KazagumoError(2, 'No nodes are online');

    return onlineNodes.reduce((a, b) => (a.players.size < b.players.size ? a : b));
  }

  /**
   * Search a track by query or uri.
   * @param query Query
   * @param options KazagumoOptions
   * @returns Promise<KazagumoSearchResult>
   */
  public async search(query: string, options?: KazagumoSearchOptions): Promise<KazagumoSearchResult> {
    const node = options?.nodeName ? this.shoukaku.getNode(options.nodeName) : this.getLeastUsedNode();
    if (!node) throw new KazagumoError(3, 'No node is available');

    const source = (SourceIDs as any)[
      (options?.engine && ['youtube', 'youtube_music', 'soundcloud'].includes(options.engine)
        ? options.engine
        : null) ||
        (!!this.KazagumoOptions.defaultSearchEngine &&
        ['youtube', 'youtube_music', 'soundcloud'].includes(this.KazagumoOptions.defaultSearchEngine!)
          ? this.KazagumoOptions.defaultSearchEngine
          : null) ||
        'youtube'
    ];

    const isUrl = /^https?:\/\/.*/.test(query);

    const result = await node.rest.resolve(!isUrl ? `${source}search:${query}` : query).catch((_) => null);
    if (!result) return this.buildSearch(undefined, [], SearchResultTypes.Search);
    this.emit(Events.Debug, `Searched ${query}; Track results: ${result.tracks.length}`);

    let loadType = (isUrl ? 'TRACK' : 'SEARCH') as SearchResultTypes;
    if (result.playlistInfo.name) loadType = SearchResultTypes.Playlist;

    return this.buildSearch(
      result.playlistInfo.name ?? undefined,
      result.tracks.map((track) => new KazagumoTrack(track, options?.requester)),
      loadType,
    );
  }

  private buildSearch(
    playlistName?: string,
    tracks: KazagumoTrack[] = [],
    type?: SearchResultTypes,
  ): KazagumoSearchResult {
    return {
      playlistName,
      tracks,
      type: type ?? SearchResultTypes.Search,
    };
  }
}
