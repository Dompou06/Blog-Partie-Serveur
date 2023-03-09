const { verify, sign } = require('jsonwebtoken')
require('dotenv').config()
const httpStatus = require('http-status')

/**
* Validation des token reçus du cookie et du headers 
* @param {String} some req.cookies.token
* @param {String} some req.header('accessToken')
* @return { Promise }
*/
const validateToken = (req, res, next) => {
    const accessToken = req.cookies.token
    if(!accessToken) {
        //Token cookie not exist
        return res.status(httpStatus.FORBIDDEN).send({error: 'Connectez-vous'})
    } else {
        try {
            const validToken = verify(accessToken, process.env.TOKEN)
            req.user = validToken
            if(validToken) {
                //Token cookie valid
                return next()
            } 
        } catch (err) {
            if(err.name === 'TokenExpiredError') {
                //Token cookie expired
                const refreshToken = req.header('accessToken')
                if(!refreshToken) {
                    //Token header not exist
                    return res.status(httpStatus.FORBIDDEN)
                        .clearCookie('token')
                        .send({error: 'Connectez-vous'})
                } else {
                    try {
                        const validRefreshToken = verify(refreshToken, process.env.REFRESHTOKEN)
                        if(validRefreshToken) {
                            //Refreshtoken valid
                            req.user = validRefreshToken
                            //New token cookie and Refreshtoken
                            req.accessToken = sign({ id: validRefreshToken.id }, process.env.TOKEN, { expiresIn: process.env.EXPIRETOKEN })
                            req.refreshToken = sign({ id: validRefreshToken.id }, process.env.REFRESHTOKEN, { expiresIn: process.env.EXPIREREFRESHTOKEN })
                            return next()
                        } 
                    }
                    catch (err) {                                 
                        //Refreshtoken expired or false
                        try {
                            //Refreshtoken is a remeber me ?                                
                            const validRememberToken = verify(refreshToken, process.env.REMEMBERTOKEN)
                            if(validRememberToken) {
                                //Refreshtoken is valid
                                req.user = validRememberToken
                                //New token cookie and Refreshtoken
                                req.accessToken = sign({ id: validRememberToken.id }, process.env.TOKEN, { expiresIn: process.env.EXPIRETOKEN })
                                req.refreshToken = sign({ id: validRememberToken.id }, process.env.REMEMBERTOKEN, { expiresIn: process.env.EXPIREREMEMBERTOKEN })
                                return next()
                            } 
                        } catch(err) {
                            //Refreshtoken is invalid                            
                            return res.status(httpStatus.FORBIDDEN)
                                .clearCookie('token')
                                .send({error: 'Connectez-vous'})
                        }
                    }
                }
            } else {
                //Token cookie invalid
                return res.status(httpStatus.FORBIDDEN).send({error: 'Connectez-vous'})
            }
        }
    }
}

module.exports = { validateToken }