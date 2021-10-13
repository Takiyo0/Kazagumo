const kazagumoTrack = require('./kazagumoTrack');
const {searchResult} = require('./constants');
const {parse} = require('spotify-uri');

/**
 * Kazagumo search
 * @class kazagumoSearch
 */
class kazagumoSearch {
    /**
     * @param {Kazagumo} kazagumo Kazagumo
     * @param {string} url The query itself
     * @param {string} [type=kazagumoOptions.defaultSearchEngine|"youtube"] The search type for non link query
     * @param {DiscordUser} requester The user who request
     */
    constructor(kazagumo, url, type = "", requester) {
        this.kazagumo = kazagumo;
        this.url = url;
        this.type = type;
        this.requester = requester;
        this.kazagumo.emit("debug", `New search request was made | Request: ${this.url}`)
    }


    /**
     * Start searching for the track
     * @returns {Promise<searchResult>}
     */
    async search() {
        const spotifyRegex = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album)[\/:]([A-Za-z0-9]+)/;
        const node = this.kazagumo.shoukaku.getNode();
        const sources = {
            "youtube": "yt",
            "youtube_music": "ytm",
            "soundcloud": "sc"
        };
        const source = sources[this.type || this.kazagumo._kazagumoOptions.defaultSearchEngine || "youtube"];

        if (spotifyRegex.test(this.url)) {
            const {playlistName, tracks} = await this.spotifyURIHandler(this.url);
            return {
                playlistName: `${playlistName}`,
                selectedTrack: 0,
                tracks: tracks,
                type: playlistName ? "PLAYLIST" : "TRACK"
            }
        }
        const result = await node.rest.resolve(!/^https?:\/\//.test(this.url) ? `${source}search:${this.url}` : this.url);
        this.kazagumo.emit("debug", `Requested to node. | Available: ${!!result}; Type: ${result?.type}; Tracks: ${result?.tracks?.length}`)
        if (!result) return {
            playlistName: null,
            selectedTrack: 0,
            tracks: [],
            type: null
        }
        return {
            playlistName: `${result.playlistName}` || null,
            selectedTrack: result.selectedTrack || 0,
            tracks: result.tracks.map(x => new kazagumoTrack(x, this.kazagumo, this.requester)) || [],
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
     * @returns {Promise<{tracks: (void[]|kazagumoTrack[]), playlistName: null}>}
     * @private
     */
    async getSpotifyTrack(id) {
        const request = await this.kazagumo.spotify.request('/tracks/' + id, false);
        this.kazagumo.emit("debug", `Requested Spotify track. | ID: ${id}`)
        return {tracks: request.error ? [] : [this.buildKazagumoTrack(request)], playlistName: null}
    }

    /**
     * Get spotify playlist tracks metadata
     * @param {String} id
     * @returns {Promise<{tracks: void[]|kazagumoTrack[], playlistName: null}>}
     * @private
     */
    async getPlaylistTracks(id) {
        const request = await this.kazagumo.spotify.request('/playlists/' + id);
        const tracks = [];
        if (request.error) return {tracks: [], playlistName: null}
        tracks.push(...request.tracks.items.filter(this.filterSpotifyTrack).map(x => x.track).filter(this.filterSpotifyTrack).map(track => this.buildKazagumoTrack(track)))
        let next = request.tracks.next;

        while (next) {
            const nextPage = await this.kazagumo.spotify.request(next, true);
            tracks.push(...nextPage.items.filter(this.filterSpotifyTrack).map(x => x.track).filter(this.filterSpotifyTrack).map(track => this.buildKazagumoTrack(track)));
            next = nextPage.next;
        }
        this.kazagumo.emit("debug", `Requested Spotify playlist. | ID: ${id}; Name: ${request.name}; Tracks: ${tracks.length}`)
        return {tracks, playlistName: request.name};
    }

    /**
     * Get spotify album tracks metadata
     * @param {String} id
     * @returns {Promise<{tracks: void[]|kazagumoTrack[], playlistName: null}>}
     * @private
     */
    async getAlbumTracks(id) {
        const request = await this.kazagumo.spotify.request('/albums/' + id);
        const tracks = [];
        if (request.error) return {tracks: [], playlistName: null}
        tracks.push(...request.tracks.items.filter(this.filterSpotifyTrack).map(track => this.buildKazagumoTrack(track, request.images[0].url)))
        let next = request.tracks.next;

        while (next) {
            const nextPage = await this.kazagumo.spotify.request(next, true);
            tracks.push(...nextPage.items.filter(this.filterSpotifyTrack).map(track => this.buildKazagumoTrack(track, request.images[0].url)));
            next = nextPage.next;
        }
        this.kazagumo.emit("debug", `Requested Spotify album. | ID: ${id}; Name: ${request.name}; Tracks: ${tracks.length}`)
        return {tracks, playlistName: request.name};
    }

    /**
     * Filter any unavailable spotify track
     * @returns {kazagumoTrack}
     * @param {Object} spotifyTrack Spotify raw track
     * @param {string} [thumbnail=spotifyTrack.album.images[0].url] Track's thumbnail
     * @private
     */
    buildKazagumoTrack(spotifyTrack, thumbnail) {
        return new kazagumoTrack({
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
                uri: `https://open.spotify.com/track/${spotifyTrack.id}`,
                thumbnail: thumbnail ? thumbnail : spotifyTrack.album?.images[0]?.url
            }
        }, this.kazagumo, this.requester)
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