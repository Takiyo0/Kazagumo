export = kazagumoSpotify;
/**
 * Kazagumo spotify manager
 * @class kazagumoSpotify
 */
declare class kazagumoSpotify {
    /**
     * @param {String} clientId
     * @param {String} clientSecret
     */
    constructor(clientId: string, clientSecret: string);
    token: string;
    authorization: string;
    API_URL: string;
    /**
     * Request to spotify API
     * @param {string} endpoint Endpoint for the request
     * @param {?boolean} [disableBaseURI=false] Whether add or remove base URI on request
     * @param {?Object} headers The request header
     * @returns {Object}
     */
    request(endpoint: string, disableBaseURI?: boolean | null, headers?: any | null): any;
    /**
     * Refresh a token
     * @returns {Promise<number>}
     */
    refreshToken(): Promise<number>;
    /**
     * Refresh timeout
     * @returns {void}
     */
    refresh(): void;
}
