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
     * @param {Kazagumo} kazagumo
     */
    constructor(kazagumoRawTrack: any, kazagumo: any);
    track: any;
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
     * Resolve all required metadata of the song
     * @param {?boolean} [overwrite=false]
     * @returns {Promise<kazagumoTrack>}
     */
    resolve(overwrite?: boolean | null): Promise<kazagumoTrack>;
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
