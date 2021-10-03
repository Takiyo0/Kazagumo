export = kazagumoTrack;
/**
 * Discord User
 * @external DiscordUser
 * @see {@link https://discord.js.org/#/docs/main/stable/class/User}
 */
/**
 * Kazagumo Track
 * @class kazagumoTrack
 */
declare class kazagumoTrack {
    /**
     * Kazagumo Track's information
     * @param {Object} kazagumoRawTrack
     * @param {string} kazagumoRawTrack.track The Base64 string of this song
     * @param {Object} kazagumoRawTrack.info Information of this song
     * @property {string} kazagumoRawTrack.info.sourceName The source name
     * @property {string} [kazagumoRawTrack.info.identifier] The song's identifier
     * @property {boolean} [kazagumoRawTrack.info.isSeekable=false] Whether the song is seekable or not
     * @property {string} [kazagumoRawTrack.info.author] The song's author
     * @property {number} [kazagumoRawTrack.info.length=0] The song's length
     * @property {boolean} [kazagumoRawTrack.info.isStream=false] Whether the song is stream or not
     * @property {number} [kazagumoRawTrack.info.position=0] The song's start position
     * @property {string} [kazagumoRawTrack.info.thumbnail] The song's thumbnail
     * @property {string} kazagumoRawTrack.info.title The song's title
     * @property {string} kazagumoRawTrack.info.uri The song's uri that will be shown
     * @property {string} [kazagumoRawTrack.info.realUri] The real uri of this song, good to hide spotify track
     * @param {Kazagumo} kazagumo Kazagumo's instance
     * @param {DiscordUser} [requester=null] The requester of this song
     */
    constructor(kazagumoRawTrack: {
        track: string;
        info: any;
    }, kazagumo: any, requester?: any);
    track: string;
    sourceName: any;
    identifier: any;
    isSeekable: boolean;
    author: any;
    length: any;
    isStream: boolean;
    position: any;
    thumbnail: any;
    title: any;
    uri: any;
    realUri: any;
    requester: any;
    /**
     * @private
     */
    private kazagumo;
    /**
     * Whether the track has been resolved automatically when the track's source is in resolveSource option
     * @private
     */
    private resolvedBySource;
    /**
     * Resolve all required metadata of the song
     * @param {boolean} [overwrite=false] Overwrite all the track's data
     * @param {boolean} [forceResolve=false] Force the track to be resolved again
     * @returns {Promise<kazagumoTrack>}
     */
    resolve(overwrite?: boolean, forceResolve?: boolean): Promise<kazagumoTrack>;
    /**
     * Get track metadata from node
     * @private
     * @returns {Promise<ShoukakuTrack>}
     */
    private getTrack;
    /**
     * Set requester for this track
     * @param {DiscordUser} discordUser
     * @returns {kazagumoTrack}
     */
    setRequester(discordUser: any): kazagumoTrack;
    /**
     * Get thumbnail for the track
     * @private
     */
    private getThumbnail;
    /**
     * Check if the track's source is internally supported by lavalink to prevent multiple track resolving
     * @returns {boolean}
     * @private
     */
    private checkSupportedSource;
    /**
     * Validate if we need to resolve again or not
     * @private
     * @returns {*}
     */
    private checkValidation;
}
