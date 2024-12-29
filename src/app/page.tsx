"use client";

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const Say = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [saveDate, setSaveDate] = useState<string | null>(null);

  useEffect(() => {
    const chatHistory = Cookies.get('chatHistory');
    if (chatHistory) {
      const parsedHistory = JSON.parse(chatHistory);
      const newQuestions: string[] = [];
      const newResponses: string[] = [];
      parsedHistory.history.forEach((entry: any) => {
        newQuestions.push(entry.question);
        newResponses.push(entry.response);
      });
      setQuestions(newQuestions);
      setResponses(newResponses);
      setSaveDate(parsedHistory.saveDate);
    }
  }, []);

  const handleChat = async () => {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      setResponse(data.text); // 응답 데이터를 상태로 설정
      setQuestions([...questions, message]); // 질문을 배열에 추가
      setResponses([...responses, data.text]); // 응답을 배열에 추가

      // 질문과 응답을 객체로 만들어 쿠키에 저장
      const chatHistory = {
        saveDate: new Date().toISOString().split('T')[0],
        history: [...questions.map((q, index) => ({ question: q, response: responses[index] })), { question: message, response: data.text }]
      };
      Cookies.set('chatHistory', JSON.stringify(chatHistory));
      setSaveDate(chatHistory.saveDate);

      setMessage(''); // message 값을 초기화
    } catch (err) {
      console.error('There was an error', err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">What do you want to say?</h1>
      {saveDate && <p className="text-gray-500 mb-4">Chat saved on: {saveDate}</p>}
      <div className="flex items-center mb-4">
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleChat();
            }
          }}
          className="border p-2 w-full mr-2"
        />
        <button onClick={handleChat} className="bg-blue-500 text-white px-4 py-2 rounded">Say</button>
      </div>
      {questions.length > 0 && (
        <div className="mt-4 bg-white border border-gray-300 p-4 rounded">
          {questions.map((q, index) => (
            <div key={index}>
              <div className="flex justify-end">
                <p className="text-blue-500">{q}</p>
              </div>
              <div className="flex justify-start">
                <p className="text-green-500">{responses[index]}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Say />
    </div>
  );
}