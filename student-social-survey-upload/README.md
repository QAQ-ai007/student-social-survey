# 大学生社交行为问卷

一个基于 Node.js + Express 的本地问卷网站，前端使用原生 HTML/CSS/JS，提交数据保存在本地 `data.json`。

## 运行方式

```bash
npm install
npm start
```

启动后访问：

- 填写者页面：http://localhost:3000/
- 管理员页面：http://localhost:3000/admin

管理员密码：`123456`

## 让其他人公网访问

双击运行：

```text
run-public.bat
```

等待窗口里出现类似下面的公网地址：

```text
your url is: https://xxxx.loca.lt
```

把这个 `https://` 地址发给其他人即可访问。公网访问期间不要关闭该窗口，也不要关闭电脑。

## 开机自动公网运行

双击运行一次：

```text
enable-auto-public-start.bat
```

之后每次登录 Windows，会自动打开公网访问窗口。窗口中显示的 `https://` 地址就是本次可分享的问卷链接。

如需取消自动启动，双击：

```text
disable-auto-public-start.bat
```

## 接口

- `POST /submit`：提交问卷数据，自动追加 `timestamp`
- `POST /api/login`：管理员密码验证
- `GET /api/results`：管理员获取所有提交记录，需携带登录后返回的 token

## 文件结构

```text
student-social-survey/
├─ app.js
├─ data.json
├─ package.json
├─ README.md
└─ public/
   ├─ admin.html
   ├─ admin.js
   ├─ index.html
   ├─ styles.css
   └─ survey.js
```
