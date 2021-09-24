const Kazagumo = require('../index');
const search = require('./kazagumoSearch');

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
class kazagumoPlayer {
    /**
     * @param {Kazagumo} kazagumo
     * @param {ShoukakuPlayer} player
     * @param {Object} options
     */
    constructor(kazagumo, player, options) {
        /**
         * Kazagumo
         * @type {Kazagumo}
         */
        this.kazagumo = kazagumo;
        /**
         * Discord client
         * @type {DiscordClient}
         */
        this.client = kazagumo.client;
        /**
         * Guild ID
         * @type {String}
         */
        this.guild = options.guildId;
        /**
         * Voice channel ID
         * @type {String}
         */
        this.voice = options.voiceId;
        /**
         * Text ID to send the message
         * @type {String}
         */
        this.text = options.textId;
        /**
         * Shoukaku player
         * @type {ShoukakuPlayer}
         */
        this.player = player;
        /**
         * Loop mode
         * @readonly
         * @type {string}
         */
        this.loop = 'off';
        /**
         * Queue for this player
         * @type {*[]}
         */
        this.queue = [];
        /**
         * Current playing song
         * @type {null|ShoukakuTrack}
         */
        this.current = null;
        /**
         * Previous playing song
         * @type {null|ShoukakuTrack}
         */
        this.previous = null;
        /**
         * Playing status
         * @type {boolean}
         */
        this.playing = false;
    }

    /**
     * Add a song
     * @returns {kazagumoPlayer}
     * @param {ShoukakuTrack} track
     */
    addSong(track) {
        this.queue.push(track);
        return this;
    }

    /**
     * Search a song
     * @returns {search}
     * @param {String} query
     */
    async search(query) {
        return await (new search(this.kazagumo, query)).search();
    }

    /**
     * Play the first song from queue
     * @returns {kazagumoPlayer}
     */
    play() {
        this.current = this.queue.shift();
        this.playing = true;
        this.player.setVolume(1).playTrack(this.current);
        return this;
    }

    /**
     * Pause the player
     * @returns {kazagumoPlayer}
     */
    pause() {
        this.playing = false;
        this.player.setPaused(true);
        return this;
    }

    /**
     * Set loop
     * @param {?String} mode
     */
    setLoop(mode) {
        if (mode && ['off', 'track', 'queue'].includes(mode.toLowerCase())) this.loop = mode;
        if (this.loop === 'off') this.loop = 'queue';
        if (this.loop === 'queue') this.loop = 'track';
        if (this.loop === 'track') this.loop = 'off';
        return this;
    }

    /**
     * Destroy the player
     * @returns {kazagumoPlayer}
     */
    destroy() {
        this.queue = [];
        this.player.connection.disconnect();
        this.kazagumo.players.delete(this.guild);
        this.kazagumo.emit('playerDestroy', this);
        return this;
    }
}

module.exports = kazagumoPlayer;