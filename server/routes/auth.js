import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../Model/User.js'

const authRouter = express.Router()

authRouter.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user)
      return res
        .status(406)
        .send({ error: true, message: 'Email already in use' })
  })

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password),
  })

  newUser
    .save()
    .then(user => {
      res.status(200).json(user)
      return
    })
    .catch(error => {
      res.status(500).json(error)
    })
})

authRouter.get('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      console.log(user)
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        res.status(200).json(user)
        return
      }
      res.status(401).send({ err: true, message: 'Invalid email or password' })
    })
    .catch(error => {
      res.status(500).json(error)
    })
})

export default authRouter
