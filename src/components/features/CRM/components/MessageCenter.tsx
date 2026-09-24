import React, { useState } from 'react';
import { Card } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';

const MessageCenter = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data for messages
  const messages = [
    {
      id: 1,
      type: 'support',
      subject: 'Account Verification Issue',
      sender: 'user123',
      date: '2024-03-15',
      status: 'open',
      priority: 'high',
    },
    {
      id: 2,
      type: 'notification',
      subject: 'New Bonus Available',
      sender: 'system',
      date: '2024-03-14',
      status: 'sent',
      priority: 'medium',
    },
    // Add more mock messages as needed
  ];

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || message.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Message Center</h2>
          
          <div className="flex space-x-4 mb-4">
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1"
            />
            <Select
              value={filter}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: 'All Messages' },
                { value: 'support', label: 'Support' },
                { value: 'notification', label: 'Notifications' },
              ]}
              className="w-48"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="font-medium">Messages</h3>
              </div>
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleMessageSelect(message)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{message.subject}</h4>
                        <p className="text-sm text-gray-600">{message.sender}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        message.priority === 'high' ? 'bg-red-100 text-red-800' :
                        message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{message.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="font-medium">Message Details</h3>
              </div>
              {selectedMessage ? (
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Subject</h4>
                      <p>{selectedMessage.subject}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">From</h4>
                      <p>{selectedMessage.sender}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Date</h4>
                      <p>{selectedMessage.date}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Status</h4>
                      <p className="capitalize">{selectedMessage.status}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Priority</h4>
                      <p className="capitalize">{selectedMessage.priority}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Select a message to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessageCenter; 