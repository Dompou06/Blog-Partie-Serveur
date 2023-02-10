const express = require('express')
const router = express.Router()
const { Comments } = require('../models')
const { validateToken } = require('../middlewares/Auth')

router.get('/:postId', async (req, res) => {
    const postId = req.params.postId
    const comment = await Comments.findAll({
        where: {
            PostId: postId
        }
    })
    res.send(comment)
})
router.post('/', validateToken, async (req, res) => {
    const comment = req.body
    const username = req.user.username
    comment.username = username
    await Comments.create(comment)
        .then(result => {
            const item = {
                id: result.id,
                username: req.user.username
            }
            res.send(item)
        })
})
router.delete('/:commentId', validateToken, async (req, res) => {
    const commentId = req.params.commentId
    console.log(commentId)
    await  Comments.destroy({
        where: {
            id: commentId
        }
    })
    res.send('Commentaire supprimé')
})

module.exports = router
