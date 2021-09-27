import kazagumoTrack from "./src/kazagumoTrack";

export = Kazagumo;
/**
 * Discord.JS Client
 * @external DiscordClient
 * @see {@link https://discord.js.org/#/docs/main/stable/class/Client}
 */
/**
 * Shoukaku Node options
 * @external ShoukakuNode
 * @see {@link https://deivu.github.io/Shoukaku/?api#Constants.nodeOptions}
 */
/**
 * Shoukaku options
 * @external ShoukakuOptions
 * @see {@link https://deivu.github.io/Shoukaku/?api#Constants.shoukakuOptions}
 */
/**
 * Kazagumo options
 * @external KazagumoOptions
 */
/**
 * Initializes kazagumo and shoukaku
 * @class Kazagumo
 * @extends {EventEmitter}
 */
declare class Kazagumo {
    /**
     * @param {DiscordClient} client Your discord client
     * @param {ShoukakuNode} nodes An array of Shoukaku nodes
     * @param {ShoukakuOptions} shoukakuOptions Shoukaku options
     * @param {Object} kazagumoOptions Kazagumo options
     * @param {Object} [kazagumoOptions.spotify={}] Spotify options
     * @param {string} kazagumoOptions.spotify.clientId Spotify client ID
     * @param {string} kazagumoOptions.spotify.clientSecret Spotify client secret
     * @param {"youtube"|"youtube_music"|"soundcloud"} [kazagumoOptions.defaultSearchEngine="youtube"] Default engine for searching tracks
     */
    constructor(client: any, nodes: any, shoukakuOptions: any, kazagumoOptions: {
        spotify?: {
            clientId: string;
            clientSecret: string;
        };
        defaultSearchEngine?: "youtube" | "youtube_music" | "soundcloud";
    });
    /** Kazagumo's options
     * @type {kazagumoOptions|{}}
     * @private
     */
    private _kazagumoOptions;
    /**
     * @type Shoukaku
     */
    shoukaku: Shoukaku;
    /**
     * Spotify request handler
     * @type {kazagumoSpotify|null}
     */
    spotify: kazagumoSpotify | null;
    /**
     * All active players on this instance
     * @type {Map<string, kazagumoPlayer>}
     */
    players: Map<string, kazagumoPlayer>;
    /**
     * Emitted a new player was created
     * @event Kazagumo#playerCreate
     * @param {kazagumoPlayer} kazagumoPlayer The new player
     * @memberOf Kazagumo
     */
    /**
     * Emitted when a player was destroyed
     * @event Kazagumo#playerDestroy
     * @param {kazagumoPlayer} kazagumoPlayer The destroyed player
     * @memberOf Kazagumo
     */
    /**
     * Debug
     * @event Kazagumo#debug
     * @param {string} message Debug message
     * @memberOf Kazagumo
     */
    /**
     * Emitted when a track just played
     * @event Kazagumo#playerStart
     * @param {kazagumoPlayer} kazagumoPlayer The player
     * @param {kazagumoTrack} kazagumoTrack The track that is played
     * @memberOf Kazagumo
     */
    /**
     * Emitted when a track has been finished playing
     * @event Kazagumo#playerEnd
     * @param {kazagumoPlayer} kazagumoPlayer The player
     * @memberOf Kazagumo
     */
    /**
     * Emitted when a track has been finished playing and there's no queue left
     * @event Kazagumo#playerEmpty
     * @param {kazagumoPlayer} kazagumoPlayer The player
     * @memberOf Kazagumo
     */
    /**
     * Emitted when shoukaku emitted 'closed' and 'error' event
     * @event Kazagumo#playerError
     * @param {kazagumoPlayer} kazagumoPlayer The player
     * @param {("closed"|"error")} type Event type
     * @param {Error|Object} error Either the error or the reason
     * @memberOf Kazagumo
     */
    /**
     * Emitted when the lavalink player emits a PlayerUpdate event
     * @event Kazagumo#playerUpdate
     * @param {kazagumoPlayer} kazagumoPlayer The player
     * @param {Object} data
     * @memberOf Kazagumo
     */
    /**
     * Emitted when the lavalink player emits a TrackExceptionEvent
     * @event Kazagumo#playerException
     * @param {kazagumoPlayer} kazagumoPlayer The player
     * @param {Object} reason
     * @memberOf Kazagumo
     */
    /**
     * Emitted when shoukaku resumed this player
     * @event Kazagumo#playerResumed
     * @param {kazagumoPlayer} kazagumoPlayer The player
     * @memberOf Kazagumo
     */
    /**
     * Create a new kazagumoPlayer
     * @async
     * @param {Object} kazagumoPlayerOptions Kazagumo's kazagumoPlayer options
     * @param {string} kazagumoPlayerOptions.guildId Guild ID for the kazagumoPlayer
     * @param {number} [kazagumoPlayerOptions.shardId=0] Shard id
     * @param {string} kazagumoPlayerOptions.voiceId Voice channel ID for the kazagumoPlayer
     * @param {string} kazagumoPlayerOptions.textId Text channel ID for the kazagumoPlayer
     * @param {boolean} [kazagumoPlayerOptions.deaf=false] Deafens the bot
     * @param {boolean} [kazagumoPlayerOptions.mute=false] Mutes the bot
     * @returns {kazagumoPlayer}
     */
    createPlayer(kazagumoPlayerOptions: {
        guildId: string;
        shardId?: number;
        voiceId: string;
        textId: string;
        deaf?: boolean;
        mute?: boolean;
    }): kazagumoPlayer;
    /**
     * Check if kazagumoSpotify support is enabled
     * @private
     * @returns {Boolean}
     */
    private checkSpotifySupport;
}
declare namespace Kazagumo {
    export { kazagumoSpotify, kazagumoUtils };
}

declare interface Kazagumo {
    on(event: 'playerCreate', listener: (player: kazagumoPlayer) => void): this;
    on(event: 'playerDestroy', listener: (player: kazagumoPlayer) => void): this;
    on(event: 'playerStart', listener: (player: kazagumoPlayer, track: kazagumoTrack) => void): this;
    on(event: 'playerEnd', listener: (player: kazagumoPlayer) => void): this;
    on(event: 'playerEmpty', listener: (player: kazagumoPlayer) => void): this;
    on(event: 'playerError', listener: (player: kazagumoPlayer, error: object) => void): this;
    on(event: 'playerException', listener: (player: kazagumoPlayer, exceptionEvents: TrackExceptionEvent[]) => void): this;
    on(event: 'playerUpdate', listener: (player: kazagumoPlayer, playerUpdates: playerUpdate[]) => void): this;
    on(event: 'playerResumed', listener: (player: kazagumoPlayer) => void): this;
    on(event: 'debug', listener: (message: string) => void): this;
}
import { Shoukaku } from "shoukaku";
import kazagumoSpotify = require("./src/kazagumoSpotify");
import kazagumoPlayer = require("./src/kazagumoPlayer");
import kazagumoUtils = require("./src/kazagumoUtils");
