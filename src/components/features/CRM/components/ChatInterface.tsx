import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../../common/UI';
import { Input } from '../../../common/Forms';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'user',
      message: 'Hello, I need help with my account.',
      timestamp: '2024-03-15 14:30:00',
    },
    {
      id: 2,
      sender: 'agent',
      message: 'Hi! I\'m here to help. What seems to be the issue?',
      timestamp: '2024-03-15 14:30:05',
    },
    // Add more mock messages as needed
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: chatHistory.length + 1,
      sender: 'user',
      message: message.trim(),
      timestamp: new Date().toLocaleString(),
    };

    setChatHistory([...chatHistory, newMessage]);
    setMessage('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        id: chatHistory.length + 2,
        sender: 'agent',
        message: 'Thank you for your message. I\'ll help you with that.',
        timestamp: new Date().toLocaleString(),
      };
      setChatHistory(prev => [...prev, agentResponse]);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Live Chat</h2>
          
          <div className="border rounded-lg h-[500px] flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium">Chat with Support</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex ${
                    chat.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      chat.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{chat.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {chat.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-4">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface; 