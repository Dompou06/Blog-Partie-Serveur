const { verify } = require('jsonwebtoken')
require('dotenv').config()
const httpStatus = require('http-status')

const validateToken = (req, res, next) => {
    const accessToken = req.header('accessToken')
    if(!accessToken) {
        return res.status(httpStatus.FORBIDDEN).send({error: 'Connectez-vous'})
    } else {
        try {
            // console.log('accessToken', accessToken)
            const validToken = verify(accessToken, process.env.TOKENSECRET)
            req.user = validToken
            // console.log('validToken', validToken)
            if(validToken) {
                return next()
            }
        } catch (err) {
            return res.send({error: err})
        }
    }
}

module.exports = { validateToken }