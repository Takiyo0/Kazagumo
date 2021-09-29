export = kazagumoSearch;
/**
 * Kazagumo search
 * @class kazagumoSearch
 */
declare class kazagumoSearch {
    /**
     * @param {Kazagumo} kazagumo Kazagumo
     * @param {string} url The query itself
     * @param {string} [type=kazagumoOptions.defaultSearchEngine|"youtube"] The search type for non link query
     * @param {DiscordUser} requester The user who request
     */
    constructor(kazagumo: any, url: string, type?: string, requester: any);
    kazagumo: any;
    url: string;
    type: string;
    requester: any;
    /**
     * Start searching for the track
     * @returns {Promise<searchResult>}
     */
    search(): Promise<{
        selectedTrack: number;
        type: null;
        tracks: undefined[];
        playlistName: string;
    }>;
    /**
     * Handle spotify
     * @param {String} url
     * @returns {Promise<Array>}
     * @private
     */
    private spotifyURIHandler;
    /**
     * Get spotify track metadata
     * @param {String} id
     * @returns {Promise<{tracks: (void[]|kazagumoTrack[]), playlistName: null}>}
     * @private
     */
    private getSpotifyTrack;
    /**
     * Get spotify playlist tracks metadata
     * @param {String} id
     * @returns {Promise<{tracks: void[]|kazagumoTrack[], playlistName: null}>}
     * @private
     */
    private getPlaylistTracks;
    /**
     * Get spotify album tracks metadata
     * @param {String} id
     * @returns {Promise<{tracks: void[]|kazagumoTrack[], playlistName: null}>}
     * @private
     */
    private getAlbumTracks;
    /**
     * Filter any unavailable spotify track
     * @returns {kazagumoTrack}
     * @param {Object} spotifyTrack Spotify raw track
     * @param {string} [thumbnail=spotifyTrack.album.images[0].url] Track's thumbnail
     * @private
     */
    private buildKazagumoTrack;
    /**
     * Filter any unavailable spotify track
     * @returns {Boolean}
     * @param {Object} spotifyTrack
     * @private
     */
    private filterSpotifyTrack;
}
