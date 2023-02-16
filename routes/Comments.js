const express = require('express')
const router = express.Router()
const { Comments, Users } = require('../models')
const { validateToken } = require('../middlewares/Auth')

router.get('/:postId', async (req, res) => {
    const postId = req.params.postId
    const comment = await Comments.findAll({
        where: {
            PostId: postId
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [{
            model: Users,
            attributes: ['username']
        }]
    })
    // console.log(comment)
    res.send(comment)
})
router.post('/', validateToken, async (req, res) => {
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
                res.send(item)
            })
        })
})
router.delete('/:commentId', validateToken, async (req, res) => {
    const commentId = req.params.commentId
    await  Comments.destroy({
        where: {
            id: commentId
        }
    })
    res.send('Commentaire supprimé')
})

module.exports = router
