import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `你是一个专业的中英互译助手。规则：
1. 用户输入中文则只输出英文译文；输入英文则只输出中文译文。
2. 只输出翻译结果，不要解释、不要加引号、不要加「译文：」等前缀。
3. 保持段落与换行结构，按原文分段对应输出。`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "MISSING_API_KEY", message: "未配置 DEEPSEEK_API_KEY，请在 .env.local 中设置" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { error: "EMPTY_TEXT", message: "请输入要翻译的内容" },
        { status: 400 }
      );
    }

    const res = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      const status = res.status;
      if (status === 401) {
        return NextResponse.json(
          { error: "AUTH_ERROR", message: "API Key 无效或已过期" },
          { status: 500 }
        );
      }
      if (status === 429) {
        return NextResponse.json(
          { error: "RATE_LIMIT", message: "请求过于频繁，请稍后再试" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "API_ERROR", message: err || "DeepSeek API 请求失败" },
        { status: 500 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const translated =
      data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!translated) {
      return NextResponse.json(
        { error: "EMPTY_RESPONSE", message: "未获取到翻译结果" },
        { status: 500 }
      );
    }

    return NextResponse.json({ translated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "服务器错误";
    return NextResponse.json(
      { error: "SERVER_ERROR", message },
      { status: 500 }
    );
  }
}
