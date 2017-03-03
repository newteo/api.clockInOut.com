const jsSHA = require('jssha')

function makeHash(value) {
  const shaObj = new jsSHA('SHA-1', 'TEXT')
  shaObj.update(value)
  return shaObj.getHash('HEX')
}

module.exports = makeHash