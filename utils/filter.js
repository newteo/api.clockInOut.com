const filter = require('text-censor')

module.exports = (text) => {
  return filter.filter(text, (err, censored) => {
    return censored
  })
}