const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const total = (items, value) => {
    return items.reduce((a, b) => {
      return a + b[value]
    }, 0)
  }
  return total(blogs, 'likes')
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }
  const blog = blogs.reduce((a, b) => {
    return (a.likes > b.likes) ? a : b
  })
  const {__v, _id, url, ...partial} = blog
  return partial
}

const mostBlogs = (blogs) => {
  if (blogs.length===0) {
    return {}
  }

  if (blogs.length===1) {
    return {
      author: blogs[0].author,
      blogs: 1
    }
  }

  const authors = blogs.map(blog => blog['author'])

  const authorsUnique = authors.filter((author, index, arr) => {
    return index = arr.indexOf(author)
  })

  let max = 0
  let authorWithMost = ''

  for (const a of authorsUnique) {
    const number = blogs.filter(blog => blog['author'] === a).length
    if (number > max) {
      max = number
      authorWithMost = a
    }
  }

  return {
    author: authorWithMost,
    blogs: max
  }
}

const mostLikes = (blogs) => {
  if (blogs.length===0) {
    return {}
  }

  const authors = blogs.map(blog => blog['author'])

  const authorsUnique = authors.filter((author, index, arr) => {
    return index === arr.indexOf(author)
  })

  let max = 0
  let authorWithMost = ''

  for (const a of authorsUnique) {
    const authorsBlogs = blogs.filter(blog => blog['author'] === a)
    const totalLikes = (item, value) => {
      return item.reduce((a,b) => {
        return a + b[value]
      }, 0)
    }
    const likesForAuthor = totalLikes(authorsBlogs, 'likes')

    if (likesForAuthor > max) {
      max = likesForAuthor
      authorWithMost = a
    }
  }

  return {
    author: authorWithMost,
    likes: max
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}