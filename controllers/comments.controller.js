require('dotenv').config()
const httpStatus = require('http-status')

const { Users, Comments } = require('../models')
const options = {
    sameSite: 'strict', 
    path: '/',
    httpOnly: true,
    //En production
    // secure: true,
    expired: new Date(Date.now()) + process.env.EXPIRETOKEN
}

exports.addComment = async (req, res) => {
    const comment = req.body
    //console.log('comment', comment)
    //console.log('req.user', req.user)
    comment.UserId = req.user.id
    await Comments.create(comment)
        .then(result => {
            Users.findByPk(req.user.id,
                {
                    attributes: ['username']
                }).then(user => {
                const item = {
                    id: result.id,
                    username: user.username
                }
                if(req.accessToken) {
                    res.status(httpStatus.OK)
                        .cookie('token', req.accessToken, options)
                        .send({
                            token: req.refreshToken,
                            item: item
                        })
                } else {
                    res.status(httpStatus.OK)
                        .send(item)
                }
            })
        })
}
exports.deleteComment = async (req, res) => {
    //console.log('req.params', req.params)
    const commentId = req.params.commentId
    await  Comments.destroy({
        where: {
            id: commentId
        }
    })
    if(req.accessToken) {
        res.status(httpStatus.OK)
            .cookie('token', req.accessToken, options)
            .send({
                token: req.refreshToken,
            })
    } else {
        res.status(httpStatus.OK).send('Commentaire supprimé') 
    }
}