import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: '未配置 OpenAI API 密钥' },
      { status: 500 }
    );
  }

  try {
    const { prompt, type = 'general' } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供提示词' },
        { status: 400 }
      );
    }

    // 根据不同类型设置不同的系统提示词
    let systemPrompt = '你是一个有帮助的助手。';
    switch (type) {
      case 'article':
        systemPrompt = '你是一个专业的文章写手，擅长创作高质量的文章内容。';
        break;
      case 'marketing':
        systemPrompt = '你是一个营销专家，擅长编写吸引人的营销文案。';
        break;
      case 'social':
        systemPrompt = '你是一个社交媒体内容创作者，擅长编写有趣且引人入胜的帖子。';
        break;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('生成的内容为空');
    }

    return NextResponse.json({ 
      content,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('生成错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内容生成失败',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
} 