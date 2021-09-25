const error = require('./kazagumoError');
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Kazagumo Track
 * @class kazagumoTrack
 */
class kazagumoTrack {
    /**
     * Kazagumo Track's information
     * @param kazagumoRawTrack
     * @param kazagumo
     */
    constructor(kazagumoRawTrack, kazagumo) {
        this.track = kazagumoRawTrack.track;
        this.sourceName = kazagumoRawTrack.info.sourceName;
        this.identifier = kazagumoRawTrack.info.identifier;
        this.isSeekable = !!kazagumoRawTrack.info.isSeekable;
        this.author = kazagumoRawTrack.info.author;
        this.length = kazagumoRawTrack.info.length;
        this.isStream = !!kazagumoRawTrack.info.isStream;
        this.position = kazagumoRawTrack.info.position;
        this.title = kazagumoRawTrack.info.title;
        this.uri = kazagumoRawTrack.info.uri;
        this.realUri = kazagumoRawTrack.info.realUri;
        /**
         * @private
         */
        this.kazagumo = kazagumo;
    }

    /**
     * Resolve all required metadata of the song
     * @param overwrite
     * @returns {Promise<kazagumoTrack>}
     */
    async resolve(overwrite) {
        if (this.checkValidation()) return this;
        const result = await this.getTrack();
        this.track = result.track;
        this.realUri = result.info.uri;
        if (overwrite) {
            this.title = result.info.title;
            this.identifier = result.info.identifier;
            this.isSeekable = result.info.isSeekable;
            this.author = result.info.author;
            this.length = result.info.length;
            this.isStream = result.info.isStream;
            this.uri = result.info.uri;
        }
        return this;
    }

    /**
     * Get track metadata from node
     * @private
     * @returns {Promise<ShoukakuTrack>}
     */
    async getTrack() {
        const sources = {
            "youtube": "yt",
            "youtube_music": "ytm",
            "soundcloud": "sc"
        };
        const source = sources[this.kazagumo._kazagumoOptions.defaultSearchEngine || "youtube"];
        const query = [this.author, this.title].filter(x => !!x).join(" - ");
        const node = this.kazagumo.shoukaku.getNode();

        const result = await node.rest.resolve(`${source}search:${query}`);
        if (!result || !result.tracks.length) throw new error("No track was found");

        if (this.author) {
            const author = [this.author, `${this.author} - Topic`];
            const officialTrack = result.tracks.find(track => author.some(name => new RegExp(`^${escapeRegExp(name)}$`, "i").test(track.info.author)) ||
                new RegExp(`^${escapeRegExp(this.title)}$`, "i").test(track.info.title))
            if (officialTrack) return officialTrack;
        }
        if (this.length) {
            const sameDuration = result.tracks.find(track => (track.info.length >= (this.length - 2000)) && (track.info.length <= (this.length + 2000)));
            if (sameDuration) return sameDuration;
        }

        return result.tracks[0];
    }

    /**
     * Validate if we need to resolve again or not
     * @private
     * @returns {*}
     */
    checkValidation() {
        return this.track &&
            this.sourceName &&
            this.identifier &&
            this.author &&
            this.length &&
            this.title &&
            this.uri &&
            this.realUri
    }
}

module.exports = kazagumoTrack;