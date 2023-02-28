require('dotenv').config()

module.exports = {
    secret: process.env.TOKEN,
    //En test
    jwtExpiration: 60,          // 1 minute
    //jwtRefreshExpiration: 120,  // 2 minutes
    // jwtRefreshRemenber: 180,   // 3 minutes
    //En production
    // jwtExpiration: process.env.EXPIRETOKEN,           //1*60*60*1000 1 hour
    jwtRefreshExpiration: process.env.EXPIREREFRESHTOKEN,   //24*60*60*1000 24 hours
    jwtRefreshRemenber: 604800,   // 7 jours
}