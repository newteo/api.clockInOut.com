const router = require('express').Router()
	, Company = require('../../models/Company')

router.post('/', (req, res)=> {
	const company = new Company({
		name: req.body.name || null,
		logo: req.body.logo || null,
		address: req.body.address || null,
		phone: req.body.phone || null,
		coordinate_latitude: req.body.coordinate_latitude || 0,
		coordinate_longitude: req.body.coordinate_longitude || 0,
		commutingTime: req.body.commutingTime || [],
		radius: req.body.radius || 100,
		corporateMember: req.body.corporateMember || [],
		mottos: req.body.mottos || [],
		remark: req.body.remark || null,
	})
	company.save((err)=> {
		if(err) return res.send({code: 404, err})
		res.send({code: 200, company})
	})
})
//
router.patch('/:id', (req, res)=> {
	const companyId = req.params.id
	Company.findOne({_id: companyId})
	.exec((err, company)=> {
		if(err) return res.send({code: 404, err})
		if(!company) return res.send({code: 401, error: 'Not found'})
		if(req.body.name) company.name = req.body.name
		if(req.body.logo) company.logo = req.body.logo
		if(req.body.address) company.address = req.body.address
		if(req.body.phone) company.phone = req.body.phone
		if(req.body.coordinate_latitude) company.coordinate_latitude = req.body.coordinate_latitude
		if(req.body.coordinate_longitude) company.coordinate_longitude = req.body.coordinate_longitude
		if(req.body.commutingTime) company.commutingTime = req.body.commutingTime
		if(req.body.radius) company.radius = req.body.radius
		if(req.body.corporateMember) company.corporateMember = req.body.corporateMember
		if(req.body.mottos) company.mottos = req.body.mottos
		if(req.body.remark) company.remark = req.body.remark
		company.save((err)=> {
			if(err) return res.send({code: 404, err})
			res.send(company)
		})
	})
})

module.exports = router