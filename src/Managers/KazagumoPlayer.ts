import { Kazagumo } from '../Kazagumo';
import { KazagumoQueue } from './Supports/KazagumoQueue';
import {
  FilterOptions,
  Node,
  Player,
  PlayerUpdate,
  TrackExceptionEvent,
  TrackStuckEvent,
  WebSocketClosedEvent,
} from 'shoukaku';
import {
  Events,
  KazagumoError,
  KazagumoPlayerOptions,
  KazagumoSearchOptions,
  KazagumoSearchResult,
  PlayerState,
  PlayOptions,
} from '../Modules/Interfaces';
import { KazagumoTrack } from './Supports/KazagumoTrack';

export class KazagumoPlayer {
  /**
   * Kazagumo options
   */
  private options: KazagumoPlayerOptions;
  /**
   * Kazagumo Instance
   */
  public readonly kazagumo: Kazagumo;
  /**
   * Shoukaku's Player instance
   */
  public shoukaku: Player;
  /**
   * The guild ID of the player
   */
  public readonly guildId: string;
  /**
   * The voice channel ID of the player
   */
  public voiceId: string | null;
  /**
   * The text channel ID of the player
   */
  public textId?: string;
  /**
   * Player's queue
   */
  public readonly queue: KazagumoQueue;
  /**
   * Get the current state of the player
   */
  public state: PlayerState = PlayerState.CONNECTING;
  /**
   * Paused state of the player
   */
  public paused: boolean = false;
  /**
   * Whether the player is playing or not
   */
  public playing: boolean = false;
  /**
   * Loop status
   */
  public loop: 'none' | 'queue' | 'track' = 'none';
  /**
   * Search track/s
   */
  public search: (query: string, options?: KazagumoSearchOptions) => Promise<KazagumoSearchResult>;
  /**
   * Player's volume in percentage (default 100%)
   */
  public volume: number = 100;
  /**
   * Player's custom data
   */
  public readonly data: Map<string, unknown> = new Map();

  /**
   * Initialize the player
   * @param kazagumo Kazagumo instance
   * @param player Shoukaku's Player instance
   * @param options Kazagumo options
   * @param customData private readonly customData
   */
  constructor(
    kazagumo: Kazagumo,
    player: Player,
    options: KazagumoPlayerOptions,
    private readonly customData: unknown,
  ) {
    this.options = options;
    this.kazagumo = kazagumo;
    this.shoukaku = player;
    this.guildId = options.guildId;
    this.voiceId = options.voiceId;
    this.textId = options.textId;
    this.queue = new (this.options.extends?.queue ?? KazagumoQueue)(this);

    if (options.volume !== 100) this.setVolume(options.volume);

    this.search = (typeof this.options.searchWithSameNode === 'boolean' ? this.options.searchWithSameNode : true)
      ? (query: string, opt?: KazagumoSearchOptions) =>
          kazagumo.search.bind(kazagumo)(query, opt ? { ...opt, nodeName: this.shoukaku.node.name } : undefined)
      : kazagumo.search.bind(kazagumo);

    this.shoukaku.on('start', () => {
      this.playing = true;
      this.emit(Events.PlayerStart, this, this.queue.current);
    });

    this.shoukaku.on('end', (data) => {
      // This event emits STOPPED reason when destroying, so return to prevent double emit
      if (this.state === PlayerState.DESTROYING || this.state === PlayerState.DESTROYED)
        return this.emit(Events.Debug, `Player ${this.guildId} destroyed from end event`);

      if (data.reason === 'replaced') return this.emit(Events.PlayerEnd, this);
      if (['loadFailed', 'cleanup'].includes(data.reason)) {
        if (
          this.queue.current &&
          !this.queue.previous.find(
            (x) => x.identifier === this.queue.current?.identifier && x.title === this.queue.current?.title,
          )
        )
          this.queue.previous = [this.queue.current].concat(this.queue.previous);
        this.emit(Events.PlayerEnd, this, this.queue.current);
        this.queue.current = null;
        this.playing = false;
        if (!this.queue.length) return this.emit(Events.PlayerEmpty, this);
        return this.play();
      }

      if (this.loop === 'track' && this.queue.current) this.queue.unshift(this.queue.current);
      if (this.loop === 'queue' && this.queue.current) this.queue.push(this.queue.current);

      if (
        this.queue.current &&
        !this.queue.previous.find(
          (x) => x.identifier === this.queue.current?.identifier && x.title === this.queue.current?.title,
        )
      )
        this.queue.previous = [this.queue.current].concat(this.queue.previous);

      const currentSong = this.queue.current;
      this.emit(Events.PlayerEnd, this, currentSong);
      this.queue.current = null;

      if (!this.queue.length) {
        this.playing = false;
        return this.emit(Events.PlayerEmpty, this);
      }

      return this.play();
    });

    this.shoukaku.on('closed', (data: WebSocketClosedEvent) => {
      this.playing = false;
      this.emit(Events.PlayerClosed, this, data);
    });

    this.shoukaku.on('exception', (data: TrackExceptionEvent) => {
      this.playing = false;
      this.emit(Events.PlayerException, this, data);
    });

    this.shoukaku.on('update', (data: PlayerUpdate) => this.emit(Events.PlayerUpdate, this, data));
    this.shoukaku.on('stuck', (data: TrackStuckEvent) => this.emit(Events.PlayerStuck, this, data));
    this.shoukaku.on('resumed', () => this.emit(Events.PlayerResumed, this));
    // @ts-ignore
    this.shoukaku.on(Events.QueueUpdate, (player: KazagumoPlayer, queue: KazagumoQueue) =>
      this.kazagumo.emit(Events.QueueUpdate, player, queue),
    );
  }

  // /**
  //  * Get volume
  //  */
  // public get volume(): number {
  //   return this.shoukaku.filters.volume || 1;
  // }

  /**
   * Get player position
   */
  public get position(): number {
    return this.shoukaku.position;
  }

  /**
   * Get filters
   */
  public get filters(): FilterOptions {
    return this.shoukaku.filters;
  }

  private get node(): Node {
    return this.shoukaku.node;
  }

  /**
   * Pause the player
   * @param pause Whether to pause or not
   * @returns KazagumoPlayer
   */
  public pause(pause: boolean): KazagumoPlayer {
    if (typeof pause !== 'boolean') throw new KazagumoError(1, 'pause must be a boolean');

    if (this.paused === pause || !this.queue.totalSize) return this;
    this.paused = pause;
    this.playing = !pause;
    this.shoukaku.setPaused(pause);

    return this;
  }

  /**
   * Set text channel
   * @param textId Text channel ID
   * @returns KazagumoPlayer
   */
  public setTextChannel(textId: string): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED) throw new KazagumoError(1, 'Player is already destroyed');

    this.textId = textId;

    return this;
  }

  /**
   * Set voice channel and move the player to the voice channel
   * @param voiceId Voice channel ID
   * @returns KazagumoPlayer
   */
  public setVoiceChannel(voiceId: string): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED) throw new KazagumoError(1, 'Player is already destroyed');
    this.state = PlayerState.CONNECTING;

    this.voiceId = voiceId;
    this.kazagumo.KazagumoOptions.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceId,
        self_mute: false,
        self_deaf: this.options.deaf,
      },
    });

    this.emit(Events.Debug, `Player ${this.guildId} moved to voice channel ${voiceId}`);

    return this;
  }

  /**
   * Get the previous track from the queue
   * @param remove Whether to remove the track from the previous list or not. Best to set to true if you want to play it
   */
  public getPrevious(remove: boolean = false): KazagumoTrack | undefined {
    if (remove) return this.queue.previous.shift();
    return this.queue.previous[0];
  }

  /**
   * Set loop mode
   * @param [loop] Loop mode
   * @returns KazagumoPlayer
   */
  public setLoop(loop?: 'none' | 'queue' | 'track'): KazagumoPlayer {
    if (loop === undefined) {
      if (this.loop === 'none') this.loop = 'queue';
      else if (this.loop === 'queue') this.loop = 'track';
      else if (this.loop === 'track') this.loop = 'none';
      return this;
    }

    if (loop === 'none' || loop === 'queue' || loop === 'track') {
      this.loop = loop;
      return this;
    }

    throw new KazagumoError(1, "loop must be one of 'none', 'queue', 'track'");
  }

  /**
   * Play a track
   * @param track Track to play
   * @param options Play options
   * @returns KazagumoPlayer
   */
  public async play(track?: KazagumoTrack, options?: PlayOptions): Promise<KazagumoPlayer> {
    if (this.state === PlayerState.DESTROYED) throw new KazagumoError(1, 'Player is already destroyed');

    if (track && !(track instanceof KazagumoTrack)) throw new KazagumoError(1, 'track must be a KazagumoTrack');

    if (!track && !this.queue.totalSize) throw new KazagumoError(1, 'No track is available to play');

    if (!options || typeof options.replaceCurrent !== 'boolean') options = { ...options, replaceCurrent: false };

    if (track) {
      if (!options.replaceCurrent && this.queue.current) this.queue.unshift(this.queue.current);
      this.queue.current = track;
    } else if (!this.queue.current) this.queue.current = this.queue.shift();

    if (!this.queue.current) throw new KazagumoError(1, 'No track is available to play');

    const current = this.queue.current;
    current.setKazagumo(this.kazagumo);

    let errorMessage: string | undefined;

    const resolveResult = await current.resolve({ player: this as KazagumoPlayer }).catch((e) => {
      errorMessage = e.message;
      return null;
    });

    if (!resolveResult) {
      this.emit(Events.PlayerResolveError, this, current, errorMessage);
      this.emit(Events.Debug, `Player ${this.guildId} resolve error: ${errorMessage}`);
      this.queue.current = null;
      this.queue.size ? await this.play() : this.emit(Events.PlayerEmpty, this);
      return this;
    }

    let playOptions = { track: { encoded: current.track, userData: current.requester ?? {} } };
    if (options) playOptions = { ...playOptions, ...options };

    await this.shoukaku.playTrack(playOptions);

    return this;
  }

  /**
   * Skip the current track
   * @returns KazagumoPlayer
   */
  public skip(): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED) throw new KazagumoError(1, 'Player is already destroyed');

    this.shoukaku.stopTrack();

    return this;
  }

  /**
   * Seek to a position
   * @param position Position in seconds
   * @returns KazagumoPlayer
   */
  public async seek(position: number): Promise<KazagumoPlayer> {
    if (this.state === PlayerState.DESTROYED) throw new KazagumoError(1, 'Player is already destroyed');
    if (!this.queue.current) throw new KazagumoError(1, "Player has no current track in it's queue");
    if (!this.queue.current.isSeekable) throw new KazagumoError(1, "The current track isn't seekable");

    position = Number(position);

    if (isNaN(position)) throw new KazagumoError(1, 'position must be a number');
    if (position < 0 || position > (this.queue.current.length ?? 0))
      position = Math.max(Math.min(position, this.queue.current.length ?? 0), 0);

    this.queue.current.position = position;
    await this.shoukaku.seekTo(position);

    return this;
  }

  /**
   * Set the volume in percentage (default 100%)
   * @param volume Volume
   * @returns KazagumoPlayer
   */
  public async setVolume(volume: number): Promise<KazagumoPlayer> {
    if (this.state === PlayerState.DESTROYED) throw new KazagumoError(1, 'Player is already destroyed');
    if (isNaN(volume)) throw new KazagumoError(1, 'volume must be a number');

    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        volume,
      },
    });

    this.volume = volume;

    return this;
  }

  /**
   * Connect to the voice channel
   * @returns KazagumoPlayer
   */
  public connect(): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED) throw new KazagumoError(1, 'Player is already destroyed');
    if (this.state === PlayerState.CONNECTED || !!this.voiceId)
      throw new KazagumoError(1, 'Player is already connected');
    this.state = PlayerState.CONNECTING;

    this.kazagumo.KazagumoOptions.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceId,
        self_mute: false,
        self_deaf: this.options.deaf,
      },
    });

    this.state = PlayerState.CONNECTED;

    this.emit(Events.Debug, `Player ${this.guildId} connected`);

    return this;
  }

  /**
   * Disconnect from the voice channel
   * @returns KazagumoPlayer
   */
  public disconnect(): KazagumoPlayer {
    if (this.state === PlayerState.DISCONNECTED || !this.voiceId)
      throw new KazagumoError(1, 'Player is already disconnected');
    this.state = PlayerState.DISCONNECTING;

    this.pause(true);
    this.kazagumo.KazagumoOptions.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: null,
        self_mute: false,
        self_deaf: false,
      },
    });

    this.voiceId = null;
    this.state = PlayerState.DISCONNECTED;

    this.emit(Events.Debug, `Player disconnected; Guild id: ${this.guildId}`);

    return this;
  }

  /**
   * Destroy the player
   * @returns KazagumoPlayer
   */
  async destroy(): Promise<KazagumoPlayer> {
    if (this.state === PlayerState.DESTROYING || this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, 'Player is already destroyed');

    this.disconnect();
    this.state = PlayerState.DESTROYING;
    this.shoukaku.clean();
    await this.kazagumo.shoukaku.leaveVoiceChannel(this.guildId);
    await this.shoukaku.destroy();
    this.shoukaku.removeAllListeners();
    this.kazagumo.players.delete(this.guildId);
    this.state = PlayerState.DESTROYED;

    this.emit(Events.PlayerDestroy, this);
    this.emit(Events.Debug, `Player destroyed; Guild id: ${this.guildId}`);

    return this;
  }

  private emit(event: string, ...args: any): void {
    this.kazagumo.emit(event, ...args);
  }
}
