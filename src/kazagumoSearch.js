const Kazagumo = require('../index');
const shoukakuTrack = require('shoukaku/src/struct/ShoukakuTrack');
const {parse} = require('spotify-uri');

/**
 * Kazagumo search
 * @class kazagumoSearch
 */
class kazagumoSearch {
    /**
     * @param {Kazagumo} kazagumo
     * @param {string} url
     */
    constructor(kazagumo, url) {
        this.kazagumo = kazagumo;
        this.url = url;
    }

    /**
     * Start searching for the track
     * @returns {Promise<{selectedTracks: (*|number), type: (*|null), tracks: (*|*[]), playlistName: (*|null)}|{selectedTracks: number, type: (string), tracks, playlistName}>}
     */
    async search() {
        const spotifyRegex = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album)[\/:]([A-Za-z0-9]+)/;
        const node = this.kazagumo.shoukaku.getNode();
        if (spotifyRegex) {
            const {tracks, playlistName} = await this.spotifyURIHandler(this.url);
            return {
                playlistName: playlistName,
                selectedTracks: 0,
                tracks: tracks,
                type: playlistName ? "PLAYLIST" : "TRACK"
            }
        }
        const result = node.rest.resolve(this.url);
        return {
            playlistName: result.playlistName || null,
            selectedTracks: result.selectedTracks || 0,
            tracks: result.tracks || [],
            type: result.type || null
        }
    }

    /**
     * Handle spotify
     * @param {String} url
     * @returns {Promise<Array>}
     * @private
     */
    async spotifyURIHandler(url) {
        if (/playlist/gi.test(url)) return this.getPlaylistTracks(parse(url).id);
        if (/album/gi.test(url)) return this.getAlbumTracks(parse(url).id);
        if (/track/gi.test(url)) return this.getSpotifyTrack(parse(url).id);
    }

    /**
     * Get spotify track metadata
     * @param {String} id
     * @returns {Promise<Array>}
     * @private
     */
    async getSpotifyTrack(id) {
        const request = await this.kazagumo.spotify.request('/tracks/' + id);
        return {tracks: request.error ? [] : [this.buildShoukakuTrack(request)], playlistName: null}
    }

    /**
     * Get spotify playlist tracks metadata
     * @param {String} id
     * @returns {Promise<Array>}
     * @private
     */
    async getPlaylistTracks(id) {
        const request = await this.kazagumo.spotify.request('/playlists/' + id);
        const tracks = [];
        if (request.error) return {tracks: [], playlistName: null}
        tracks.push(request.tracks.items.filter(this.filterSpotifyTrack).map(track => this.buildShoukakuTrack(track.track)))
        let next = request.tracks.next;

        while (next) {
            const nextPage = await this.kazagumo.spotify.request(next, true);
            tracks.push(...nextPage.items.filter(this.filterSpotifyTrack).map(track => this.buildShoukakuTrack(track.track)));
            next = nextPage.next;
        }
        return {tracks, playlistName: request.name};
    }

    /**
     * Get spotify album tracks metadata
     * @param {String} id
     * @returns {Promise<Array>}
     * @private
     */
    async getAlbumTracks(id) {
        const request = await this.kazagumo.spotify.request('/albums/' + id);
        const tracks = [];
        if (request.error) return {tracks: [], playlistName: null}
        tracks.push(request.tracks.items.filter(this.filterSpotifyTrack).map(track => this.buildShoukakuTrack(track)))
        let next = request.tracks.next;

        while (next) {
            const nextPage = await this.kazagumo.spotify.request(next, true);
            tracks.push(...nextPage.items.filter(this.filterSpotifyTrack).map(track => this.buildShoukakuTrack(track)));
            next = nextPage.next;
        }
        return {tracks, playlistName: request.name};
    }

    /**
     * Filter any unavailable spotify track
     * @returns {shoukakuTrack}
     * @param {Object} spotifyTrack
     * @private
     */
    buildShoukakuTrack(spotifyTrack) {
        return new shoukakuTrack({
            track: "",
            info: {
                sourceName: "spotify",
                identifier: spotifyTrack.id,
                isSeekable: true,
                author: spotifyTrack.artists[0] ? spotifyTrack.artists[0].name : "Unknown",
                length: spotifyTrack.duration_ms,
                isStream: false,
                position: 0,
                title: spotifyTrack.name,
                uri: `https://open.spotify.com/track/${spotifyTrack.id}`
            }
        })
    }

    /**
     * Filter any unavailable spotify track
     * @returns {Boolean}
     * @param {Object} spotifyTrack
     * @private
     */
    filterSpotifyTrack(spotifyTrack) {
        return typeof spotifyTrack !== 'undefined' ? spotifyTrack !== null : typeof spotifyTrack !== 'undefined';
    }
}

module.exports = kazagumoSearch;