import { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { isDarkTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className={`flex h-screen ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile overlay - only show on mobile when sidebar is fully open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-16'
      }`}>
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 