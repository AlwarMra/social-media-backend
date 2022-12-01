import express from 'express'
import mongoose from 'mongoose'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import userRouter from './routes/users.js'
import authRouter from './routes/auth.js'

dotenv.config()
const app = express()

//Mongoose connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Connected to DB')
  })
  .catch(err => {
    console.log(err.message)
  })

process.on('uncaughtException', () => {
  mongoose.connection.close()
})

// Middlewares
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)

app.listen(8800, () => {
  console.log('Server listening on port 8800!')
})
