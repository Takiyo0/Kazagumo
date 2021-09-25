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
         * @type {String}
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
        /**
         * Save any data here
         * @type {Map<any, any>}
         */
        this.data = new Map();

        this.player.on("start", () => {
            this.playing = true;
            this.kazagumo.emit("playerStart", this, this.current)
        })
        this.player.on("end", () => {
            if (this.loop === 'track') this.queue.unshift(this.current);
            if (this.loop === 'queue') this.queue.push(this.current);
            this.previous = this.current;
            this.playing = false;
            this.kazagumo.emit("playerEnd", this);
            this.play();
        })
        for (let event of ["closed", "error"]) this.player.on(event, (...args) => {
            this.playing = false;
            this.kazagumo.emit("playerError", this, {type: event, ...args})
        })
        this.player.on("update", (...args) => this.kazagumo.emit("playerUpdate", this, ...args))
        this.player.on("exception", (...args) => this.kazagumo.emit("playerException", this, ...args))
        this.player.on("resumed", () => this.kazagumo.emit("playerResumed", this))

    }

    /**
     * Add a song
     * @returns {kazagumoPlayer}
     * @param {kazagumoTrack} track
     */
    addSong(track) {
        this.queue.push(track);
        return this;
    }

    /**
     * Search for song/link
     * @param {String} query
     * @returns {Promise<{selectedTracks: (*|number), type: (*|null), tracks: (*|*[]), playlistName: (*|null)}|{selectedTracks: number, type: string, tracks, playlistName}>}
     */
    async search(query) {
        return await (new search(this.kazagumo, query)).search();
    }

    /**
     * Play the first song from queue
     * @returns {kazagumoPlayer}
     */
    async play() {
        this.current = this.queue.shift();
        this.playing = true;
        await this.current.resolve();
        this.player.setVolume(1).playTrack(this.current.track);
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
     * @param {?string} mode
     * @returns {kazagumoPlayer}
     */
    setLoop(mode) {
        if (mode && ['off', 'track', 'queue'].includes(mode.toLowerCase())) {
            this.loop = mode;
            return this;
        }
        console.log([mode, this.loop])
        if (this.loop === 'off') this.loop = 'queue';
        if (this.loop === 'queue') this.loop = 'track';
        if (this.loop === 'track') this.loop = 'off';
        console.log([mode, this.loop])
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