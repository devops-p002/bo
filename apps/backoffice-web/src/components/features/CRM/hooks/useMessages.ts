import { useState, useEffect, useCallback } from 'react';

export const useMessages = (ticketId = null) => {
  const [messages, setMessages] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Fetch messages for a specific ticket or chat
  const fetchMessages = useCallback(async (targetTicketId = ticketId) => {
    if (!targetTicketId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockMessages = [
        {
          id: 'MSG001',
          ticketId: targetTicketId,
          senderId: 'CUST001',
          senderName: 'John Doe',
          senderType: 'customer',
          senderAvatar: '/avatars/customer1.jpg',
          content: 'Hello, I need help with my account verification.',
          timestamp: '2024-06-15T10:30:00Z',
          status: 'delivered',
          attachments: [],
          isEdited: false,
        },
        {
          id: 'MSG002',
          ticketId: targetTicketId,
          senderId: 'AGT001',
          senderName: 'Agent Smith',
          senderType: 'agent',
          senderAvatar: '/avatars/agent1.jpg',
          content: 'Hi John! I\'d be happy to help you with that. Can you tell me what specific issue you\'re experiencing?',
          timestamp: '2024-06-15T10:32:00Z',
          status: 'read',
          attachments: [],
          isEdited: false,
        },
        {
          id: 'MSG003',
          ticketId: targetTicketId,
          senderId: 'CUST001',
          senderName: 'John Doe',
          senderType: 'customer',
          senderAvatar: '/avatars/customer1.jpg',
          content: 'I uploaded my documents yesterday but the verification is still pending. Here are the files I submitted:',
          timestamp: '2024-06-15T10:35:00Z',
          status: 'delivered',
          attachments: [
            { name: 'passport_front.jpg', size: '2.1 MB', type: 'image/jpeg' },
            { name: 'utility_bill.pdf', size: '1.8 MB', type: 'application/pdf' }
          ],
          isEdited: false,
        },
        {
          id: 'MSG004',
          ticketId: targetTicketId,
          senderId: 'AGT001',
          senderName: 'Agent Smith',
          senderType: 'agent',
          senderAvatar: '/avatars/agent1.jpg',
          content: 'Thank you for providing those documents. I can see them in our system. Let me review them right now and get back to you within the next few minutes.',
          timestamp: '2024-06-15T10:37:00Z',
          status: 'read',
          attachments: [],
          isEdited: false,
        },
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // Send a new message
  const sendMessage = useCallback(async (messageData) => {
    if (!messageData.content?.trim() && !messageData.attachments?.length) {
      throw new Error('Message content or attachments required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newMessage = {
        id: `MSG${Date.now()}`,
        ticketId: messageData.ticketId || ticketId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderType: messageData.senderType,
        senderAvatar: messageData.senderAvatar,
        content: messageData.content,
        timestamp: new Date().toISOString(),
        status: 'sending',
        attachments: messageData.attachments || [],
        isEdited: false,
      };
      
      // Optimistic update
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate status updates
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1000);
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ));
      }, 3000);
      
      return newMessage;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // Edit an existing message
  const editMessage = useCallback(async (messageId, newContent) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
          : msg
      ));
    } catch (err) {
      setError(err.message || 'Failed to edit message');
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a message
  const deleteMessage = useCallback(async (messageId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err.message || 'Failed to delete message');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, status: 'read' } : msg
      ));
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, []);

  // Fetch active chats
  const fetchActiveChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockChats = [
        {
          id: 'CHAT001',
          ticketId: 'TKT001',
          customerId: 'CUST001',
          customerName: 'John Doe',
          customerAvatar: '/avatars/customer1.jpg',
          lastMessage: 'Thank you for your help!',
          lastMessageTime: '2024-06-15T14:20:00Z',
          unreadCount: 2,
          status: 'active',
          assignedAgent: 'Agent Smith',
        },
        {
          id: 'CHAT002',
          ticketId: 'TKT002',
          customerId: 'CUST002',
          customerName: 'Jane Smith',
          customerAvatar: '/avatars/customer2.jpg',
          lastMessage: 'When will my withdrawal be processed?',
          lastMessageTime: '2024-06-15T13:45:00Z',
          unreadCount: 1,
          status: 'active',
          assignedAgent: 'Agent Johnson',
        },
        {
          id: 'CHAT003',
          ticketId: 'TKT003',
          customerId: 'CUST003',
          customerName: 'Mike Wilson',
          customerAvatar: '/avatars/customer3.jpg',
          lastMessage: 'Perfect, the bonus has been credited.',
          lastMessageTime: '2024-06-14T16:30:00Z',
          unreadCount: 0,
          status: 'resolved',
          assignedAgent: 'Agent Brown',
        },
      ];
      
      setActiveChats(mockChats);
    } catch (err) {
      setError(err.message || 'Failed to fetch active chats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set typing indicator
  const setTypingIndicator = useCallback((userId, typing) => {
    setIsTyping(typing);
    
    // Auto-clear typing indicator after 3 seconds
    if (typing) {
      setTimeout(() => setIsTyping(false), 3000);
    }
  }, []);

  // Fetch online users
  const fetchOnlineUsers = useCallback(async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockOnlineUsers = [
        { id: 'AGT001', name: 'Agent Smith', role: 'agent', status: 'online' },
        { id: 'AGT002', name: 'Agent Johnson', role: 'agent', status: 'away' },
        { id: 'AGT003', name: 'Agent Brown', role: 'agent', status: 'online' },
        { id: 'CUST001', name: 'John Doe', role: 'customer', status: 'online' },
        { id: 'CUST002', name: 'Jane Smith', role: 'customer', status: 'online' },
      ];
      
      setOnlineUsers(mockOnlineUsers);
    } catch (err) {
      console.error('Failed to fetch online users:', err);
    }
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    // Simulate real-time message updates
    const interval = setInterval(() => {
      // Randomly update message statuses or add new messages
      if (Math.random() > 0.95) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'new_message',
          message: 'New message received',
          timestamp: new Date().toISOString(),
        }]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Initialize data
  useEffect(() => {
    if (ticketId) {
      fetchMessages(ticketId);
    }
    fetchActiveChats();
    fetchOnlineUsers();
  }, [ticketId, fetchMessages, fetchActiveChats, fetchOnlineUsers]);

  return {
    // State
    messages,
    activeChats,
    notifications,
    loading,
    error,
    isTyping,
    onlineUsers,
    
    // Actions
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    fetchActiveChats,
    setTypingIndicator,
    fetchOnlineUsers,
    
    // Utilities
    getUnreadCount: () => messages.filter(m => m.status !== 'read').length,
    getLatestMessage: () => messages[messages.length - 1],
    clearNotifications: () => setNotifications([]),
  };
};

export default useMessages; 