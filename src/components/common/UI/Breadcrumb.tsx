import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { navigationMenu } from '../../../config/routes';

const Breadcrumb = () => {
  const location = useLocation();
  const { isDarkTheme } = useTheme();
  
  // Generate breadcrumb based on current path
  const generateBreadcrumb = () => {
    const path = location.pathname;
    const breadcrumbs: any[] = [{ title: 'Home', path: '/dashboard', icon: 'home' }];
    
    // Find matching navigation item
    for (const item of navigationMenu) {
      // Check if current path matches main section
      if (path === item.path) {
        breadcrumbs.push({ title: item.title, path: item.path });
        break;
      }
      
      // Check children
      if (item.children) {
        for (const child of item.children) {
          if (path === child.path) {
            breadcrumbs.push({ title: item.title, path: item.path });
            breadcrumbs.push({ title: child.title, path: child.path });
            break;
          }
        }
      }
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumb();
  
  return (
    <nav className="flex items-center space-x-2 text-xs">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index === 0 && (
            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          )}
          
          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
              {crumb.title}
            </span>
          ) : (
            // Previous pages - clickable
            <Link 
              to={crumb.path}
              className={`${isDarkTheme ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              {crumb.title}
            </Link>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <span className={`${isDarkTheme ? 'text-gray-600' : 'text-gray-400'}`}>
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb; 