const express = require('express')
const router = express.Router()
const { Comments, Users } = require('../models')
const { validateToken } = require('../middlewares/Auth')
const commentsController = require('../controllers/comments.controller')

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
router.post('/', validateToken, commentsController.addComment)
router.delete('/:commentId', validateToken, commentsController.deleteComment)

module.exports = router
