# 星语 (StarTalk) — 前端应用

基于 React 19 + Vite + Zustand + Ant Design 6 的 AI 聊天前端，支持 SSE 流式对话、Markdown 渲染、主题切换。

## 技术栈

| 类别      | 技术                       |
| --------- | -------------------------- |
| 框架      | React 19                   |
| 构建工具  | Vite 8                     |
| 语言      | TypeScript (target ES2023) |
| 状态管理  | Zustand                    |
| UI 组件库 | Ant Design 6               |
| 路由      | React Router 7             |
| 样式      | CSS Modules (SCSS)         |
| Markdown  | marked + highlight.js      |
| HTTP      | Axios + Fetch (SSE 流)     |

## 目录结构

```
react/AiChat/
├── public/                  # 静态资源
├── src/
│   ├── main.tsx             # 应用入口
│   ├── index.scss           # 全局样式
│   ├── api/                 # API 端点配置
│   ├── assets/              # 图片、全局样式
│   │   ├── images/
│   │   └── styles/
│   ├── components/          # 组件（每个组件独立目录）
│   │   ├── AuthGuard/       # 路由鉴权守卫
│   │   ├── ChatBubbles/     # 快捷对话气泡
│   │   ├── ChatMessage/     # 聊天消息（含编辑、复制、重新生成）
│   │   ├── ChatSidebar/     # 侧边栏对话列表
│   │   ├── ConfirmModel/    # 确认弹窗
│   │   ├── EditChatModal/   # 编辑对话设置
│   │   ├── EmptyChat/       # 空对话欢迎页
│   │   ├── InputArea/       # 消息输入区域
│   │   ├── LoginCard/       # 登录/注册卡片
│   │   ├── ModelBadge/      # 模型标签
│   │   ├── SettingsModal/   # 用户/系统设置
│   │   ├── Toast/           # 消息提示
│   │   └── UserProfile/     # 用户头像
│   ├── config/              # 前端配置
│   ├── context/             # React Context（Theme、Toast）
│   ├── hooks/               # 自定义 Hooks
│   ├── pages/               # 页面组件
│   ├── router/              # 路由配置
│   ├── store/               # Zustand 状态管理
│   ├── types/               # TypeScript 类型
│   ├── utils/               # 工具函数（HTTP、Markdown 等）
│   └── workers/             # Web Workers
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## 快速开始

### 1. 安装依赖

```bash
cd react/AiChat
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

默认运行在 `http://localhost:5173`。

Vite 已配置代理，`/api`、`/images`、`/videos`、`/others` 请求自动转发到 `http://localhost:3000`。

### 3. 构建生产版本

```bash
npm run build
```

输出到 `dist/` 目录。

### 4. 代码检查

```bash
npm run lint
```

## 路由

| 路径               | 页面      | 说明                 |
| ------------------ | --------- | -------------------- |
| `/`                | Layout    | 主聊天界面（需登录） |
| `/login`           | LoginPage | 登录 / 注册          |
| `/forgot-password` | ForgetPsd | 忘记密码             |

## 组件结构约定

每个组件独立目录，包含：

```
ComponentName/
├── index.tsx            # 组件逻辑
└── index.module.scss    # CSS Modules 样式
```

## 状态管理 (Zustand)

| Store       | 文件               | 职责                         |
| ----------- | ------------------ | ---------------------------- |
| `chatStore` | `store/chatStore/` | 对话列表、消息、SSE 流式回复 |
| `userStore` | `store/userStore/` | 用户认证、个人信息           |

## Context

| Context        | 文件                   | 职责              |
| -------------- | ---------------------- | ----------------- |
| `ThemeContext` | `context/ThemeContext` | 深色/浅色主题切换 |
| `ToastContext` | `context/ToastContext` | 全局消息提示      |

## 核心功能

### SSE 流式对话

通过 `chatStore` 的 `generateAiReply` / `editMessage` 方法发起 SSE 连接，实时接收 AI 回复内容，支持：

- 流式文本渲染（逐字显示）
- 思考过程展示（DeepSeek reasoning）
- 断点续传（`resume` 恢复中断的生成）
- Markdown 实时解析（marked + highlight.js 代码高亮）

### 消息编辑

点击用户消息旁的编辑按钮，可修改已发送消息并重新生成 AI 回复（删除该消息之后的所有消息后重新请求）。

### 主题切换

支持深色/浅色主题，通过 CSS 变量驱动，所有组件样式自动适配。

## 环境变量

通过 Vite 环境变量配置（`.env` 文件）：

```env
VITE_DEVELOPMENT_API_URL=http://localhost:3000
VITE_PRODUCTION_API_URL=https://your-api-domain.com
```

## 注意事项

- 前端 `src/config/index.ts` 文件需自行创建用于前端配置
- 生产部署时修改 `vite.config.ts` 中的代理目标或使用 Nginx 反向代理
- ESLint 配置了 `noUnusedLocals` 和 `noUnusedParameters` 严格模式

        tseslint.configs.stylisticTypeChecked,

        // Other configs...
      ],
      languageOptions: {
        parserOptions: {
          project: ['./tsconfig.node.json', './tsconfig.app.json'],
          tsconfigRootDir: import.meta.dirname,
        },
        // other options...
      },

  },
  ])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````
