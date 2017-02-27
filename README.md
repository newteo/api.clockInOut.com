# api.clockInOut.com
打卡小程序API

# 小程序
## 登录
### 授权登录
```js
	GET    http://localhost:?/session?code=${code}&iv=${iv}&encryptedData=${encryptedData}&newteo=${newteo}
```
```js
{
	iv: ${iv},        //require!
	code: ${code},        //require!
	encryptedData: ${encryptedData},        //require!
	newteo: ${newteo}        //require!
}
```
返回=>
```js
{
	status: "nowork",
	token: "xxx"
}
```

## 个人
### 查看所有公司列表
```js
  GET    http://localhost:?/user/companies?token=${token}
```
返回=>    
```js
{
  "code": 200,
  "companies": [
    {
      "_id": "xxx",        //
      "name": "xxx",        //公司名称(String)
      "logo": "xxx",        //公司logo(String)
      "address": "xxx"        //公司地址(String)
    },
    {
      "_id": "xxx",
      "name": "xxx",
      "logo": "xxx",
      "address": "xxx"
    }
  ]
}
```
### 查看公司详情
```js
  GET    http://localhost:?/user/company/:id?token=${token}
```
返回=>    
```js
{
  "code": 200,
  "company": {
    "_id": "xxx",
    "updatedTime": "xxx",
    "manager": "xxx",
    "name": "xxx",
    "logo": "xxx",
    "address": "xxx",
    "phone": 12345678901,
    "radius": 100,
    "QRcodeUrl": "xxx",
    "remark": "xxx",
    "createdTime": "xxx",
    "mottos": [],
    "corporateMember": [],
    "commutingTime": []
  }
}
```
### 申请加入公司
```js
  POST    http://localhost:?/user/company?token=${token}
```
```js
{
  companyId: ${companyId}        //公司Id
}
```
未提交的返回=>  {code: 200, message: '申请已提交'}    
提交过的返回=>  {code: 202, message: '已提交过申请'}    


### 打卡
```js
	POST    http://localhost:?/user/punch/:companyId?token=${token}
```
```js
{
	latitude: ${latitude},        //纬度(Number)
	longitude: ${longitude},        //经度(Number)
	time: ${time}        //时间(Date)
}
```
返回=>   
```js
{
  "code": 200,
  "sweep": {
    "_id": "xxx",
    "owner": {        //用户信息
      "updatedTime": "xxx",
      "wxName": "xxx",
      "img": "xxx",
      "employeeID": "xxx",
      "realName": "xxx",
      "status": "nowork"
    },
    "place": "xxx",       //地点
    "h_m_s": "xx:xx:xx",        //时分秒
    "createdTime": "xxx"
  }
}
```
### 查看个人信息
```js
	GET    http://localhost:?/user/info?token=${token}
```
返回=> 
```js
{
	"code": 200,        //状态码
	"user": {
		"_id": "xxx",        //用户Id
		"updatedTime": "xxx",
		"openId": "xxx",        //微信Id
		"wxName": "xxx",        //微信昵称
		"img": "xxx",        //头像
		"employeeID": "xxx",        //员工编号
		"realName": "xxx",        //真实姓名
		"status": "work",        //工作状态
		"belongsTo": {...},        //所属公司
		"remark": "xxx",        //备注
		"createdTime": "xxx",
		"punchCardRecords": [        //打卡总记录
			"xxx", "xxx"
		]
	}
}
```
### 查看个人打卡记录
```js
	GET    http://localhost:?/user/records?token=${token}
```
返回=>  
```js
{
  "_id": "xxx",
  "updatedTime": "xxx",
  "owner": {
    "wxName": "xxx",
    "img": "xxx",
    "employeeID": "xxx",
    "realName": "xxx",
    "status": "xxx"
  },
  "normal": false,
  "today": "xxx",
  "createdTime": "xxx",
  "sweeps": [
    {
      "place": "xxx",
      "h_m_s": "xxx",
      "createdTime": "xxx"
    },
    {
      "place": "xxx",
      "h_m_s": "xxx",
      "createdTime": "xxx"
    },
    {
      "place": "xxx",
      "h_m_s": "xxx",
      "createdTime": "xxx"
    },
    {
      "place": "xxx",
      "h_m_s": "xxx",
      "createdTime": "xxx"
    },
    {
      "place": "xxx",
      "h_m_s": "xxx",
      "createdTime": "xxx"
    },
    {
      "place": "xxx",
      "h_m_s": "xxx",
      "createdTime": "xxx"
    }
  ]
}
```



