import { EventEmitter } from 'events';
import {
  CreatePlayerOptions,
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
  VoiceState,
} from './Modules/Interfaces';
import {
  Connection,
  Connector,
  LoadType,
  Node,
  NodeOption,
  Player,
  PlayerUpdate,
  Shoukaku,
  ShoukakuOptions,
  Track,
  TrackExceptionEvent,
  TrackStuckEvent,
  VoiceChannelOptions,
  WebSocketClosedEvent,
} from 'shoukaku';

import { KazagumoPlayer } from './Managers/KazagumoPlayer';
import { KazagumoTrack } from './Managers/Supports/KazagumoTrack';
import { KazagumoQueue } from './Managers/Supports/KazagumoQueue';

export interface KazagumoEvents {
  /**
   * Emitted when a track is going to play.
   * @event Kazagumo#playerStart
   */
  playerStart: [player: KazagumoPlayer, track: KazagumoTrack];

  /**
   * Emitted when an error occured while resolving track.
   * @event Kazagumo#playerResolveError
   */
  playerResolveError: [player: KazagumoPlayer, track: KazagumoTrack, message?: string];

  /**
   * Emitted when a player got destroyed.
   * @event Kazagumo#playerDestroy
   */
  playerDestroy: [player: KazagumoPlayer];

  /**
   * Emitted when a player created.
   * @event Kazagumo#playerCreate
   */
  playerCreate: [player: KazagumoPlayer];

  /**
   * Emitted when a track ended.
   * @event Kazagumo#playerEnd
   */
  playerEnd: [player: KazagumoPlayer];

  /**
   * Emitted when a player got empty.
   * @event Kazagumo#playerEmpty
   */
  playerEmpty: [player: KazagumoPlayer];

  /**
   * Emitted when a player got closed.
   * @event Kazagumo#playerClosed
   */
  playerClosed: [player: KazagumoPlayer, data: WebSocketClosedEvent];

  /**
   * Emitted when a player got stuck.
   * @event Kazagumo#playerStuck
   */
  playerStuck: [player: KazagumoPlayer, data: TrackStuckEvent];

  /**
   * Emitted when a player got resumed.
   * @event Kazagumo#playerResumed
   */
  playerResumed: [player: KazagumoPlayer];

  /**
   * Emitted only when you use playerMoved plugin and when the bot moved, joined, or left voice channel.
   * @event Kazagumo#playerMoved
   */
  playerMoved: [player: KazagumoPlayer, state: PlayerMovedState, channels: PlayerMovedChannels];

  /**
   * Emitted when an exception occured.
   * @event Kazagumo#playerException
   */
  playerException: [player: KazagumoPlayer, data: TrackExceptionEvent];

  /**
   * Emitted when a player updated.
   * @event Kazagumo#playerUpdate
   */
  playerUpdate: [player: KazagumoPlayer, data: PlayerUpdate];

  /**
   * Emitted for science purpose.
   * @event Kazagumo#playerUpdate
   */
  // maybe this should be changed
  // 'playerUpdate': [data: unknown];

  /**
   * Emitted when a queue updated (track added, changed, etc).
   * @event Kazagumo#queueUpdate
   */
  queueUpdate: [player: KazagumoPlayer, queue: KazagumoQueue];
}

export declare interface Kazagumo {
  on<K extends keyof KazagumoEvents>(event: K, listener: (...args: KazagumoEvents[K]) => void): this;
  once<K extends keyof KazagumoEvents>(event: K, listener: (...args: KazagumoEvents[K]) => void): this;
  off<K extends keyof KazagumoEvents>(event: K, listener: (...args: KazagumoEvents[K]) => void): this;
  emit(event: string | symbol, ...args: any[]): boolean;
}

export class Kazagumo extends EventEmitter {
  /** Shoukaku instance */
  public shoukaku: Shoukaku;
  /** Kazagumo players */
  public readonly players: Map<string, KazagumoPlayer> = new Map();

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

