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
头次=> 
```js
{
	"code": 200,
  "record": {
    "updatedTime": "xxx",
    "owner": "58ae58fda9669e14b6aadb3a",
    "normal": false,
    "longitude": 116,
    "latitude": 23,
    "place": "xxx",
    "today": "xxx",
    "sweep1": "xxx",
    "sweep2": "xxx",
    "sweep3": "xxx",
    "sweep4": "xxx",
    "sweep5": "xxx",
    "sweep6": "xxx",
    "_id": "xxx",
    "createdTime": "xxx"
  }
}
```
其他=>  
```js
{
	"code": 200,
  "place": "xxx",
  "same": {
    "updatedTime": "xxx",
    "owner": "58ae58fda9669e14b6aadb3a",
    "normal": false,
    "longitude": 116,
    "latitude": 23,
    "place": "xxx",
    "today": "xxx",
    "sweep1": "xxx",
    "sweep2": "xxx",
    "sweep3": "xxx",
    "sweep4": "xxx",
    "sweep5": "xxx",
    "sweep6": "xxx",
    "_id": "xxx",
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
		"belongsTo": "xxx",        //所属公司Id
		"remark": "xxx",        //备注
		"createdTime": "xxx",
		"punchCardRecords": [        //打卡总记录
			"xxx"
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
	"code": 200,
  "records": [
    {
      "_id": "xxx",
      "updatedTime": "xxx",
      "owner": "xxx",
      "normal": false,
      "longitude": 116,
      "latitude": 23,
      "place": "xxx",
      "today": "xxx",
      "sweep1": "xxx",
      "sweep2": "xxx",
      "sweep3": "xxx",
      "sweep4": "xxx",
      "sweep5": "xxx",
      "sweep6": "xxx",
      "createdTime": "xxx"
    }
  ]
}
```