class kazagumoError extends Error {
    /**
     * Initializes kazagumo and shoukaku
     * @class kazagumoError
     */
    constructor(message) {
        super(message)
        this.name = 'kazagumoError'
        Error.captureStackTrace(this, kazagumoError)
    }
}

module.exports = kazagumoError;