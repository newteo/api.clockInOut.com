//(计算两点间的距离)
function rad(angle) {
	var radian = angle/180.0 * Math.PI
	return radian
}
function getDistance(latO, lngO, latH, lngH) {
	var Rearth = 6378137    //(地球半径: 米)
		, radLatO = rad(latO)
		, radLatH = rad(latH)
		, n = radLatO - radLatH
		, e = rad(lngO) - rad(lngH)
		, s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(n/2),2) + Math.cos(radLatO)*Math.cos(radLatH)*Math.pow(Math.sin(e/2),2)))
	s = Math.round((s * Rearth) * 100) / 100
	return s
}

module.exports = getDistance