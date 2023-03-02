const { verify, sign } = require('jsonwebtoken')
require('dotenv').config()
const httpStatus = require('http-status')

const validateToken = (req, res, next) => {
    //console.log('Cookies: ', req.cookies)
    const accessToken = req.cookies.token
    if(!accessToken) {
        return res.status(httpStatus.FORBIDDEN).send({error: 'Connectez-vous'})
    } else {
        try {
            // console.log('accessToken', accessToken)
            const validToken = verify(accessToken, process.env.TOKEN)
            req.user = validToken
            //  console.log('validToken', validToken)
            if(validToken) {
                return next()
            } 
        } catch (err) {
            // console.log('err', err)
            if(err.name === 'TokenExpiredError') {
                // console.log('ici expired', req.header('accessToken'))
                const refreshToken = req.header('accessToken')
                if(!refreshToken) {
                    return res.status(httpStatus.FORBIDDEN)
                        .clearCookie('token')
                        .send({error: 'Connectez-vous'})
                } else {
                    try {
                        // console.log(refreshToken)
                        const validRefreshToken = verify(refreshToken, process.env.REFRESHTOKEN)
                        // console.log(validToken)
                        if(validRefreshToken) {
                            req.user = validRefreshToken
                            req.accessToken = sign({ id: validRefreshToken.id }, process.env.TOKEN, { expiresIn: process.env.EXPIRETOKEN })
                            req.refreshToken = sign({ id: validRefreshToken.id }, process.env.REFRESHTOKEN, { expiresIn: process.env.EXPIREREFRESHTOKEN })
                            //  console.log('req.refreshToken', req.refreshToken)
                            return next()
                        } else {
                            const validRememberToken = verify(refreshToken, process.env.REMEMBERTOKEN)
                            if(validRememberToken) {
                                req.user = validRememberToken
                                req.accessToken = sign({ id: validRememberToken.id }, process.env.TOKEN, { expiresIn: process.env.EXPIRETOKEN })
                                req.refreshToken = sign({ id: validRememberToken.id }, process.env.REMEMBERTOKEN, { expiresIn: process.env.EXPIREREMEMBERTOKEN })
                                return next()
                            } else {
                                return res.status(httpStatus.FORBIDDEN)
                                    .clearCookie('token')
                                    .send({error: 'Connectez-vous'})
                            }
                        }

                    }
                    catch (err) {
                        return res.status(httpStatus.FORBIDDEN)
                            .clearCookie('token')
                            .send({error: 'Connectez-vous'})
                    }
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).send({error: 'Connectez-vous'})
            }
        }
    }
}

module.exports = { validateToken }