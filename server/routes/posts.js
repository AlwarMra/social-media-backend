import express from 'express'
import Post from '../Model/Post.js'
import User from '../Model/User.js'

const postRouter = express.Router()

postRouter.get('/:id', (req, res) => {
  const { id } = req.params
  Post.findById(id)
    .then(post => {
      res.status(200).json(post)
    })
    .catch(error => {
      res.status(500).json(error)
    })
})

postRouter.post('/', (req, res) => {
  if (req.body.content.replace(/\s/g, '')) {
    res.status(403).send({ error: true, message: 'Blank message not allowed' })
    return
  }
  const newPost = new Post(req.body)
  newPost
    .save()
    .then(post => {
      res.status(201).send(post)
    })
    .catch(error => {
      res.status(500).send(error)
    })
})

// delete post
postRouter.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const post = await Post.findById(id)
    post.userId === req.body.userId
      ? post.deleteOne()
      : res.status(403).send({ error: true, message: 'Forbidden' })
  } catch (error) {
    res.status(500).json(error)
  }
})

// like / dislike post
postRouter.put('/:id/like', async (req, res) => {
  const { id } = req.params
  try {
    const post = await Post.findById(id)
    const user = await User.findById(req.params.myUserId)

    if (!post.likes.includes(req.body.postUserId)) {
      await post.updateOne({ $push: { likes: req.body.postUserId } })
    } else {
      await post.updateOne({ $pull: { likes: req.body.postUserId } })
    }

    if (!user.likes.includes(post._id)) {
      await user.updateOne({ $push: { likes: post._id } })
    } else {
      await user.updateOne({ $pull: { likes: post._id } })
    }

    res.status(200).send({ message: 'Action completed' })
  } catch (error) {
    res.status(500).json(error)
  }
})

// Timeline posts
postRouter.get('/timeline/all', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    const userPosts = await Post.find({ userId: user._id })

    const friendPosts = await Promise.all(
      user.followings.map(friendId => {
        return Post.find({ userId: friendId })
      }),
    )

    res.json(userPosts.concat(...friendPosts))
  } catch (error) {
    res.status(500).json(error)
  }
})

postRouter.get('/timeline/likes', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    const favPosts = await Promise.all(
      user.likes.map(like => {
        return Post.findById(like)
      }),
    )
    res.json(favPosts)
  } catch (error) {
    res.status(500).json(error)
  }
})

export default postRouter
