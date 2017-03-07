function arrayIn(array, val) {  
  var exist = false
  for(var i = 0; i < array.length; i++) {
    if(array[i] == val) return exist = true
  }
  return exist
}

module.exports = arrayIn