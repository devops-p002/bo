import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  padding = true,
  border = true,
  shadow = true,
  rounded = true,
  footer,
  header,
  headerActions,
  ...props
}: any) => {
  // Card classes
  const cardClasses = [
    'bg-white',
    border ? 'border border-gray-200' : '',
    shadow ? 'shadow-sm' : '',
    rounded ? 'rounded-lg' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Content classes
  const contentClasses = padding ? 'p-4' : '';
  
  return (
    <div
      className={`${cardClasses} ${contentClasses}`}
      {...props}
    >
      {/* Header */}
      {(title || header || headerActions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            {header || (
              <>
                {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
              </>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className={contentClasses}>
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;