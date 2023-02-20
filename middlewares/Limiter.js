const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 5,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    message: 'Le nombre de tentatives est dépassé. Merci de revenir plus tard.',
    handler: (req, res, next, options) => {
        //console.log(options.statusCode)
        // console.log(options.message)
        res.status(options.statusCode).send({error: options.message})}
})
//console.log('limiter',limiter)
module.exports = { limiter }