'use client';

import { useState } from 'react';

interface HistoryItem {
  prompt: string;
  result: string;
  type: string;
  timestamp: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('general');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState('');

  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, type }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data.content);
      // 保存到历史记录
      setHistory(prev => [{
        prompt,
        result: data.content,
        type,
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 5));
      
    } catch (error: any) {
      console.error('生成错误:', error);
      setError(error.message || '内容生成失败，请稍后重试');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            AI 内容生成器
          </h1>

          {/* 内容类型选择 */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              选择内容类型
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="general">通用内容</option>
              <option value="article">文章生成</option>
              <option value="marketing">营销文案</option>
              <option value="social">社交媒体</option>
            </select>
          </div>

          {/* 提示词输入 */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              输入提示词
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请详细描述您需要生成的内容..."
              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary-500 
                       min-h-[120px] resize-y"
            />
          </div>

          {/* 生成按钮 */}
          <button
            onClick={generateContent}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 bg-primary-500 text-white rounded-lg 
                     hover:bg-primary-600 disabled:opacity-50 
                     disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? '生成中...' : '生成内容'}
          </button>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-lg">
              {error}
            </div>
          )}

          {/* 生成结果 */}
          {result && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">生成结果</h2>
              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">历史记录</h2>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span className="capitalize">{item.type}</span>
                    </div>
                    <div className="text-gray-700 mb-2">
                      <strong>提示词：</strong>
                      {item.prompt}
                    </div>
                    <div className="text-gray-700">
                      <strong>结果：</strong>
                      <div className="whitespace-pre-wrap">{item.result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
