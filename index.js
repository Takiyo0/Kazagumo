const eventEmitter = require('events');
const {Shoukaku, Libraries} = require('shoukaku');
const player = require('./src/kazagumoPlayer');
const error = require('./src/kazagumoError');
const spotify = require('./src/kazagumoSpotify');

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
class Kazagumo extends eventEmitter {
    /**
     * @param {DiscordClient} client Your discord client
     * @param {ShoukakuNode} nodes An array of Shoukaku nodes
     * @param {ShoukakuOptions} shoukakuOptions Shoukaku options
     * @param {KazagumoOptions} kazagumoOptions Kazagumo options
     */
    constructor(client, nodes, shoukakuOptions, kazagumoOptions) {
        super();
        this._kazagumoOptions = kazagumoOptions || {};
        this.shoukaku = new Shoukaku(new Libraries.DiscordJS(client), nodes, shoukakuOptions);
        this.spotify = this.checkSpotifySupport(this._kazagumoOptions) ? new spotify(this._kazagumoOptions.spotify.clientId, this._kazagumoOptions.spotify.clientSecret) : null;
        this.client = client;
        this.players = new Map();
    }

    /**
     * Create a new player
     * @param kazagumoPlayerOptions
     * @returns {player}
     */
    async createPlayer(kazagumoPlayerOptions) {
        if (this.players.get(kazagumoPlayerOptions.guildId)) throw new error("Please destroy the player first")
        console.log(kazagumoPlayerOptions)
        const shoukakuPlayer = await this.shoukaku.getNode().joinChannel({
            guildId: kazagumoPlayerOptions.guildId,
            shardId: kazagumoPlayerOptions.shardId || 0,
            channelId: kazagumoPlayerOptions.voiceId
        });
        this.players.set(kazagumoPlayerOptions.guildId, new player(this, shoukakuPlayer, kazagumoPlayerOptions));
        return this.players.get(kazagumoPlayerOptions.guildId);
    }

    /**
     * Check if spotify support is enabled
     * @param {KazagumoOptions} kazagumoOptions
     * @private
     * @returns {Boolean}
     */
    checkSpotifySupport(kazagumoOptions) {
        return kazagumoOptions && kazagumoOptions.spotify && kazagumoOptions.spotify.clientId && kazagumoOptions.spotify.clientSecret
    }
}

module.exports = Kazagumo;
module.exports.kazagumoSpotify = spotify;