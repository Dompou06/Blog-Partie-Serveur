require('dotenv').config()
const httpStatus = require('http-status')

const { Users, Posts, Likes } = require('../models')

exports.addPost = async (req, res) => {
    let post = req.body
    post.UserId = req.user.id
    await Posts.create(post)
        .then(result => {
            // console.log(result)
            const id = result.id
            res.status(httpStatus.OK).json(id)
        })
}
exports.onePost = async (req, res) => {
    const id = req.params.id
    const post = await Posts.findByPk(id, {
        include: [Likes, {
            model: Users,
            attributes: ['username']
        }] 
    })
    //const user = await Users.findByPk(post.UserId)
    // console.log(user.username)
    // const username = user.username
    res.send(post)
}
exports.allPosts = async (req, res) => {
    let listOfPosts = await Posts.findAll({
        order: [
            ['createdAt', 'DESC']
        ],
        include: [Likes, {
            model: Users,
            attributes: ['username']
        }]
    })
    if(req.user){
        const likedPosts = await Likes.findAll({
            where: {
                userId: req.user.id 
            }
        })
        res.send({
            listOfPosts: listOfPosts,
            likedPosts: likedPosts
        })
    } else {
        res.send(
            listOfPosts
        )
    }
}
exports.postsLiked = async (req, res) => {
    const idUser = req.user.id
    let userId = {}
    let right = false
    if(req.params.id.includes('user')) {
        //console.log('req.params.id.split(user)[0]', req.params.id)       
        userId.UserId = req.params.id.replace('user','')
        right = true
    } else {
        const id = req.params.id
        userId = await Posts.findByPk(id, {
            attributes: ['UserId']
        })
        if(userId.UserId === idUser) {
            right = true
        }
    }
    // console.log('userId', userId.UserId)
    const likedPosts = await Posts.findAll(
        {
            where: {
                UserId: userId.UserId
            },
            include: [ {
                model: Likes,
                where: {
                    UserId: idUser
                },
                attributes: ['PostId'],
            }],
            attributes: []
        })
    /* const listOfPosts = await Posts.findAll({
        where: {
            UserId: id
        },
        include: [Likes]
    })*/
    /*const likedPosts = await Likes.findAll({
        where: {
            userId: id 
        }
    })*/
    // console.log('likedPosts', likedPosts)
    res.send({
        right: right,
        likedPosts})
    /*res.send({
       //listOfPosts: listOfPosts,
        likedPosts: likedPosts
    })*/
}
exports.updatePost = async (req, res) => {
    // console.log(req.body.newTitle)
    const id = req.params.id
    if(req.body.newTitle) {
        //console.log(req.body.newTitle)
        const newTitle = req.body.newTitle
        const post = await Posts.findByPk(id)
        await post.update({ title: newTitle })
        await post.save()
    } else {
        // console.log(req.body.newBody)       
        const post = await Posts.findByPk(id)
        await post.update({ postText: req.body.newBody })
        await post.save()
    }
    res.send('Post mis à jour')
}
exports.deletePost = async (req, res) => {
    const id = req.params.id
    await Posts.destroy({
        where: {
            id: id
        } 
    })
    res.send('Post supprimé')
}
