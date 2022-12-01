import express from 'express'
import User from '../Model/User.js'

const userRouter = express.Router()

userRouter.get('/', (req, res) => {})

// update user
userRouter.put('/:id', (req, res) => {
  const { id } = req.params

  if (req.body.id === id || req.body.isAdmin) {
    if (req.body.password)
      req.body.password = bcrypt.hashSync(req.body.password)
    User.findByIdAndUpdate(id, { $set: req.body })
      .then(() => {
        res
          .status(200)
          .send({ message: 'Account succesfully updated', updated: true })
      })
      .catch(error => {
        return res.status(500).json(error)
      })
  } else {
    return res.status(400).json({
      error: true,
      message: 'You are not allowed to update and account that is not yours',
    })
  }
})
// delete user
userRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  if (req.body.id === id || req.body.isAdmin) {
    User.findByIdAndRemove(id)
      .then(() => {
        res
          .status(200)
          .send({ delete: true, message: 'Account succesfully deleted' })
      })
      .catch(error => {
        return res.status(500).json(error)
      })
  } else {
    return res.status(400).json({
      error: true,
      message: 'You are not allowed to update and account that is not yours',
    })
  }
})
// get user
userRouter.get('/:id', (req, res) => {
  User.findById(req.params.id)
    .lean()
    .then(user => {
      const { password, ...reqUser } = user
      res.status(200).json(reqUser)
    })
    .catch(error => {
      res.status(500).json(error)
    })
})

// follow
// unfollow

export default userRouter
