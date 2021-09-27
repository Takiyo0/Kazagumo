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
     * @param {String} endpoint Endpoint for the request
     * @param {?Boolean} [disableBaseURI=false] Whether add or remove base URI on request
     * @returns {Object}
     */
    request(endpoint: string, disableBaseURI?: boolean | null): any;
    /**
     * Refresh a token
     * @returns {Promise<Number>}
     */
    refreshToken(): Promise<number>;
    /**
     * Refresh timeout
     * @returns {void}
     */
    refresh(): void;
}
