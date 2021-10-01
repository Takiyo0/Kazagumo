const search = require('./kazagumoSearch');
const kazagumoTrack = require('./kazagumoTrack');
const {searchResult} = require('./constants');
const {moveArray} = require('./kazagumoUtils');

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
     * @param {Kazagumo} kazagumo Kazagumo's instance
     * @param {ShoukakuPlayer} player Shoukaku player
     * @param {Object} options Options for this guild
     * @param {string} options.guildId
     * @param {string} options.voiceId
     * @param {string} options.textId
     */
    constructor(kazagumo, player, options) {
        /**
         * Kazagumo
         * @type {Kazagumo}
         */
        this.kazagumo = kazagumo;
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
         * @type {"off"|"track"|"queue"}
         * @readonly
         */
        this.loop = 'off';
        /**
         * Queue for this player
         * @type {kazagumoTrack[]}
         */
        this.queue = [];
        /**
         * Current playing song
         * @type {null|kazagumoTrack}
         */
        this.current = null;
        /**
         * Previous playing song
         * @type {null|kazagumoTrack}
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
        /**
         * Whether to ignore end event to trigger the play func.
         * @type {boolean}
         */
        this.ignoreEnd = true;

        this.player.on("start", (data) => {
            this.playing = true;
            this.kazagumo.emit("playerStart", this, this.current)
        });

        this.player.on("end", (data) => {
            if (data.reason === "REPLACED") return this.kazagumo.emit("playerEnd", this);
            if (this.loop === 'track') this.queue.unshift(this.current);
            if (this.loop === 'queue') this.queue.push(this.current);
            this.previous = this.current;
            this.playing = false;
            if (this.queue.length) this.kazagumo.emit("playerEnd", this);
            else {
                this.playing = false;
                this.current = null;
                return this.kazagumo.emit("playerEmpty", this);
            }
            if (data.reason !== "REPLACED") this.play();
        });

        for (let event of ["closed", "error"]) this.player.on(event, (...args) => {
            this.playing = false;
            this.kazagumo.emit("playerError", this, event, ...args)
        });

        this.player.on("update", (...args) => this.kazagumo.emit("playerUpdate", this, ...args));
        this.player.on("exception", (...args) => this.kazagumo.emit("playerException", this, ...args));
        this.player.on("resumed", () => this.kazagumo.emit("playerResumed", this));
    }

    /**
     * Pause or resume the player
     * @param {boolean} pause
     * @returns {kazagumoPlayer}
     */
    setPaused(pause) {
        this.playing = !pause;
        this.player.setPaused(!!pause)
        return this;
    };

    /**
     * Add a song
     * @returns {kazagumoPlayer}
     * @param {kazagumoTrack} track Track to add
     */
    addSong(track) {
        this.queue.push(track);
        return this;
    };

    /**
     * Search for song/link
     * @returns {Promise<searchResult>}
     * @param {string} query Title/URI to search
     * @param {DiscordUser} requester The requester
     * @param {("youtube"|"youtube_music"|"soundcloud")} [type=kazagumoOptions.defaultSearchEngine|"youtube"] The search engine
     */
    async search(query, requester, type) {
        return await (new search(this.kazagumo, query, type, requester)).search();
    };

    /**
     * Sets the player's voice ID
     * @param {string} voiceId
     * @returns {kazagumoPlayer}
     */
    setVoiceChannel(voiceId) {
        this.voice = voiceId;
        return this;
    };

    /**
     * Sets the player's text ID
     * @param textId
     * @returns {kazagumoPlayer}
     */
    setTextChannel(textId) {
        this.text = textId;
        return this;
    };

    /**
     * Set player's volume
     * @param {number} value
     * @returns {kazagumoPlayer|{error: boolean, message: string}}
     */
    setVolume(value) {
        if (isNaN(value)) return {
            error: true,
            message: `<kazagumoPlayer>#setVolume() value must be a valid number. Received ${typeof value}`
        };
        this.player.filters.volume = value;
        this.player.connection.node.send({
            op: "volume",
            guildId: this.guild,
            volume: this.player.filters.volume
        })
        return this;
    };

    /**
     * Play the first song from queue
     * @param {?kazagumoTrack} [kazagumoTrack]
     * @param {boolean} [removeCurrent=false] Whether to remove the current song when forcing track to be played
     * @returns {kazagumoPlayer}
     */
    async play(kazagumoTrack, removeCurrent = false) {
        if (kazagumoTrack) {
            if (!removeCurrent) this.queue.unshift(this.current);
            this.current = kazagumoTrack;
        } else this.current = this.queue.shift();

        this.playing = true;
        if (!await this.current.resolve().catch(() => null)) return this.player.stopTrack();
        this.player.setVolume(1).playTrack(this.current.track, {noReplace: false});
        return this;
    };

    /**
     * Pause the player
     * @returns {kazagumoPlayer}
     */
    pause() {
        this.playing = false;
        this.player.setPaused(true);
        return this;
    };

    /**
     * Set loop
     * @param {?string} [mode]
     * @returns {kazagumoPlayer}
     */
    setLoop(mode) {
        if (mode && ['off', 'track', 'queue'].includes(mode.toLowerCase())) {
            this.loop = mode;
            return this;
        }
        if (this.loop === 'off') this.loop = 'queue';
        else if (this.loop === 'queue') this.loop = 'track';
        else if (this.loop === 'track') this.loop = 'off';
        return this;
    };

    /**
     * Move a song to a specific index
     * @param {number} oldIndex
     * @param {number} newIndex
     * @returns {kazagumoPlayer|{error: boolean, message: string}}
     */
    move(oldIndex, newIndex) {
        if ([oldIndex, newIndex].some(x => isNaN(x))) return {error: true, message: "Invalid number"};
        if (oldIndex + 1 > this.queue.length || newIndex + 1 > this.queue.length) return {
            error: true,
            message: "Invalid index"
        }
        moveArray(this.queue, oldIndex, newIndex);
        return this;
    };

    /**
     * Shuffle the queue
     * @returns {kazagumoPlayer}
     */
    shuffle() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
        return this;
    };

    /**
     * Destroy the player
     * @returns {kazagumoPlayer}
     */
    destroy() {
        this.queue = [];
        this.player.connection.disconnect();
        this.kazagumo.players.delete(this.guild);
        this.kazagumo.emit('playerDestroy', this);
        this.kazagumo.emit("debug", `Player was destroyed | Guild ID: ${this.guild}`)
        return this;
    };
}

module.exports = kazagumoPlayer;
