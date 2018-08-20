const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
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

describe('tests for user', async() => {

  describe('when there is initially one user at db', async () => {
    beforeAll(async () => {
      await User.remove({})
      const user = new User({
        username: 'root',
        name: 'nimi',
        password: 'sekret'
      })
      await user.save()
    })

    describe('tests for POST to /api/users', async() => {

      test('succeeds with a fresh username', async() => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'mluukkai',
          name: 'Matti Luukkainen',
          password: 'salainen'
        }

        await api
          .post('/api/users')
          .send(newUser)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        const usersAfter = await helper.usersInDb()
        expect(usersAfter.length).toBe(usersAtStart.length + 1)
        const usernames = usersAfter.map(u => u.username)
        expect(usernames).toContain(newUser.username)
      })

      test('fails with proper statuscode if username is taken', async() => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen'
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'username must be unique' })

        const usersAfter = await helper.usersInDb()
        expect(usersAfter.length).toBe(usersAtStart.length)
      })

      test('fails if password is shorter than 3 characters with proper statuscode', async() => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'rooter',
          name: 'Rubeus',
          password: '12',
          adult: false
        }

        await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect({ error: 'password must contain atleast 3 characters' })

        const usersAfter = await helper.usersInDb()
        expect(usersAfter.length).toBe(usersAtStart.length)
      })

      test('if adult is not given a value its value is true', async() => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'rooterer',
          name: 'Rubelius',
          password: '1223456',
        }

        await api
          .post('/api/users')
          .send(newUser)

        const usersAfter = await helper.usersInDb()
        expect(usersAfter.length).toBe(usersAtStart.length+1)
        const user = usersAfter.filter(user => user.username==='rooterer')
        expect(user[0].adult).toBe(true)
      })
    })
  })
})


afterAll(() => {
  server.close()
})