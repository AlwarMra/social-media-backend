import express from 'express'
import User from '../Model/User.js'

const userRouter = express.Router()

userRouter.get('/:id', (req, res) => {
  const { id } = req.params
  User.findById(id)
    .then(user => {
      res.status(200).json(user)
    })
    .catch(error => {
      res.status(500).json(error)
    })
})

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
userRouter.put('/:id/follow', async (req, res) => {
  if (req.body.id === req.params.id) {
    res.status(403).send({ error: true, message: 'You cannot follow yourself' })
    return
  }
  try {
    const user = await User.findById(req.params.id)
    const currentUser = await User.findById(req.body.id)
    if (!user.followers.includes(req.body.userId)) {
      await user.updateOne({ $push: { followers: req.body.userId } })
      await currentUser.updateOne({ $push: { followings: req.params.id } })
      res
        .status(200)
        .send({ followed: true, message: 'You followed a new user' })
      return
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

// unfollow
userRouter.put('/:id/unfollow', async (req, res) => {
  if (req.body.id === req.params.id) {
    res.status(403).send({ error: true, message: 'You cannot follow yourself' })
    return
  }
  try {
    const user = await User.findById(req.params.id)
    const currentUser = await User.findById(req.body.id)
    if (user.followers.includes(req.body.userId)) {
      await user.updateOne({ $pull: { followers: req.body.userId } })
      await currentUser.updateOne({ $pull: { followings: req.params.id } })
      res
        .status(200)
        .send({ unfollowed: true, message: 'You unfollowed a user' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

export default userRouter
