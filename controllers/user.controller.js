/* eslint-disable no-inner-declarations */
require('dotenv').config()
const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const crypted = require('../utils/crypt')
const nodemailer = require('nodemailer')
const { sign } = require('jsonwebtoken')

const { Users, Posts, Likes, Auths, Comments, Passwords } = require('../models')
const options = {
    sameSite: 'strict', 
    path: '/',
    httpOnly: true,
    //En production
    // secure: true,
    expired: new Date(Date.now()) + process.env.EXPIRETOKEN
}

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
                    //console.log('result', result.id)  
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
    //console.log(req.body)
    const { email, password, remember } = req.body
    const crytedEmail = crypted.encrypt(email)
    const auth = await Auths.findOne({
        where: {
            email: crytedEmail
        }
    })
    if(!auth) {
        // console.log('!auth')
        res.status(httpStatus.UNAUTHORIZED).send({error: 'L\'utilisateur est inconnu'})
    } else { 
        bcrypt.compare(password, auth.password).then(match => {
            if(!match) {
                // console.log('!match')
                res.status(httpStatus.UNAUTHORIZED).send({error: 'Mot de passe invalide'})
            } else {
                // console.log('match')
                Users.findByPk(auth.UserId, {
                    attributes: ['id','username']
                }).then(user => {
                    //console.log(user.id)
                    const accessToken = sign({ id: user.id }, process.env.TOKEN, { expiresIn: process.env.EXPIRETOKEN })
                    let refreshToken = ''
                    if(remember === true) {
                        refreshToken = sign({ id: user.id }, process.env.REMEMBERTOKEN, { expiresIn: process.env.EXPIREREMEMBERTOKEN })
                    } else {
                        refreshToken = sign({ id: user.id }, process.env.REFRESHTOKEN, { expiresIn: process.env.EXPIREREFRESHTOKEN })
                    }
                    res.status(httpStatus.OK)
                        .cookie('token', accessToken, options)
                        .send({
                            token: refreshToken,
                            username: user.username, 
                            //???
                            // id: user.id
                        })
                    /* .json({
                            token: accessToken,
                            username: user.username, 
                            //???
                            id: user.id
                        })*/
                    // }
                })
            }
        })
    }
} 
exports.logout = async (req, res) => {
    res.status(httpStatus.OK)
        .clearCookie('token')
        .send('Déconnecté')
}
exports.passwordForget = async (req, res) => {
    //  console.log(req.body.email)
    const crytedEmail = crypted.encrypt(req.body.email)
    const auth = await Auths.findOne({
        where: {
            email: crytedEmail
        }    })
    if(!auth) {
        res.status(httpStatus.UNAUTHORIZED).send({error: 'L\'utilisateur est inconnu'})
    } else { 
        //console.log(req.body.email)
        const password = await Passwords.create()
        const key = sign({ id: password.id }, process.env.PASSWORDSECRET)
        //console.log(key)
        let transporter = nodemailer.createTransport({
            host: process.env.MAILHOST,
            port: process.env.MAILPORT,
            auth: {
                user: process.env.MAILUSER,
                pass: process.env.SECRET
            }
        })
        const text = `Bonjour Dominique,\n
            Avez-vous oublié votre mot de passe \n
            Réinitialisation du mot de passe en vous rendant sur la page : http://localhost:3000/resetpassword/${key}\n
            Ce lien expirera dans 24 heures et ne peut être utilisé qu’une seule fois.\n
            Si vous ne souhaitez pas modifier votre mot de passe ou n’êtes pas à l’origine de cette demande, ignorez ce message et supprimez-le.\n
            Merci !\n
            L'équipe du Blog`
        const html = `Bonjour Dominique,
            <p>Avez-vous oublié votre mot de passe ?
            </p>
            <p>
            <a href='http://localhost:3000/resetpassword/${key}'>Réinitialisation du mot de passe</a></p>
            <p>
            Ce lien expirera dans 24 heures et ne peut être utilisé qu’une seule fois.
            </p>
            <p>Si vous ne souhaitez pas modifier votre mot de passe ou n’êtes pas à l’origine de cette demande, ignorez ce message et supprimez-le.
            </p>
            <p>
            Merci !</p>
            L'équipe du Blog
            `
        const mailOptions = {
            from: process.env.MAILUSER,
            to: 'dpourriere@outlook.fr',
            //to: req.body.email,
            subject: 'Réinitialisation du mot de passe de votre compte Blog',
            text: text,
            html: html
        }
        transporter.sendMail(mailOptions, function(error){
            if (error) {
                res.status(httpStatus.NORESPONSE).send({error: 'Erreur email'})
            } else {
                //console.log('Email sent: ' + info.response)
                res.status(httpStatus.OK).send('Mail send')
            }
        })
    }
}
exports.passwordReset = async (req, res) => {
    //console.log(req.body)
    //console.log(req.forget)
    const forget = await Passwords.findOne({
        where: {
            id: req.forget.id
        },
        attributes: ['createdAt']
    })
    if(!forget) {       
        // console.log('!forget')
        res.status(httpStatus.UNAUTHORIZED).send({error: 'Demande non reconnue'})
    } else {
        const created = forget.createdAt
        const thisDay = new Date()
        //  console.log(created)
        //console.log(thisDay)
        const datediff = (thisDay.getTime() - created.getTime())/(60*60*1000)
        if(datediff < 24) {
            //  console.log(req.body.newpassword)
            const crytedEmail = crypted.encrypt(req.body.email)
            const auth = await Auths.findOne({
                where: {
                    email: crytedEmail
                }
            })
            if(auth) {
                //console.log(auth)
                await bcrypt.hash(req.body.newpassword, 10).then(hash => {
                    auth.update({ password: hash })
                    auth.save()
                })
                await Passwords.destroy({
                    where: {
                        id: req.forget.id
                    }
                })
                res.status(httpStatus.OK).send('Mot de passe réinitialisé')
            } else {
                //console.log('!auth')
                res.status(httpStatus.UNAUTHORIZED).send({error: 'Demande non reconnue'})
            }
        } else {
            // console.log('> 24')
            res.status(httpStatus.UNAUTHORIZED).send({error: 'Demande non reconnue'})
        }
    }
}
exports.authentification = async (req, res) => {
    //console.log('req.user', req.user)
    await Users.findByPk(req.user.id, {
        attributes: {
            exclude: ['password', 'id']
        }
    }).then(response => {
        if(response) {
            if(req.accessToken) {
                res.status(httpStatus.OK)
                    .cookie('token', req.accessToken, options)
                    .send({
                        token: req.refreshToken,
                        response: response
                    })
            } else {
                res.status(httpStatus.OK).send(response)
            }
        } else {
            res.status(httpStatus.OK).send('no response')
        }
    })
}
exports.profilePost = async (req, res) => {
    // console.log(req.params.id)
    let userId = {}
    let id =''
    if(req.params.id.includes('comment')) {
        // console.log(req.params.id)
        const split = req.params.id.split('comment')
        // console.log(split[1])
        id = split[1]
        userId = await Comments.findByPk(id, {
            attributes: ['UserId']
        })
        //  console.log(userId)
    } else {
        id = req.params.id 
        userId = await Posts.findByPk(id, {
            attributes: ['UserId']
        })
    }
    
    // }
    const basicInfo = await Users.findByPk(userId.UserId, {
        attributes: ['username', 'presentation'],
        include: [ {
            model: Posts,
            attributes: {exclude: ['UserId']},
            include: [Likes, Comments]
        }]
    })
    res.send(basicInfo)
}
exports.profileMe = async (req, res) => {
    const userId = req.user.id 
    const userInfo = {}
    const basicInfo = await Users.findByPk(userId, {
        attributes: ['username', 'presentation'],
        include: [ {
            model: Posts,
            attributes: {exclude: ['UserId']},
            include: [Likes, Comments]
        },
        {
            model: Auths,
            attributes: {exclude: ['UserId']}
        },
        ]
    })
    userInfo.username = basicInfo.username
    userInfo.presentation = basicInfo.presentation
    userInfo.email = crypted.decrypt(basicInfo.Auth.email)
    if(basicInfo.Auth.mobile) {
        userInfo.mobile = crypted.decrypt(basicInfo.Auth.mobile)
    } else {  
        userInfo.mobile = ''
    }
    if(basicInfo.Auth.tel) {
        userInfo.tel = crypted.decrypt(basicInfo.Auth.tel)
    } else {  
        userInfo.tel = ''
    }
    if(basicInfo.Auth.address) {
        userInfo.address = crypted.decrypt(basicInfo.Auth.address)
    } else {  
        userInfo.address = ''
    }
    if(basicInfo.Auth.cp) {
        userInfo.cp = crypted.decrypt(basicInfo.Auth.cp)
    } else {  
        userInfo.cp = ''
    }
    if(basicInfo.Auth.city) {
        userInfo.city = crypted.decrypt(basicInfo.Auth.city)
    } else {  
        userInfo.city = ''
    }
    userInfo.state = basicInfo.Auth.state
    userInfo.Posts = basicInfo.Posts
    //console.log('basicInfo', email)
    if(req.accessToken) {
        /*console.log('now', {
            token: req.refreshToken,
            basicInfo: basicInfo
        })*/
        res.status(httpStatus.OK)
            .cookie('token', req.accessToken, options)
            .send({
                token: req.refreshToken,
                basicInfo: userInfo
            })
    } else {
        res.status(httpStatus.OK).send({basicInfo: userInfo})
    }
}
exports.updateProfile = async (req, res) => {
    const id = req.user.id
    const field = req.body.field
    
    //console.log(req.body)
    const user = await Users.findByPk(id)
    if(field === 'presentation') {
        await user.update({ [field]: req.body.value })
        await user.save()
    } else {
        let value = ''
        if(field != 'state') {
            value = crypted.encrypt(req.body.value)
        } else {
            value = req.body.value
        }
        const auth = await Auths.findOne({
            where: {
                UserId: user.id
            } 
        })
        await auth.update({ [field]: value })
        await auth.save()
    }
    //console.log('user', user)
    if(req.accessToken) {
        res.status(httpStatus.OK)
            .cookie('token', req.accessToken, options)
            .send({
                token: req.refreshToken
            })
    } else {
        res.send('Présentation mise à jour')
    }
}