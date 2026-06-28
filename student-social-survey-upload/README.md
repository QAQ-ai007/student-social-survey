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

## Render 长期保存数据

推荐使用 Supabase 免费 PostgreSQL 数据库。

1. 在 Supabase 创建项目。
2. 在项目的 Database / Connection string 中复制 URI 格式连接串。
3. 在 Render 的 Environment Variables 中添加：

```text
DATABASE_URL=你的 Supabase PostgreSQL 连接串
ADMIN_PASSWORD=123456
```

部署后程序会自动创建 `survey_responses` 表。配置了 `DATABASE_URL` 时，所有问卷提交都会保存到 PostgreSQL；本地运行或没有配置数据库时，会继续保存到 `data.json`。

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
