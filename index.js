const eventEmitter = require('events');
const {Shoukaku, Libraries: {DiscordJS}} = require('shoukaku');
const {nodeOptions} = require("shoukaku/src/Constants");
const kazagumoSearch = require('./src/kazagumoSearch');
const kazagumoPlayer = require('./src/kazagumoPlayer');
const kazagumoSpotify = require('./src/kazagumoSpotify');
const kazagumoTrack = require('./src/kazagumoTrack');
const kazagumoUtils = require('./src/kazagumoUtils');
const {kazagumoOptions} = require('./src/constants');
const error = require('./src/kazagumoError');

/**
 * Discord.JS Client
 * @external DiscordClient
 * @see {@link https://discord.js.org/#/docs/main/stable/class/Client}
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
class Kazagumo extends eventEmitter {
    /**
     * @param {DiscordClient} client Your discord client
     * @param {nodeOptions[]} nodes An array of Shoukaku nodes
     * @param {ShoukakuOptions} shoukakuOptions Shoukaku options
     * @param {Object} kazagumoOptions Kazagumo options
     * @param {Object} [kazagumoOptions.spotify={}] Spotify options
     * @param {string} kazagumoOptions.spotify.clientId Spotify client ID
     * @param {string} kazagumoOptions.spotify.clientSecret Spotify client secret
     * @param {"youtube"|"youtube_music"|"soundcloud"} [kazagumoOptions.defaultSearchEngine="youtube"] Default engine for searching tracks
     */
    constructor(client, nodes, shoukakuOptions, kazagumoOptions) {
        super();
        /** Kazagumo's options
         * @type {kazagumoOptions|{}}
         */
        this._kazagumoOptions = kazagumoOptions || {};
        /**
         * @type Shoukaku
         */
        this.shoukaku = new Shoukaku(new DiscordJS(client), nodes, shoukakuOptions);
        /**
         * Spotify request handler
         * @type {kazagumoSpotify|null}
         */
        this.spotify = this.checkSpotifySupport() ? new kazagumoSpotify(this._kazagumoOptions.spotify.clientId, this._kazagumoOptions.spotify.clientSecret) : null;
        /**
         * Search for a song/link
         * @param {string} query The link or query to search
         * @param {DiscordUser} [requester=null] The requester of this search
         * @param {"youtube"|"youtube_music"|"soundcloud"} [type=kazagumoOptions.defaultSearchEngine|"youtube"] The search engine name
         * @returns {Promise<searchResult>}
         */
        this.search = (query, requester, type) => new kazagumoSearch(this, query, type, requester).search();
        /**
         * All active players on this instance
         * @type {Map<string, kazagumoPlayer>}
         */
        this.players = new Map();

        this.emit("debug", `Started Kazagumo with Spotify ${this.checkSpotifySupport() ? "enabled" : "disabled"}`);
    }


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
     * @param {kazagumoTrack|null} kazagumoTrack The track that is played
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
     * @param {string} [kazagumoPlayerOptions.node=null] Node for the player
     * @returns {kazagumoPlayer}
     */
    async createPlayer(kazagumoPlayerOptions) {
        if (this.players.get(kazagumoPlayerOptions.guildId)) return this.players.get(kazagumoPlayerOptions.guildId);
        const shoukakuPlayer = await this.shoukaku.getNode(kazagumoPlayerOptions.node ? kazagumoPlayerOptions.node : null).joinChannel({
            guildId: kazagumoPlayerOptions.guildId,
            shardId: kazagumoPlayerOptions.shardId || 0,
            channelId: kazagumoPlayerOptions.voiceId,
            deaf: !!kazagumoPlayerOptions.deaf,
            mute: !!kazagumoPlayerOptions.mute
        });
        this.emit("debug", `New player was created | Guild ID: ${kazagumoPlayerOptions.guildId}`)
        this.players.set(kazagumoPlayerOptions.guildId, new kazagumoPlayer(this, shoukakuPlayer, kazagumoPlayerOptions));
        this.emit("playerCreate", this.players.get(kazagumoPlayerOptions.guildId))
        return this.players.get(kazagumoPlayerOptions.guildId);
    }

    /**
     * Destroy a player
     * @param {string} guildID The player's guild ID
     * @returns {kazagumoPlayer|undefined}
     */
    destroyPlayer(guildID) {
        return this.players.get(guildID) ? this.players.get(guildID).destroy() : undefined;
    }

    /**
     * Check if kazagumoSpotify support is enabled
     * @private
     * @returns {Boolean}
     */
    checkSpotifySupport() {
        return !!this._kazagumoOptions && !!this._kazagumoOptions.spotify && !!this._kazagumoOptions.spotify.clientId && !!this._kazagumoOptions.spotify.clientSecret
    }
}

module.exports = Kazagumo;
module.exports.kazagumoSpotify = kazagumoSpotify;
module.exports.kazagumoUtils = kazagumoUtils;
module.exports.kazagumoTrack = kazagumoTrack;