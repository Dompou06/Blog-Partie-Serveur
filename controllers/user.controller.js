/* eslint-disable no-inner-declarations */
require('dotenv').config()
const httpStatus = require('http-status')
const bcrypt = require('bcrypt')
const crypted = require('../utils/crypt')
const nodemailer = require('nodemailer')
const { sign } = require('jsonwebtoken')

const { Users, Posts, Likes, Auths, Comments, Passwords } = require('../models')

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
    const { email, password } = req.body
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
                //    console.log(user.username)
                    const accessToken = sign({ id: user.id }, process.env.TOKENSECRET)
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
    await Users.findByPk(req.user, {
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
    console.log(req.params.id)
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
            include: [Likes, Comments]
        }]
    })
    res.send(basicInfo)
}
exports.updateProfile = async (req, res) => {
    const id = req.user
    const newPresentation = req.body.presentation
    //console.log(req.body)
    const user = await Users.findByPk(id)
    await user.update({ presentation: newPresentation })
    await user.save()
    res.send('Présentation mise à jour')
}