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
exports.allComments = async (req, res) => {
    // console.log('postId', req.params.postId)
    const postId = req.params.postId
    const comments = await Comments.findAll({
        where: {
            PostId: postId
        },
        order: [
            ['createdAt', 'DESC']
        ],
        attributes: {
            exclude: ['UserId']
        },
        include: [{
            model: Users,
            attributes: ['username']
        }]
    })
    /* if(req.user) {
        const userId = req.user.id
        const commentsUser = await Comments.findAll({
            where: {
                PostId: postId,
                UserId: userId
            },   
            attributes: {
                exclude: ['UserId']
            }
        })
        comments.forEach(comment => {
            let exist = commentsUser.some(user => user.id === comment.id)
            if (exist) { 
                comment.dataValues.right = true
                //console.log(comment.dataValues)
            }
        })
        res.status(httpStatus.OK).send(comments)
    } else {
    //  console.log(comments)
        comments.forEach(comment => {
            comment.dataValues.right = false
        //  console.log(comment.dataValues)
        })
        res.status(httpStatus.OK).send(comments)
    }*/
    //  console.log(comments)
    res.status(httpStatus.OK).send(comments)
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