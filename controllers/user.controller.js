require('dotenv').config()
const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const crypted = require('../utils/crypt')
const { sign } = require('jsonwebtoken')

const { Users, Posts, Likes, Auths } = require('../models')

//Auths.sync({ alter: true })

exports.signup = async (req, res) => {
    const { username, email, password } = req.body
    const user = await Users.findOne({
        where: {
            username: username
        }
    })
    if(!user) {
        const crytedEmail = crypted.encrypt(email)
        const auth = await Auths.findOne({
            where: {
                email: crytedEmail
            }
        })
        if(!auth) { 
            bcrypt.hash(password, 10).then(hash => {
                Users.create(
                    {
                        username: username,
                        presentation: '',
                    }
                ).then(result => {    
                    // console.log('result', result.id)  
                    Auths.create(
                        {
                            password: hash,
                            email: crytedEmail,
                            UserId: result.id
                        })
                    res.status(httpStatus.OK).send('Success')
                })
            })
        } else {
            res.status(httpStatus.UNAUTHORIZED).send({error: 'Vous êtes déjà enregistré'})
        }
    } else {
        res.status(httpStatus.UNAUTHORIZED).send({error: 'Cet identifiant est déjà octroyé'})
    }
}
exports.login = async (req, res) => {
    const { email, password } = req.body
    const crytedEmail = crypted.encrypt(email)
    const auth = await Auths.findOne({
        where: {
            email: crytedEmail
        }
    })
    if(!auth) {
        res.status(httpStatus.UNAUTHORIZED).send({error: 'L\'utilisateur est inconnu'})
    } else { 
        bcrypt.compare(password, auth.password).then(match => {
            if(!match) {
                res.status(httpStatus.UNAUTHORIZED).send({error: 'Mot de passe invalide'})
            } else {
                Users.findByPk(auth.UserId, {
                    attributes: ['id','username']
                }).then(user => {
                    console.log(user.username)
                    const accessToken = sign({ id: user.id }, 'importantsecret')
                    res.status(httpStatus.OK).send({
                        token: accessToken,
                        username: user.username, 
                        id: user.id
                    })
                })
            }
        })
    }
}
exports.passwordForget = async (req, res) => {
}
exports.authentification = async (req, res) => {
    await Users.findByPk(req.user.id, {
        attributes: {
            exclude: ['password']
        }
    }).then(response => {
        if(response) {
            res.status(httpStatus.OK).send(response)
        } else {
            res.status(httpStatus.OK).send('no response')
        }
    })
}
exports.profilePost = async (req, res) => {
    // console.log(req.params.id)
    let userId = {}
    if(req.params.id.includes('user')) {
        //console.log('req.params.id.split(user)[0]', req.params.id)       
        userId.UserId = req.params.id.replace('user','')
    } else {
        userId = await Posts.findByPk(req.params.id, {
            attributes: ['UserId']
        })
    }
    const basicInfo = await Users.findByPk(userId.UserId, {
        attributes: ['username', 'presentation'],
        include: [ {
            model: Posts,
            attributes: {exclude: ['UserId']},
            include: [Likes]
        }]
    })
    res.send(basicInfo)
}
exports.updateProfile = async (req, res) => {
    const id = req.user.id
    const newPresentation = req.body.presentation
    //console.log(req.body)
    const user = await Users.findByPk(id)
    await user.update({ presentation: newPresentation })
    await user.save()
    res.send('Présentation mise à jour')
}