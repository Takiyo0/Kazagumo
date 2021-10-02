export = kazagumoPlayer;
/**
 * Shoukaku player
 * @external ShoukakuPlayer
 * @see {@link https://deivu.github.io/Shoukaku/?api#ShoukakuPlayer}
 */

/**
 * Shoukaku player
 * @external ShoukakuTrack
 * @see {@link https://deivu.github.io/Shoukaku/?api#ShoukakuTrack}
 */
/**
 * kazagumo player
 * @class kazagumoPlayer
 */
declare class kazagumoPlayer {
    /**
     * @param {Kazagumo} kazagumo Kazagumo's instance
     * @param {ShoukakuPlayer} player Shoukaku player
     * @param {Object} options Options for this guild
     * @param {string} options.guildId
     * @param {string} options.voiceId
     * @param {string} options.textId
     */
    constructor(kazagumo: any, player: any, options: {
        guildId: string;
        voiceId: string;
        textId: string;
    });

    /**
     * Kazagumo
     * @type {Kazagumo}
     */
    kazagumo: any;
    /**
     * Guild ID
     * @type {String}
     */
    guild: string;
    /**
     * Voice channel ID
     * @type {String}
     */
    voice: string;
    /**
     * Text ID to send the message
     * @type {String}
     */
    text: string;
    /**
     * Shoukaku player
     * @type {ShoukakuPlayer}
     */
    player: any;
    /**
     * Loop mode
     * @type {"off"|"track"|"queue"}
     * @readonly
     */
    readonly loop: "off" | "track" | "queue";
    /**
     * Queue for this player
     * @type {kazagumoTrack[]}
     */
    queue: kazagumoTrack[];
    /**
     * Current playing song
     * @type {null|kazagumoTrack}
     */
    current: null | kazagumoTrack;
    /**
     * Previous playing song
     * @type {null|kazagumoTrack}
     */
    previous: null | kazagumoTrack;
    /**
     * Playing status
     * @type {boolean}
     */
    playing: boolean;
    /**
     * Save any data here
     * @type {Map<any, any>}
     */
    data: Map<any, any>;
    /**
     * Whether to ignore end event to trigger the play func.
     * @type {boolean}
     */
    ignoreEnd: boolean;

    /**
     * Pause or resume the player
     * @param {boolean} pause
     * @returns {kazagumoPlayer}
     */
    setPaused(pause: boolean): kazagumoPlayer;

    /**
     * Add a song
     * @returns {kazagumoPlayer}
     * @param {kazagumoTrack} track Track to add
     */
    addSong(track: kazagumoTrack): kazagumoPlayer;

    /**
     * Search for song/link
     * @returns {Promise<searchResult>}
     * @param {string} query Title/URI to search
     * @param {DiscordUser} requester The requester
     * @param {("youtube"|"youtube_music"|"soundcloud")} [type=kazagumoOptions.defaultSearchEngine|"youtube"] The search engine
     */
    search(query: string, requester: any, type?: ("youtube" | "youtube_music" | "soundcloud")): Promise<{
        selectedTrack: number;
        type: null;
        tracks: undefined[];
        playlistName: string;
    }>;

    /**
     * Sets the player's voice ID
     * @param {string} voiceId
     * @returns {kazagumoPlayer}
     */
    setVoiceChannel(voiceId: string): kazagumoPlayer;

    /**
     * Sets the player's text ID
     * @param textId
     * @returns {kazagumoPlayer}
     */
    setTextChannel(textId: any): kazagumoPlayer;

    /**
     * Set player's volume
     * @param {number} value
     * @returns {kazagumoPlayer|{error: boolean, message: string}}
     */
    setVolume(value: number): kazagumoPlayer | {
        error: boolean;
        message: string;
    };

    /**
     * Play the first song from queue
     * @param {?kazagumoTrack} [kazagumoTrack]
     * @param {boolean} [removeCurrent=false] Whether to remove the current song when forcing track to be played
     * @param {Object} [options] The play options
     * @param {number} [options.startTime] When to start in ms
     * @param {number} [options.endTime] When to end in ms
     * @returns {kazagumoPlayer}
     */
    play(kazagumoTrack?: kazagumoTrack | null, removeCurrent?: boolean, options?: { startTime?: number, endTime?: number }): kazagumoPlayer;

    /**
     * Pause the player
     * @returns {kazagumoPlayer}
     */
    pause(): kazagumoPlayer;

    /**
     * Set loop
     * @param {?string} [mode]
     * @returns {kazagumoPlayer}
     */
    setLoop(mode?: string | null): kazagumoPlayer;

    /**
     * Move a song to a specific index
     * @param {number} oldIndex
     * @param {number} newIndex
     * @returns {kazagumoPlayer|{error: boolean, message: string}}
     */
    move(oldIndex: number, newIndex: number): kazagumoPlayer | {
        error: boolean;
        message: string;
    };

    /**
     * Shuffle the queue
     * @returns {kazagumoPlayer}
     */
    shuffle(): kazagumoPlayer;

    /**
     * Destroy the player
     * @returns {kazagumoPlayer}
     */
    destroy(): kazagumoPlayer;
}

import kazagumoTrack = require("./kazagumoTrack");
