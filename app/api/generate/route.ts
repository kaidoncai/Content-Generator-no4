import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json();

    // 根据不同类型构建不同的提示词前缀
    let systemPrompt = '';
    switch(type) {
      case 'article':
        systemPrompt = '请帮我写一篇文章，要求：\n';
        break;
      case 'marketing':
        systemPrompt = '请帮我写一段营销文案，要求：\n';
        break;
      case 'social':
        systemPrompt = '请帮我写一段社交媒体内容，要求：\n';
        break;
      default:
        systemPrompt = '请根据以下要求生成内容：\n';
    }

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V2.5',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        response_format: {
          type: "text"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return NextResponse.json({ content });
    
  } catch (error: any) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
} 