## 公司
### 新增公司信息
```js
  POST    http://localhost:?/company/new?token=${token}
```
```js
{
  name: ${name},        //公司名称(String)
  address: ${address},        //公司地址(String)
  latitude: ${latitude},        //纬度(Number)
  longitude: ${longitude},        //经度(Number)
  commutingTime: ${commutingTime},        //上下班时间(Array)  eg: ["9:00", "12:00", "14:00", "18:00", "19:30", "21:00"]
  radius: ${radius},        //打卡有效范围[半径](Number)
  // logo: ${logo},        //公司logo[key: logo](String)
  // phone: ${phone}        //联系电话(Number)
}
```
返回=>  公司信息    

### 更改公司logo
```js
  POST    http://localhost:?/company/logo?token=${token}
```
//  key: logo    
返回=>  公司信息    

### 更改公司信息
```js
  POST    http://localhost:?/company/information?token=${token}
```
```js
{
  name: ${name},        //公司名称(String)
  address: ${address},        //公司地址(String)
  phone: ${phone},        //联系电话(Number)
  latitude: ${latitude},        //纬度(Number)
  longitude: ${longitude},        //经度(Number)
  commutingTime: ${commutingTime},        //上下班时间(Array)
  radius: ${radius},        //打卡有效范围(Number)
  remark: ${remark}        //公司备注(String)
}
```
返回=>  公司信息 + 管理员简单信息    

### 生成二维码
```js
  GET    http://localhost:?/qrcode/get?token=${token}
```
返回=>  二维码链接(QRCodeUrl)    

### 删除公司信息
```js
  DELETE    http://localhost:?/company/now?token=${token}
```
返回=>  状态码及'company deleted success'    

### 获取申请人员列表
```js
  GET    http://localhost:?/company/applylist?token=${token}
```
返回=>  申请人员信息列表    

### 验证申请人员
```js
  POST    http://localhost:?/company/applylist/:applyId?token=${token}
```
```js
{
  validation: ${validation}        //验证('pass' or 'nopass')
}
```
'pass'返回=>  {code: 200, message: 'add success'}    
'nopass'返回=>  {code: 200, message: 'refuse success'}    

### 获取成员列表
```js
  GET    http://localhost:?/company/staffs?token=${token}
```
返回=>  成员信息    

### 获取单天成员打卡信息
```js
  GET    http://localhost:?/company/staffs?token=${token}
```
```js
{
  today: ${today}        //哪一天(String)  eg: 2017-2-14
}
```
返回=>  
```js
{
  "code": 200,
  "staffRecords": [
    {        // 1个
      "_id": "xxx",
      "owner": {...},
      "normal": false,
      "today": "2017-2-14",
      "sweeps": [
        {
          "_id": "xxx",
          "place": "xxx",
          "h_m_s": "xx:xx:xx"
        },
        {
          "_id": "xxx",
          "place": "xxx",
          "h_m_s": "xx:xx:xx"
        }
      ]
    },
    {        //2个
      "_id": "xxx",
      "owner": {...},
      "normal": false,
      "today": "2017-2-14",
      "sweeps": [
        {
          "_id": "xxx",
          "place": "xxx",
          "h_m_s": "xx:xx:xx"
        },
        {
          "_id": "xxx",
          "place": "xxx",
          "h_m_s": "xx:xx:xx"
        }
      ]
    }
  ]
}
```