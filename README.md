# AI Agents 前后端分离项目

这是一个基于 Vue3 和 Node.js/Express 的前后端分离聊天应用，支持通用对话和多种专业智能体。

## 项目结构

```
AI_Aagents/
├── frontend/          # 前端项目（Vue3 + Vite）
│   ├── src/
│   │   ├── App.vue   # 主组件
│   │   ├── api/      # API 调用封装
│   │   ├── main.js   # 入口文件
│   │   └── style.css # 样式文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/           # 后端项目（Node.js + Express）
│   ├── server.js      # 服务器主文件
│   └── package.json
└── README.md
```

## 功能特性

- ✅ 通用对话模式
- ✅ 多种专业智能体（写作、编程、设计、数据分析、翻译、法律）
- ✅ 实时消息交互
- ✅ 会话历史管理
- ✅ 响应式设计
- ✅ 前后端完全分离

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn

### 安装依赖

#### 前端
```bash
cd frontend
npm install
```

#### 后端
```bash
cd backend
npm install
```

### 启动项目

#### 1. 启动后端服务
```bash
cd backend
npm start
# 或使用开发模式（自动重启）
npm run dev
```

后端服务将运行在 `http://localhost:3001`

#### 2. 启动前端服务
```bash
cd frontend
npm run dev
```

前端服务将运行在 `http://localhost:3000`

### 访问应用

打开浏览器访问 `http://localhost:3000`

## API 接口文档

### 获取智能体列表
```
GET /api/agents
```

响应：
```json
{
  "success": true,
  "agents": [...]
}
```

### 通用对话
```
POST /api/chat/general
Content-Type: application/json

{
  "message": "用户消息内容"
}
```

响应：
```json
{
  "success": true,
  "message": "AI 回复内容"
}
```

### 智能体对话
```
POST /api/chat/agent
Content-Type: application/json

{
  "agentName": "写作大师",
  "message": "用户消息内容"
}
```

响应：
```json
{
  "success": true,
  "message": "AI 回复内容"
}
```

### 重置会话
```
POST /api/chat/reset
Content-Type: application/json

{
  "agentName": "写作大师" // 可选，不传则为通用对话
}
```

### 健康检查
```
GET /api/health
```

## 开发说明

### 前端技术栈
- Vue 3 (Composition API)
- Vite
- Tailwind CSS
- Axios

### 后端技术栈
- Node.js
- Express
- CORS

### 配置说明

#### 前端代理配置
前端通过 Vite 代理将 `/api` 请求转发到后端：
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

#### 跨域配置
后端已配置 CORS，允许前端跨域访问。

## 生产环境部署

### 构建前端
```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist` 目录。

### 部署建议

1. **前端部署**：将 `frontend/dist` 部署到 Nginx、Vercel、Netlify 等静态托管服务
2. **后端部署**：将后端部署到 Node.js 服务器（如 PM2）或云服务（如 Heroku、Railway）

### 环境变量

生产环境建议配置：
- `VITE_API_BASE_URL`：前端 API 基础地址
- `PORT`：后端服务端口
- `NODE_ENV`：环境模式

## 扩展开发

### 接入真实 AI API

在 `backend/server.js` 中的 `sendGeneralMessage` 和 `sendAgentMessage` 函数中，可以接入：
- OpenAI API
- Claude API
- 其他 AI 服务

示例：
```javascript
// 接入 OpenAI
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: message }]
})
```

### 添加新智能体

在 `backend/server.js` 的 `agents` 数组中添加新的智能体配置。

## 注意事项

- 当前会话存储使用内存，生产环境应使用数据库（如 MongoDB、PostgreSQL）
- 建议添加身份认证和授权机制
- 建议添加请求限流和错误处理
- 建议添加日志记录

## 许可证

MIT

