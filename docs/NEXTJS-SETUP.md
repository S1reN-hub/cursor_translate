# 如何创建 Next.js 项目并跑起来

## 前置条件

1. **安装 Node.js**（建议 18.x 或 20.x）
   - 官网下载：https://nodejs.org/
   - 安装后重启终端，执行 `node -v` 和 `npm -v` 确认可用。

2. **终端**
   - 在项目目录 `d:\project\cursor_teanslate` 下打开 **PowerShell** 或 **命令提示符**。

---

## 方式一：在当前目录创建（与 README、PLAN 同目录）

当前目录下已有 `README.md`、`PLAN.md` 时，在**项目根目录**执行：

```powershell
cd d:\project\cursor_teanslate

npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm
```

- 若提示 **“Target directory is not empty. Continue?”** 输入 **y** 回车。
- 完成后会多出 `app/`、`public/`、`package.json` 等文件。

然后安装依赖并启动（若创建时已自动安装则跳过 `npm install`）：

```powershell
npm install
npm run dev
```

浏览器打开：**http://localhost:3000**。

---

## 方式二：在新子目录创建（推荐，避免覆盖现有文件）

在项目里单独建一个 Next 应用目录，例如 `web`：

```powershell
cd d:\project\cursor_teanslate

npx create-next-app@latest web --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm
```

按提示选择即可（一般一路回车用默认）。进入目录并启动：

```powershell
cd web
npm install
npm run dev
```

同样打开 **http://localhost:3000**。

---

## 常用脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run build` | 生产环境构建 |
| `npm run start` | 运行构建后的应用（需先 `npm run build`） |
| `npm run lint` | 运行 ESLint 检查 |

---

## 若提示 “npx 不是内部或外部命令”

说明 Node.js 未正确加入环境变量：

1. 重新安装 Node.js，勾选 **“Add to PATH”**。
2. 或使用 **完整路径** 调用（路径按本机 Node 安装位置调整）：
   ```powershell
   "C:\Program Files\nodejs\npx.cmd" create-next-app@latest . --typescript --tailwind --eslint --app --use-npm
   ```
3. 安装后**关闭并重新打开**终端再试。

---

## 创建时的选项含义（上述命令已包含）

- `--typescript`：使用 TypeScript
- `--tailwind`：使用 Tailwind CSS
- `--eslint`：启用 ESLint
- `--app`：使用 App Router（`app/` 目录）
- `--import-alias "@/*"`：路径别名 `@/` 指向项目根
- `--use-npm`：用 npm 管理依赖（可改为 `--use-pnpm` 或 `--use-yarn`）

按上述任一种方式创建并执行 `npm run dev` 后，Next.js 项目即可跑起来。
