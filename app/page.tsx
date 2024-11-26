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

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data.content);
      setHistory(prev => [{
        prompt,
        result: data.content,
        type,
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 5));
      
    } catch (error: any) {
      console.error('错误:', error);
      setError(error.message || '生成内容时出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AI 内容生成器
          </h1>
          
          <div className="space-y-4">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="general">✨ 通用内容</option>
              <option value="article">📝 文章</option>
              <option value="marketing">🎯 营销文案</option>
              <option value="social">💬 社交媒体</option>
            </select>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请输入详细的提示词..."
              className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white resize-none"
            />
            
            <button
              onClick={generateContent}
              disabled={loading || !prompt}
              className="w-full p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                       disabled:opacity-50 transition duration-200 ease-in-out"
            >
              {loading ? '生成中...' : '生成内容'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-lg">
              ⚠️ {error}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">生成结果</h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {result}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
