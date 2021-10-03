const kazagumoTrack = require('./kazagumoTrack');

/**
 * Statics for some constants
 * @class constant
 */
module.exports = {
    /**
     * Options for kazagumo
     * @property {Object} [spotify={}] Spotify configs
     * @property {string} spotify.clientId Spotify client ID
     * @property {string} spotify.clientSecret Spotify client Secret
     * @property {("youtube"|"youtube_music"|"soundcloud")} [defaultSearchEngine="youtube"] Search engine for resolving and search
     * @memberOf constant
     */
    kazagumoOptions: {
        spotify: {
            clientId: null,
            clientSecret: null
        },
        defaultSearchEngine: null
    },

    /**
     * Kagazumo's search result
     * @property {number} selectedTrack
     * @property {("PLAYLIST"|"TRACK"|"SEARCH"|null)} type Result's type
     * @property {void[]|kazagumoTrack[]} tracks Result's tracks
     * @property {null|string} playlistName Playlist's name if it's a playlist
     * @memberOf constant
     */
    searchResult: {
        selectedTrack: 0,
        type: null,
        tracks: [],
        playlistName: ""
    },
    
    supportedSources: [
        'bandcamp',
        'beam',
        'getyarn',
        'http',
        'local',
        'nico',
        'soundcloud',
        'stream',
        'twitch',
        'vimeo',
        'youtube'
    ],
    
    sourceIds: {
        youtube: "yt",
        youtube_music: "ytm",
        soundcloud: "sc"
    }
}