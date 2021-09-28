const axios = require("axios");
const cheerio = require("cheerio");
const error = require('./kazagumoError');

/**
 * Kazagumo apple manager
 * @class kazagumoApple
 */
class kazagumoApple {
    /**
     * Initializes kazagumo apple manager
     */
    constructor() {
    }

    /**
     * Request to spotify API
     * @param {String} endpoint Endpoint for the request
     * @param {?Boolean} [disableBaseURI=false] Whether add or remove base URI on request
     * @returns {void}
     */
    async request(endpoint, disableBaseURI) {
    }

    async getAlbum(url) {
        const response = await axios.get(url);
        const cheer = cheerio.load(response.data);
        let title = cheer(".songs-list-row__song-name").toArray();
        let artist = cheer(".dt-link-to").toArray();
        let album = cheer(".product-name").toArray();
        let tracks = cheer(".songs-list-row__link").toArray();

        let a = tracks[0] ? tracks[0].children[2].prev.data : null;
        artist = artist[0] ? artist.map(x => x.children[1].data).join(", ") : null;

        title = title.map(x => ({
            test: x.prev.prev.prev.prev,
            title: x.lastChild.prev.data,
            artist,
            album: album[0].children[4].data
        }))
        console.log(title)
        // console.log(require('util').inspect(title[0], {showHidden: false, depth: null, colors: true}))

    }

    getAlbumID(url) {
        return url.split("?")[0].split("").filter(x => !isNaN(x)).join("");
    }

    async getAlbumTracks(url) {
        let s = await axios.get(url)
        let $ = cheerio.load(s.data),
            Title = $(".songs-list-row__song-name").toArray(),
            Artist = $(".dt-link-to").toArray(),
            Album = $(".product-name").toArray(),
            Otro = $(`.songs-list-row__link`).toArray(),
            Playlist = []


        let Alterno = Otro[0] ? Otro[0].children[2].prev.data : 'No existe capo'
        let artista = Artist[0] ? Artist[0].children[1].data : Alterno
        let i = 0
        for (i; i < Title.length; i++) {
            Playlist.push({

                title: Title[i].lastChild.prev.data,
                uri: url,
                album: Album[0].children[4].data.replace(/ /g, "").replace(/\n/g, ""),
                artist: `${artista}`,


            });
        }


        let data = Playlist

        let titulo = Album[0].children[4].data.replace(/ /g, "").replace(/\n/g, "")


        const tracks = data.map(track => ({
            title: track.title,
            author: track.artist,
            uri: track.uri
        }));
        return {tracks: tracks.splice(0, 100), name: titulo};

    }
}

new kazagumoApple().getAlbumTracks("https://music.apple.com/id/album/the-greatest-showman-original-motion-picture-soundtrack/1299856714").then(console.log)
// module.exports = kazagumoApple;