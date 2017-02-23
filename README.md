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