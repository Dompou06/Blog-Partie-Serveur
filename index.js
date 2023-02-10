const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')

app.use(express.json())
app.use(cors())
app.use(helmet())
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
    app.listen(3001, () => {
        console.log('Server running on port 3001')
    })
})
