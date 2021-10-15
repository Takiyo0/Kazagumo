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
     * @property {"default"|"hqdefault"|"mqdefault"|"sddefault"|"maxresdefault"} [defaultThumbnail="maxresdefault"] The default thumbnail size for youtube videos
     * @memberOf constant
     */
    kazagumoOptions: {
        spotify: {
            clientId: null,
            clientSecret: null
        },
        defaultSearchEngine: null,
        defaultThumbnail: 'maxresdefault'
    },

    /**
     * Kazagumo's search result
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

    /**
     * Lavalink supported sources
     * @memberOf constant
     */
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

    /**
     * The source ids
     * @property {"yt"} youtube
     * @property {"ytm"} youtube_music
     * @property {"sc"} soundcloud
     * @memberOf constant
     */
    sourceIds: {
        youtube: "yt",
        youtube_music: "ytm",
        soundcloud: "sc"
    }
}