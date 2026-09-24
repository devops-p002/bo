import { useState, useEffect, useCallback } from 'react';

export const useCRM = () => {
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ticket Management
  const fetchTickets = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTickets = [
        {
          id: 'TKT001',
          customerId: 'CUST001',
          customerName: 'John Doe',
          subject: 'Account Verification Issue',
          status: 'Open',
          priority: 'High',
          assignedTo: 'Agent Smith',
          createdAt: '2024-06-15T10:30:00Z',
          updatedAt: '2024-06-15T14:20:00Z',
          category: 'Account',
          description: 'Customer unable to verify account with uploaded documents.',
        },
        {
          id: 'TKT002',
          customerId: 'CUST002',
          customerName: 'Jane Smith',
          subject: 'Withdrawal Delay',
          status: 'In Progress',
          priority: 'Medium',
          assignedTo: 'Agent Johnson',
          createdAt: '2024-06-14T15:45:00Z',
          updatedAt: '2024-06-15T09:15:00Z',
          category: 'Payments',
          description: 'Withdrawal request submitted 3 days ago but not processed.',
        },
        {
          id: 'TKT003',
          customerId: 'CUST003',
          customerName: 'Mike Wilson',
          subject: 'Bonus Not Credited',
          status: 'Resolved',
          priority: 'Low',
          assignedTo: 'Agent Brown',
          createdAt: '2024-06-13T11:20:00Z',
          updatedAt: '2024-06-14T16:30:00Z',
          category: 'Promotions',
          description: 'Welcome bonus not credited after first deposit.',
        },
      ];
      
      setTickets(mockTickets);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (ticketData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTicket = {
        id: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
        ...ticketData,
        status: 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tickets.length]);

  const updateTicket = useCallback(async (ticketId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
          : ticket
      ));
    } catch (err) {
      setError(err.message || 'Failed to update ticket');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    } catch (err) {
      setError(err.message || 'Failed to delete ticket');
    } finally {
      setLoading(false);
    }
  }, []);

  // Message Management
  const fetchMessages = useCallback(async (ticketId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockMessages = [
        {
          id: 'MSG001',
          ticketId,
          senderId: 'CUST001',
          senderName: 'John Doe',
          senderType: 'customer',
          content: 'I uploaded my documents but the verification is still pending. Can you help?',
          timestamp: '2024-06-15T10:30:00Z',
          attachments: [],
        },
        {
          id: 'MSG002',
          ticketId,
          senderId: 'AGT001',
          senderName: 'Agent Smith',
          senderType: 'agent',
          content: 'I\'ve reviewed your documents. The image quality is too low for our verification system. Please upload clearer images.',
          timestamp: '2024-06-15T11:15:00Z',
          attachments: [],
        },
        {
          id: 'MSG003',
          ticketId,
          senderId: 'CUST001',
          senderName: 'John Doe',
          senderType: 'customer',
          content: 'I\'ve uploaded new photos. Please check them now.',
          timestamp: '2024-06-15T14:20:00Z',
          attachments: ['passport_front.jpg', 'passport_back.jpg'],
        },
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (ticketId, messageData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMessage = {
        id: `MSG${String(messages.length + 1).padStart(3, '0')}`,
        ticketId,
        ...messageData,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages.length]);

  // Customer Management
  const fetchCustomers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockCustomers = [
        {
          id: 'CUST001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          registrationDate: '2024-01-15',
          status: 'Active',
          vipLevel: 'Gold',
          totalDeposits: 5000,
          totalWithdrawals: 3000,
          openTickets: 1,
          lastActivity: '2024-06-15T10:30:00Z',
        },
        {
          id: 'CUST002',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          registrationDate: '2024-02-20',
          status: 'Active',
          vipLevel: 'Silver',
          totalDeposits: 2500,
          totalWithdrawals: 1800,
          openTickets: 1,
          lastActivity: '2024-06-14T15:45:00Z',
        },
      ];
      
      setCustomers(mockCustomers);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerById = useCallback((customerId) => {
    return customers.find(customer => customer.id === customerId);
  }, [customers]);

  // Statistics
  const getTicketStats = useCallback(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const highPriority = tickets.filter(t => t.priority === 'High').length;
    
    return {
      total,
      open,
      inProgress,
      resolved,
      highPriority,
      avgResponseTime: '2.5 hours',
      satisfactionRate: '94%',
    };
  }, [tickets]);

  useEffect(() => {
    fetchTickets();
    fetchCustomers();
  }, [fetchTickets, fetchCustomers]);

  return {
    // State
    tickets,
    messages,
    customers,
    loading,
    error,
    
    // Ticket actions
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    
    // Message actions
    fetchMessages,
    sendMessage,
    
    // Customer actions
    fetchCustomers,
    getCustomerById,
    
    // Utilities
    getTicketStats,
  };
};

export default useCRM; 