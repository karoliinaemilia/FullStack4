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

module.exports = {
  dummy,
  totalLikes
}