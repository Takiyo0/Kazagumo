class kazagumoError extends Error {
    constructor(message) {
        super(message)
        this.name = 'kazagumoError'
        Error.captureStackTrace(this, ChinoError)
    }
}

module.exports = kazagumoError;