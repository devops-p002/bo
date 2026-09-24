import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Icon mapping for string icon names
const getIcon = (iconName) => {
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    users: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    'credit-card': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    shield: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'trending-up': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    megaphone: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    'bar-chart': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    'message-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    'share-2': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
    ),
    settings: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    layout: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    'users-2': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  };

  return icons[iconName] || icons.dashboard;
};

const Navigation = ({ items, isCollapsed = false }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Auto-collapse behavior: when one item is expanded, close others
  const toggleExpanded = (itemTitle) => {
    const newExpanded = new Set();
    
    // If the clicked item is already expanded, close it
    if (expandedItems.has(itemTitle)) {
      // Close the current item (newExpanded remains empty)
    } else {
      // Open only the clicked item, close all others
      newExpanded.add(itemTitle);
    }
    
    setExpandedItems(newExpanded);
    
    // Scroll the expanded item into view after a short delay
    setTimeout(() => {
      const expandedElement = document.querySelector(`[data-nav-item="${itemTitle}"]`);
      if (expandedElement && !expandedItems.has(itemTitle)) {
        expandedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const isPathActive = (path) => {
    // Exact match for dashboard to prevent it being always active
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    // For other paths, allow both exact match and sub-path matches
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavigationItem = ({ item, isSubItem = false }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.title);
    const isActive = isPathActive(item.path);
    const hasActiveChild = hasChildren && item.children.some(child => isPathActive(child.path));

    // Function to get the first available sub-section path
    const getFirstSubSectionPath = (item) => {
      if (item.children && item.children.length > 0) {
        return item.children[0].path;
      }
      return item.path;
    };

    if (hasChildren && !isCollapsed) {
      return (
        <li data-nav-item={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`
              w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors text-left text-xs
              ${isActive || hasActiveChild || isExpanded
                ? 'bg-primary-600 text-white' 
                : 'text-gray-300 hover:bg-navy-700 hover:text-white'}
              ${isSubItem ? 'pl-8' : ''}
            `}
          >
            <div className="flex items-center">
              {!isSubItem && (
                <span className="mr-3">{getIcon(item.icon)}</span>
              )}
              <span>{item.title}</span>
              {item.badge && !isCollapsed && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1 py-0.5 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <svg
              className={`h-3 w-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="overflow-hidden transition-all duration-300 ease-in-out">
              <ul className="mt-2 mb-2 space-y-1 border-l-2 border-navy-700 ml-4 pl-2">
                {item.children.map((child) => (
                  <NavigationItem
                    key={child.title}
                    item={child}
                    isSubItem={true}
                  />
                ))}
              </ul>
            </div>
          )}
        </li>
      );
    }

    // For collapsed mode with children, make icon clickable to go to first sub-section
    if (hasChildren && isCollapsed) {
      return (
        <li>
          <Link
            to={getFirstSubSectionPath(item)}
            className={`
              flex items-center rounded-md transition-colors relative group
              ${isActive || hasActiveChild
                ? 'bg-primary-600 text-white' 
                : 'text-gray-300 hover:bg-navy-700 hover:text-white'}
              px-2 py-3 justify-center
            `}
            title={`${item.title} - Go to ${item.children[0]?.title || 'first section'}`}
          >
            <span>{getIcon(item.icon)}</span>
            
            {/* Enhanced tooltip for collapsed state with first sub-section info */}
            <div className="absolute left-full ml-2 px-3 py-2 bg-navy-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              <div className="font-semibold">{item.title}</div>
              <div className="text-gray-300 text-xs mt-1">→ {item.children[0]?.title || 'Go to first section'}</div>
            </div>
          </Link>
        </li>
      );
    }

    return (
      <li>
        <Link
          to={item.path}
          className={`
            flex items-center rounded-md transition-colors relative group
            ${isActive 
              ? 'bg-primary-600 text-white' 
              : 'text-gray-300 hover:bg-navy-700 hover:text-white'}
            ${isCollapsed && !isSubItem ? 'px-2 py-3 justify-center' : 'px-4 py-2'}
            ${isSubItem ? 'pl-6 ml-2 mr-2 bg-navy-800 hover:bg-navy-700 border-l-2 border-navy-700 text-xs' : 'text-xs'}
          `}
          title={isCollapsed ? item.title : ''}
        >
          {/* Greater than sign for sub-items */}
          {isSubItem && !isCollapsed && (
            <span className="mr-3 text-gray-400 font-bold text-xs">
              ›
            </span>
          )}
          
          {!isSubItem && (
            <span className={isCollapsed ? '' : 'mr-3'}>{getIcon(item.icon)}</span>
          )}
          {(!isCollapsed || isSubItem) && <span>{item.title}</span>}
          {item.badge && !isCollapsed && !isSubItem && (
            <span className="ml-auto bg-red-500 text-white text-xs px-1 py-0.5 rounded-full text-xs">
              {item.badge}
            </span>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && !isSubItem && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-navy-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.title}
            </div>
          )}
        </Link>
      </li>
    );
  };

  return (
    <nav className="p-2 pb-8">
      <ul className="space-y-1">
        {items.map((item) => (
          <NavigationItem key={item.title} item={item} />
        ))}
      </ul>
    </nav>
  );
};

export default Navigation; 