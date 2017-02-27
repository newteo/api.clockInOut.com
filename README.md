# api.clockInOut.com
打卡小程序API

# 小程序
## 
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

### 打卡
```js
		POST    http://localhost:?/user/punch?token=${token}
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
    POST http://localhost:?/company/new?token=${token}
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
    POST http://localhost:?/company/logo?token=${token}
```
//  key: logo    
返回=>  公司信息    

### 更改公司信息
```js
    POST http://localhost:?/company/information?token=${token}
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

### 
```js
    POST http://localhost:?/qrcode/get?token=${token}
```