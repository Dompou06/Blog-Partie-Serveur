const { verify } = require('jsonwebtoken')
const httpStatus = require('http-status')

const validateToken = (req, res, next) => {
    const accessToken = req.header('accessToken')
    if(!accessToken) {
        return res.status(httpStatus.FORBIDDEN).send({error: 'Connectez-vous'})
    } else {
        try {
            // console.log('accessToken', accessToken)
            const validToken = verify(accessToken, 'importantsecret')
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