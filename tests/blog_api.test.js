const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

describe('tests for blog', async() => {

  beforeAll(async () => {
    await Blog.remove({})
    const blogObjects = helper.initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
  })

  describe('test for HTTP GET to /api/blogs', () => {

    test('all blogs are returned as json', async() => {
      const blogsInDatabase = await helper.blogsInDb()

      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('content-type', /application\/json/)

      expect(response.body.length).toBe(blogsInDatabase.length)

      const returnedBlogs = response.body.map(Blog.format)
      blogsInDatabase.forEach(blog => {
        expect(returnedBlogs).toContainEqual(blog)
      })
    })
  })

  describe('tests for HTTP POST to /api/blogs', () => {

    test('a valid blog can be added', async() => {
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('content-type', /application\/json/)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter.length).toBe(blogsAtStart.length + 1)
      expect(blogsAfter).toContainEqual(newBlog)
    })

    test('if likes isn\'t given a value, its value is 0', async() => {
      const newBlog = {
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('content-type', /application\/json/)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter).toContainEqual({
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
        likes: 0
      })
    })

    test('if blog doesn\'t contain title and url status is 400', async() => {
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        author: 'Robert C. Martin',
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfter = await  helper.blogsInDb()
      expect(blogsAfter.length).toBe(blogsAtStart.length)
    })
  })

  describe('deletion of a blog', async () => {
    let addedBlog

    beforeAll(async() => {
      addedBlog = new Blog ({
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0
      })
      await addedBlog.save()
    })

    test('DELETE /api/blogs/:id succeeds with proper statuscode', async() => {
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter).not.toContainEqual(addedBlog)
      expect(blogsAfter.length).toBe(blogsAtStart.length-1)
    })
  })

  describe('modifying a blog', async () => {
    let addedBlog

    beforeAll(async () => {
      addedBlog = new Blog({
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2
      })
      await addedBlog.save()
    })

    test('PUT /api/blog/:id succeeds', async () => {
      const changedBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancodr.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 900
      }

      await api
        .put(`/api/blogs/${addedBlog._id}`)
        .send(changedBlog)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter).toContainEqual(changedBlog)
      expect(blogsAfter).not.toContainEqual(addedBlog)
    })
  })
})


afterAll(() => {
  server.close()
})