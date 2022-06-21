import { Kazagumo } from '../Kazagumo';
import KazagumoTrack from '../Managers/Supports/KazagumoTrack';

export interface KazagumoOptions {
  defaultSearchEngine: SearchEngines;
  plugins?: KazagumoPlugin[];
  sourceForceResolve?: string[];
  defaultYoutubeThumbnail?: YoutubeThumbnail;
  send: (guildId: string, payload: Payload) => void;
}

export type SearchEngines = 'youtube' | 'soundcloud' | 'youtube_music' | string;
export type YoutubeThumbnail = 'default' | 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault';

export interface Payload {
  /** The OP code */
  op: number;
  d: {
    guild_id: string;
    channel_id: string | null;
    self_mute: boolean;
    self_deaf: boolean;
  };
}

export const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const SourceIDs = {
  youtube: 'yt',
  youtube_music: 'ytm',
  soundcloud: 'sc',
};

export interface KazagumoPlayerOptions {
  guildId: string;
  voiceId: string;
  textId: string;
  deaf: boolean;
}

export interface ResolveOptions {
  overwrite: boolean;
  forceResolve: boolean;
}

export interface CreatePlayerOptions {
  guildId: string;
  voiceId: string;
  textId: string;
  deaf?: boolean;
  mute?: boolean;
  shardId?: number;
  loadBalancer?: boolean;
  nodeName?: string;
}

export interface RawTrack {
  track: string;
  info: {
    title: string;
    uri: string;
    identifier: string;
    sourceName: string;
    isSeekable: boolean;
    isStream: boolean;
    author?: string;
    length?: number;
    position?: number;
    thumbnail?: string;
  };
}

export const Events = {
  // Player events
  PlayerDestroy: 'playerDestroy',
  PlayerCreate: 'playerCreate',
  PlayerStart: 'playerStart',
  PlayerEnd: 'playerEnd',
  PlayerEmpty: 'playerEmpty',
  PlayerClosed: 'playerClosed',
  PlayerUpdate: 'playerUpdate',
  PlayerException: 'playerException',
  PlayerError: 'playerError',
  PlayerResumed: 'playerResumed',
  PlayerResolveError: 'playerResolveError',
  PlayerMoved: 'playerMoved',

  // Kazagumo events
  Debug: 'debug',
};

export interface PlayerMovedChannels {
  oldChannelId?: string | null;
  newChannelId?: string | null;
}

export type PlayerMovedState = 'UNKNOWN' | 'JOINED' | 'LEFT' | 'MOVED';

export interface KazagumoSearchOptions {
  requester: unknown;
  engine: SearchEngines;
}

export interface KazagumoSearchResult {
  type: SearchResultTypes;
  playlistName?: string;
  tracks: KazagumoTrack[];
}

export type SearchResultTypes = 'PLAYLIST' | 'TRACK' | 'SEARCH';

export const SupportedSources = [
  'bandcamp',
  'beam',
  'getyarn',
  'http',
  'local',
  'nico',
  'soundcloud',
  'stream',
  'twitch',
  'vimeo',
  'youtube',
];

export interface PlayOptions {
  noReplace?: boolean;
  pause?: boolean;
  startTime?: number;
  endTime?: number;

  replaceCurrent?: boolean;
}

export enum State {
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  DISCONNECTED,
}

export enum PlayerState {
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  DISCONNECTED,
  DESTROYING,
  DESTROYED,
}

export class KazagumoPlugin {
  public load(kazagumo: Kazagumo): void {
    throw new KazagumoError(1, 'Plugin must implement load()');
  }

  public unload(kazagumo: Kazagumo): void {
    throw new KazagumoError(1, 'Plugin must implement unload()');
  }
}

/* tslint:disable:max-classes-per-file */
export class KazagumoError extends Error {
  public code: number;
  public message: string;
  public constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
