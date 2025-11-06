# 自定义域名配置指南

## 🎯 问题说明

当前访问 Worker URL `https://hacker-news-worker.vwanghao.workers.dev` 会重定向到原作者的域名 `https://hacker-news.agi.li/`。

**原因：** 原代码中硬编码了重定向到作者的域名。

**解决方案：** 我已经修改代码，支持通过环境变量配置自己的域名。

## ✅ 已完成的修改

1. **添加环境变量支持**
   - 新增 `HACKER_NEWS_WEB_URL` 环境变量
   - 如果不设置，默认重定向到 Worker 自己的 URL

2. **代码更改**
   - `worker/index.ts` 现在使用可配置的 Web URL
   - 移除硬编码的 `https://hacker-news.agi.li/`

## 🚀 方案选择

### 方案 1：使用 Workers.dev 子域名（免费，最简单）

**当前状态：**

- Worker URL: `https://hacker-news-worker.vwanghao.workers.dev`
- 已经可以访问，无需额外配置

**步骤：**

1. 不需要设置 `HACKER_NEWS_WEB_URL`（代码默认使用 Worker URL）
2. Worker 会处理静态文件和工作流触发

**优点：**

- ✅ 完全免费
- ✅ 自动 SSL
- ✅ 无需配置 DNS

**缺点：**

- ❌ 域名包含 `.workers.dev`
- ❌ 无法完全自定义

---

### 方案 2：使用自己的域名（推荐）

如果你有自己的域名（例如 `yourdomain.com`），可以绑定到 Cloudflare Workers。

#### 步骤 1：添加域名到 Cloudflare

1. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com/

2. **添加站点**
   - 点击 "Add a Site"
   - 输入你的域名（例如：`yourdomain.com`）
   - 选择免费计划
   - 按照指引更新域名的 Nameservers

3. **等待 DNS 激活**
   - 通常需要几分钟到24小时

#### 步骤 2：配置 Worker 路由

有两种方式：

**方式 A：使用子域名（推荐）**

1. 在 Cloudflare Dashboard → Workers & Pages → hacker-news-worker
2. 点击 "Triggers" → "Custom Domains"
3. 点击 "Add Custom Domain"
4. 输入子域名，例如：`news.yourdomain.com`
5. 点击 "Add Custom Domain"

Cloudflare 会自动：

- 创建 DNS 记录
- 配置 SSL 证书
- 绑定到你的 Worker

**方式 B：使用路由**

1. 在 Cloudflare Dashboard → 你的域名 → Workers Routes
2. 点击 "Add route"
3. 输入路由：`yourdomain.com/api/*`
4. 选择 Worker：`hacker-news-worker`
5. 保存

#### 步骤 3：设置环境变量

在云环境中执行：

```bash
# 如果使用子域名
export CLOUDFLARE_API_TOKEN="你的token"
echo "https://news.yourdomain.com" | pnpm exec wrangler secret put HACKER_NEWS_WEB_URL --cwd worker

# 如果使用根域名
echo "https://yourdomain.com" | pnpm exec wrangler secret put HACKER_NEWS_WEB_URL --cwd worker
```

#### 步骤 4：部署 Next.js Web 应用（可选）

如果你想部署完整的 Web 界面：

1. **部署到 Cloudflare Pages**

   ```bash
   export CLOUDFLARE_API_TOKEN="你的token"
   pnpm deploy
   ```

2. **配置 Pages 域名**
   - 在 Cloudflare Dashboard → Pages → 你的项目
   - 点击 "Custom domains"
   - 添加你的域名

---

### 方案 3：暂时移除重定向（最快速）

如果你暂时不想配置域名，可以直接让 Worker 返回信息而不是重定向。

**在云环境中我可以帮你修改代码，让访问 Worker URL 时显示欢迎页面而不是重定向。**

---

## 🔧 当前代码配置

修改后的代码：

```typescript
// worker/index.ts
const webUrl = env.HACKER_NEWS_WEB_URL || 'https://hacker-news-worker.vwanghao.workers.dev'
return Response.redirect(`${webUrl}${pathname}`, 302)
```

**环境变量：**

- `HACKER_NEWS_WEB_URL`（可选）：自定义 Web 应用 URL
- 如果不设置，默认重定向到 Worker 自己的 URL

---

## 📋 快速配置命令

### 情况 1：我有自己的域名

```bash
# 告诉我你的域名，我会帮你设置
# 例如：news.yourdomain.com
```

### 情况 2：我暂时使用 workers.dev 域名

```bash
# 不需要额外配置，已经完成！
# 访问：https://hacker-news-worker.vwanghao.workers.dev
```

### 情况 3：我不想要重定向

```bash
# 告诉我，我可以修改代码显示欢迎页面
```

---

## 🎯 推荐方案对比

| 方案               | 难度   | 费用             | 自定义程度 | 推荐指数   |
| ------------------ | ------ | ---------------- | ---------- | ---------- |
| Workers.dev 子域名 | ⭐     | 免费             | 低         | ⭐⭐⭐     |
| 自己的域名         | ⭐⭐⭐ | 免费（需有域名） | 高         | ⭐⭐⭐⭐⭐ |
| 移除重定向         | ⭐     | 免费             | 中         | ⭐⭐       |

---

## 💡 我的建议

1. **如果你有域名**：使用方案 2，配置自己的域名（例如 `news.yourdomain.com`）
2. **如果没有域名**：先使用方案 1（workers.dev），后续可以随时升级
3. **如果只是测试**：使用方案 3，直接显示内容

---

## 🚀 下一步

**请告诉我你的选择：**

1. **"我有域名 xxx.com"** - 我会帮你配置自定义域名
2. **"使用 workers.dev"** - 我会配置默认域名（已完成）
3. **"移除重定向"** - 我会修改代码显示欢迎页面

提供你的选择后，我会立即在云环境中完成配置！
