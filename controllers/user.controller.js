require('dotenv').config()
const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const { sign } = require('jsonwebtoken')

const { Users, Posts } = require('../models')

exports.signup = async (req, res) => {
    const { username, password } = req.body
    const user = await Users.findOne({
        where: {
            username: username
        }
    })
    if(!user) {
        bcrypt.hash(password, 10).then(hash => {
            Users.create({
                username: username,
                password: hash
            })
            res.status(httpStatus.OK).send('Success')
        })
    } else {
        res.status(httpStatus.UNAUTHORIZED).send({error: 'Cet identifiant est déà octroyé'})
    }
}
exports.login = async (req, res) => {
    const { username, password } = req.body
    const user = await Users.findOne({
        where: {
            username: username
        }
    })
    if(!user) {
        res.status(httpStatus.UNAUTHORIZED).send({error: 'L\'utilisateur est inconnu'})
    } else {
        bcrypt.compare(password, user.password).then(match => {
            if(!match) {
                res.status(httpStatus.UNAUTHORIZED).send({error: 'Mot de passe invalide'})
            } else {
                const accessToken = sign({ id: user.id }, 'importantsecret')
                res.status(httpStatus.OK).send({
                    token: accessToken,
                    username: user.username, 
                    id: user.id
                })
            }
        })
    }
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
    const id = req.params.id
    const userId = await Posts.findByPk(id, {
        attributes: ['UserId']
    })
    const basicInfo = await Users.findByPk(userId, {
        attributes: ['username']
    })
    res.send(basicInfo)
}