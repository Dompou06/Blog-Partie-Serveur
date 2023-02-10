const express = require('express')
const router = express.Router()
const { Likes } = require('../models')
const { validateToken } = require('../middlewares/Auth')

router.post('/', validateToken, async (req, res)=> {
    const userId = req.user.id
    const postId = req.body.PostId
    const found = await Likes.findOne({
        where: {
            PostId: postId,
            UserId: userId
        }
    })
    let result = {}
    if(!found) {
        await Likes.create({
            PostId: postId,
            UserId: userId
        })
        result.liked = true
        res.send(result)
    } else {
        await Likes.destroy({
            where: {
                PostId: postId,
                UserId: userId
            }
        })
        result.liked = false
        res.send(result)
    }
})

module.exports = router