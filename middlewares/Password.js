const { verify } = require('jsonwebtoken')
const httpStatus = require('http-status')

const validateId = (req, res, next) => {
    const accessId = req.body.id
    if(!accessId) {
        return res.status(httpStatus.FORBIDDEN).send({error: 'Action non autorisée'})
    } else {
        try {
            const validId = verify(accessId, process.env.PASSWORDSECRET)
            if(validId) {
                req.forget = validId
                return next()
            }
        } catch (err) {
            return res.send({error: err})
        }
    }
}

module.exports = { validateId }