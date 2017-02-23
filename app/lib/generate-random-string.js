module.exports = generateRandomString

function generateRandomString (length) {
  return Math.random().toString(36).substr(2, length || 25)
}
