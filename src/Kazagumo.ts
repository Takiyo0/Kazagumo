import { EventEmitter } from 'events';
import {
  KazagumoOptions as KazagumoOptionsOwO,
  KazagumoPlugin,
  KazagumoError,
  CreatePlayerOptions,
  State,
  KazagumoSearchOptions,
  KazagumoSearchResult,
  SourceIDs,
  Events,
  SearchResultTypes,
} from './Modules/Interfaces';
import {
  NodeOption,
  ShoukakuOptions,
  Shoukaku,
  Node,
  WebSocketClosedEvent,
  TrackExceptionEvent,
  PlayerUpdate,
} from 'shoukaku';
import { Connector } from 'shoukaku/dist/src/connectors/Connector';

import KazagumoPlayer from './Managers/KazagumoPlayer';
import KazagumoTrack from './Managers/Supports/KazagumoTrack';

export declare interface Kazagumo {
  /* tslint:disable:unified-signatures */
  /**
   * Emitted when a track is going to play.
   * @event Kazagumo#playerStart
   */
  on(event: 'playerStart', listener: (track: KazagumoTrack) => void): this;
  /**
   * Emitted when an error occured while resolving track.
   * @event Kazagumo#playerResolveError
   */
  on(event: 'playerResolveError', listener: (track: KazagumoTrack) => void): this;
  /**
   * Emitted when a player got destroyed.
   * @event Kazagumo#playerDestroy
   */
  on(event: 'playerDestroy', listener: (player: KazagumoPlayer) => void): this;
  /**
   * Emitted when a track ended.
   * @event Kazagumo#playerEnd
   */
  on(event: 'playerEnd', listener: (player: KazagumoPlayer) => void): this;
  /**
   * Emitted when a player got empty.
   * @event Kazagumo#playerEmpty
   */
  on(event: 'playerEmpty', listener: (player: KazagumoPlayer) => void): this;
  /**
   * Emitted when a player got closed.
   * @event Kazagumo#playerClosed
   */
  on(event: 'playerClosed', listener: (player: KazagumoPlayer, data: WebSocketClosedEvent) => void): this;
  /**
   * Emitted when an exception occured.
   * @event Kazagumo#playerException
   */
  on(event: 'playerException', listener: (player: KazagumoPlayer, data: TrackExceptionEvent) => void): this;
  /**
   * Emitted when a player updated.
   * @event Kazagumo#playerUpdate
   */
  on(event: 'playerUpdate', listener: (player: KazagumoPlayer, data: PlayerUpdate) => void): this;

  on(event: 'debug', listener: (data: unknown) => void): this;
}

export class Kazagumo extends EventEmitter {
  public shoukaku: Shoukaku;
  public readonly players: Map<string, KazagumoPlayer> = new Map();

  constructor(
    public KazagumoOptions: KazagumoOptionsOwO,
    connector: Connector,
    nodes: NodeOption[],
    options: ShoukakuOptions = {},
  ) {
    super();

    this.shoukaku = new Shoukaku(connector, nodes, options);

    if (this.KazagumoOptions.plugins) {
      for (const plugin of this.KazagumoOptions.plugins) {
        if (!(plugin instanceof KazagumoPlugin)) throw new KazagumoError(1, 'Plugin must be an instance of Plugin');
        plugin.load(this);
      }
    }

    this.players = new Map<string, KazagumoPlayer>();
  }

  public async createPlayer(options: CreatePlayerOptions): Promise<KazagumoPlayer> {
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
      guildId: options.guildId,
      channelId: options.voiceId,
      deaf: options.deaf,
      mute: options.mute,
      shardId: options.shardId && !isNaN(options.shardId) ? options.shardId : 0,
    });

    const kazagumoPlayer = new KazagumoPlayer(this, shoukakuPlayer, {
      guildId: options.guildId,
      voiceId: options.voiceId,
      textId: options.textId,
      deaf: options.deaf,
    });
    this.players.set(options.guildId, kazagumoPlayer);
    return kazagumoPlayer;
  }

  public getPlayer(guildId: string): KazagumoPlayer | undefined {
    return this.players.get(guildId);
  }

  public destroyPlayer(guildId: string): void {
    const player = this.getPlayer(guildId);
    if (!player) return;
    player.destroy();
    this.players.delete(guildId);
  }

  public getLeastUsedNode(): Node {
    const nodes: Node[] = [...this.shoukaku.nodes.values()];

    const onlineNodes = nodes.filter((node) => node.state === State.CONNECTED);
    if (!onlineNodes.length) throw new KazagumoError(2, 'No nodes are online');

    const leastUsedNode = onlineNodes.reduce((a, b) => (a.players.size < b.players.size ? a : b));
    return leastUsedNode;
  }

  public async search(query: string, options?: KazagumoSearchOptions): Promise<KazagumoSearchResult> {
    const node = this.getLeastUsedNode();
    if (!node) throw new KazagumoError(3, 'No node is available');

    const source = SourceIDs[options?.engine || this.KazagumoOptions.defaultSearchEngine || 'youtube'];

    const result = await node.rest
      .resolve(!/^https?:\/\//.test(query) ? `${source}search:${query}` : query)
      .catch((_) => null);
    if (!result) return this.buildSearch(undefined, [], 'SEARCH');
    this.emit(Events.Debug, `Searched ${query}; Track results: ${result.tracks.length}`);

    let loadType = 'TRACK' as SearchResultTypes;
    if (result.playlistInfo.name) loadType = 'PLAYLIST';

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
      type: type ?? 'TRACK',
    };
  }
}
