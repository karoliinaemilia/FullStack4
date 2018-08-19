const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'title or url missing' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes
    })

    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'soething went wrong' })
  }
})


blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)

    response.status(204).end()
  } catch (exception) {
    response.status(400).send({ error: 'malformatted id' })
    console.log(exception)
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter