require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(helmet())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

const db = require('./models')

const postRouter = require('./routes/Posts')
const commentRouter = require('./routes/Comments')
const userRouter = require('./routes/Users')
const likesRouter = require('./routes/Likes')
app.use('/posts', postRouter)
app.use('/comments', commentRouter)
app.use('/auth', userRouter)
app.use('/like', likesRouter)

db.sequelize.sync().then(() => {
    if(process.env.NODE_ENV != 'production') {
        app.listen(process.env.PORT_DEV, () => {
            console.log('Server running on port 3001')
        })
    } else {
        app.listen(process.env.PORT, () => {
            console.log('Server running on port 3001')
        })

    }
    
})
