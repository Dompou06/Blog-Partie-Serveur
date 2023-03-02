const express = require('express')
const router = express.Router()

const userController = require('../controllers/user.controller')

const { validateToken } = require('../middlewares/Auth')
const { validateId } = require('../middlewares/Password')
const { limiter } = require('../middlewares/Limiter')

router.post('/', userController.signup)
router.post('/login', limiter, userController.login)
router.post('/forget', userController.passwordForget)
router.get('/logout', validateToken, userController.logout) //cookie ok
router.get('/auth', validateToken, userController.authentification) //cookie ok
router.get('/passwordforget', userController.passwordForget)
router.post('/resetpassword', validateId, userController.passwordReset)
router.get('/basicinfo/:id', userController.profilePost)
router.get('/me', validateToken, userController.profileMe) //cookie ok
router.put('/profile', validateToken, userController.updateProfile)

module.exports = router