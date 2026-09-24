import { useAuth } from '../../../context/AuthContext';
import { getNavigationByPermission } from '../../../config/routes';
import Navigation from './Navigation';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  
  // Get navigation items filtered by user permissions
  const navItems = getNavigationByPermission(user?.permissions || []);
  
  return (
    <aside 
      className={`bg-gray-800 text-white min-h-screen fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out flex flex-col ${
        isOpen 
          ? 'w-64 translate-x-0' 
          : 'w-16 translate-x-0 md:translate-x-0'
      } ${!isOpen ? '-translate-x-full md:translate-x-0' : ''}`}
    >
      {/* Fixed Logo Header - Match header height exactly */}
      <div className={`flex-shrink-0 px-4 py-2 border-b border-gray-700 bg-gray-800 ${!isOpen ? 'px-2 py-2' : ''}`}>
        <div className="flex items-center justify-between">
          {isOpen ? (
            <h1 className="text-sm font-bold text-white">Gaming Platform</h1>
          ) : (
            <div className="text-sm font-bold text-center w-full text-white">GP</div>
          )}
          <button 
            onClick={onToggle} 
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <Navigation items={navItems} isCollapsed={!isOpen} />
      </div>
    </aside>
  );
};

export default Sidebar; 