const petitio = require('petitio');
const error = require('./kazagumoError');

/**
 * Kazagumo spotify manager
 * @class kazagumoSpotify
 */
class kazagumoSpotify {
    /**
     * @param {String} clientId
     * @param {String} clientSecret
     */
    constructor(clientId, clientSecret) {
        this.token = "";
        this.authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        this.API_URL = "https://api.spotify.com/v1";
        this.refresh();
    }

    /**
     * Request to spotify API
     * @param {string} endpoint Endpoint for the request
     * @param {?boolean} [disableBaseURI=false] Whether add or remove base URI on request
     * @returns {Object}
     */
    async request(endpoint, disableBaseURI) {
        return await petitio(disableBaseURI ? endpoint : this.API_URL + endpoint).header("Authorization", this.token).json();
    }

    /**
     * Refresh a token
     * @returns {Promise<number>}
     */
    async refreshToken() {
        const {access_token, expires_in} = await petitio("https://accounts.spotify.com/api/token", "POST")
            .query("grant_type", "client_credentials")
            .header("Authorization", `Basic ${this.authorization}`)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .json();

        if (!access_token) {
            throw new error("Invalid Spotify client.");
        }

        this.token = `Bearer ${access_token}`;
        return expires_in * 1000;
    }

    /**
     * Refresh timeout
     * @returns {void}
     */
    async refresh() {
        setTimeout(() => this.refresh(), await this.refreshToken())
    }
}

module.exports = kazagumoSpotify;