const express = require('express')
const router = express.Router()
const { Posts, Likes } = require('../models')
const { validateToken } = require('../middlewares/Auth') 

const postsController = require('../controllers/posts.controller')

router.get('/', validateToken, postsController.allPosts)
router.get('/notvalidate', postsController.allPosts)
router.get('/notvalidate/byuserid/:id', async (req, res) => {
    const id = req.params.id
    const listOfPosts = await Posts.findAll({
        where: {
            UserId: id
        },
        include: [Likes] 
    })
    console.log(listOfPosts)
    res.send(listOfPosts)
})
router.get('/byuserid/:id', async (req, res) => {
    const id = req.params.id
    const listOfPosts = await Posts.findAll({
        where: {
            UserId: id
        },
        include: [Likes]
    })
    const likedPosts = await Likes.findAll({
        where: {
            userId: id 
        }
    })
    //  console.log(listOfPosts)
    res.send({
        listOfPosts: listOfPosts,
        likedPosts: likedPosts
    })
})
router.get('/byId/:id', postsController.onePost)
router.put('/byId/:id', validateToken, postsController.updatePost)
router.delete('/byId/:id', validateToken, postsController.deletePost)
router.post('/', validateToken, postsController.addPost)

module.exports = router