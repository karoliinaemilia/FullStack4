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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}