  // Modified version of Shoukaku#joinVoiceChannel
  // Credit to @deivu
  protected async createVoiceConnection(
    newPlayerOptions: VoiceChannelOptions,
    kazagumoPlayerOptions: CreatePlayerOptions,
  ): Promise<Player> {
    if (this.shoukaku.connections.has(newPlayerOptions.guildId) && this.shoukaku.players.has(newPlayerOptions.guildId))
      return this.shoukaku.players.get(newPlayerOptions.guildId)!;
    if (
      this.shoukaku.connections.has(newPlayerOptions.guildId) &&
      !this.shoukaku.players.has(newPlayerOptions.guildId)
    ) {
      this.shoukaku.connections.get(newPlayerOptions.guildId)!.disconnect();
      // tslint:disable-next-line:no-console
      console.log(
        '[KazagumoError; l220 Kazagumo.ts] -> Connection exist but player not found. Destroying connection...',
      );
    }

    const connection = new Connection(this.shoukaku, newPlayerOptions);
    this.shoukaku.connections.set(connection.guildId, connection);
    try {
      await connection.connect();
    } catch (error) {
      this.shoukaku.connections.delete(newPlayerOptions.guildId);
      throw error;
    }
    try {
      let node;
      if (kazagumoPlayerOptions.loadBalancer) node = await this.getLeastUsedNode();
      else if (kazagumoPlayerOptions.nodeName)
        node = this.shoukaku.nodes.get(kazagumoPlayerOptions.nodeName) ?? (await this.getLeastUsedNode());
      else node = this.shoukaku.options.nodeResolver(this.shoukaku.nodes);
      if (!node) throw new KazagumoError(3, 'No node found');

      const player = this.shoukaku.options.structures.player
        ? new this.shoukaku.options.structures.player(connection.guildId, node)
        : new Player(connection.guildId, node);
      const onUpdate = (state: VoiceState) => {
        if (state !== VoiceState.SESSION_READY) return;
        player.sendServerUpdate(connection);
      };
      await player.sendServerUpdate(connection);
      connection.on('connectionUpdate', onUpdate);
      this.shoukaku.players.set(player.guildId, player);
      return player;
    } catch (error) {
      connection.disconnect();
      this.shoukaku.connections.delete(newPlayerOptions.guildId);
      throw error;
    }
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
    else if (options.nodeName) node = this.shoukaku.nodes.get(options.nodeName) ?? this.getLeastUsedNode();
    else node = this.shoukaku.options.nodeResolver(this.shoukaku.nodes);

    if (!options.deaf) options.deaf = false;
    if (!options.mute) options.mute = false;

    if (!node) throw new KazagumoError(3, 'No node found');

    const shoukakuPlayer = await this.createVoiceConnection(
      {
        guildId: options.guildId as string,
        channelId: options.voiceId as string,
        deaf: options.deaf,
        mute: options.mute,
        shardId: options.shardId && !isNaN(options.shardId) ? options.shardId : 0,
      },
      options,
    );

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
  public getPlayer<T extends KazagumoPlayer>(guildId: string): (T | KazagumoPlayer) | undefined {
    return this.players.get(guildId);
  }

  /**
   * Destroy a player.
   * @param guildId Guild ID
   * @returns void
   */
  public destroyPlayer<T extends KazagumoPlayer>(guildId: string): void {
    const player = this.getPlayer<T>(guildId);
    if (!player) return;
    player.destroy();
    this.players.delete(guildId);
  }

  /**
   * Get the least used node.
   * @param group The group where you want to get the least used nodes there. Case-sensitive, catch the error when there is no such group
   * @returns Node
   */
  public async getLeastUsedNode(group?: string): Promise<Node> {
    const nodes: Node[] = [...this.shoukaku.nodes.values()];

    const onlineNodes = nodes.filter((node) => node.state === State.CONNECTED && (!group || node.group === group));
    if (!onlineNodes.length && group && !nodes.find((x) => x.group === group))
      throw new KazagumoError(2, `There is no such group: ${group}`);
    if (!onlineNodes.length)
      throw new KazagumoError(2, !!group ? `No nodes are online in ${group}` : 'No nodes are online');

    const temp = await Promise.all(
      onlineNodes.map(async (node) => ({
        node,
        players: (await node.rest.getPlayers())
          .filter((x) => this.players.get(x.guildId))
          .map((x) => this.players.get(x.guildId)!)
          .filter((x) => x.shoukaku.node.name === node.name).length,
      })),
    );

    return temp.reduce((a, b) => (a.players < b.players ? a : b)).node;
  }

  /**
   * Search a track by query or uri.
   * @param query Query
   * @param options KazagumoOptions
   * @returns Promise<KazagumoSearchResult>
   */
  public async search(query: string, options?: KazagumoSearchOptions): Promise<KazagumoSearchResult> {
    const node = options?.nodeName
      ? this.shoukaku.nodes.get(options.nodeName) ?? (await this.getLeastUsedNode())
      : await this.getLeastUsedNode();
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
    const customSource = options?.source ?? this.KazagumoOptions.defaultSource ?? `${source}search:`;

    const result = await node.rest.resolve(!isUrl ? `${customSource}${query}` : query).catch((_) => null);
    if (!result || result.loadType === LoadType.EMPTY) return this.buildSearch(undefined, [], 'SEARCH');

    let loadType: SearchResultTypes;
    let normalizedData: {
      playlistName?: string;
      tracks: Track[];
    } = { tracks: [] };
    switch (result.loadType) {
      case LoadType.TRACK: {
        loadType = 'TRACK';
        normalizedData.tracks = [result.data];
        break;
      }

      case LoadType.PLAYLIST: {
        loadType = 'PLAYLIST';
        normalizedData = {
          playlistName: result.data.info.name,
          tracks: result.data.tracks,
        };
        break;
      }

      case LoadType.SEARCH: {
        loadType = 'SEARCH';
        normalizedData.tracks = result.data;
        break;
      }

      default: {
        loadType = 'SEARCH';
        normalizedData.tracks = [];
        break;
      }
    }
    this.emit(Events.Debug, `Searched ${query}; Track results: ${normalizedData.tracks.length}`);

    return this.buildSearch(
      normalizedData.playlistName ?? undefined,
      normalizedData.tracks.map((track) => new KazagumoTrack(track, options?.requester)),
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
      type: type ?? 'SEARCH',
    };
  }
}
