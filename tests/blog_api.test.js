const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  }
]

describe('tests for blog', async() => {

  beforeAll(async () => {
    await Blog.remove({})
    for (let blog of initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }

  })

  describe('tests for HTTP GET to /api/blogs', () => {

    test('all blogs are returned', async() => {
      const response = await api
        .get('/api/blogs')

      expect(response.body.length).toBe(initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
      const response = await api
        .get('/api/blogs')

      const contents = response.body.map(b => b.title)

      expect(contents).toContain('React patterns')
    })
  })
})

afterAll(() => {
  server.close()
})