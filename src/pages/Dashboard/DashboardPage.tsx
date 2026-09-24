import { useEffect } from 'react';
import Dashboard from '../../components/features/Dashboard/Dashboard';
import { useNotification } from '../../context/NotificationContext';

const DashboardPage = () => {
  const { success } = useNotification();
  
  useEffect(() => {
    // Show welcome message
    success('Welcome to the Gaming Platform Admin Dashboard');
  }, [success]);
  
  return <Dashboard />;
};

export default DashboardPage; 