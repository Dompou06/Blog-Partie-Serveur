const express = require('express')
const router = express.Router()

const userController = require('../controllers/user.controller')

const bcrypt = require('bcrypt')
const httpStatus = require('http-status')
const { Users } = require('../models')
const { validateToken } = require('../middlewares/Auth')

router.post('/', userController.signup)
router.post('/login', userController.login)
router.get('/auth', validateToken, userController.authentification)
router.get('/passwordforget', userController.passwordForget)
router.get('/basicinfo/:id', userController.profilePost)
router.put('/profile', validateToken, userController.updateProfile)
router.put('/changepassword', validateToken, async (req, res) => {
    const idUser = req.user.id
    const { oldPassword, newPassword } = req.body
    const user = await Users.findOne({
        where: {
            id: idUser
        },
        attributes: ['id', 'password']
    })
    // console.log(req.body.oldPassword, user.password)
    bcrypt.compare(oldPassword, user.password).then(match => {
        if(!match) {
            //console.log('no1')
            res.status(httpStatus.UNAUTHORIZED).send({error: 'Mot de passe invalide'})
        } else {
            //console.log('ok')
            bcrypt.hash(newPassword, 10).then(hash => {
                //const userUpdated = Users.findByPk(idUser)
                user.update({ password: hash })
                user.save()
                res.status(httpStatus.OK).send('Nouveau mot de passe validé')
            })
        }
    }).catch(() => {
        // console.log('no2')
        res.status(httpStatus.UNAUTHORIZED).send({error: 'reconnectez-vous'})
    } 
    )
})

module.exports = router