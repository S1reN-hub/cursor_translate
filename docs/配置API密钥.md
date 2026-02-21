# 如何配置 DeepSeek API 密钥

翻译功能需要用到 DeepSeek 的 API，所以要先把「密钥」填进项目里，一共两步。

---

## 第一步：获取 API Key

1. 打开 DeepSeek 开放平台：**https://platform.deepseek.com/**
2. 登录或注册账号。
3. 在控制台里找到 **API Key** 或 **创建密钥**，生成一个密钥。
4. 复制这段密钥（一般是一串英文字母和数字），后面会用到。

---

## 第二步：把密钥填进项目

项目里已经有一个文件叫 **`.env.local`**（在项目根目录，和 `package.json` 同一层）。

1. 用 Cursor / VS Code 打开项目根目录下的 **`.env.local`**。
2. 找到这一行：
   ```env
   DEEPSEEK_API_KEY=your_api_key_here
   ```
3. 把 **`your_api_key_here`** 删掉，改成你在第一步复制的那个密钥。  
   例如密钥是 `sk-abc123...`，就改成：
   ```env
   DEEPSEEK_API_KEY=sk-abc123...
   ```
4. 保存文件（Ctrl+S）。

---

## 总结

- **复制 .env.local.example 为 .env.local** 的意思是：  
  把示例文件复制一份，并改名为 `.env.local`。  
  你的项目里已经存在 `.env.local`，所以**不需要再复制**，只要按上面第二步编辑即可。
- **填入你的 DeepSeek API Key** 的意思是：  
  在 `.env.local` 里，把 `DEEPSEEK_API_KEY=` 后面的 `your_api_key_here` 换成你自己的密钥。

保存后重新执行 `npm run dev`，翻译功能就会使用你的密钥调用 DeepSeek。
