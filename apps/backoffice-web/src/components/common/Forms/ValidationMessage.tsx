import React from 'react';

const ValidationMessage = ({ type = 'error', message }: any) => {
  const typeClasses: Record<string, string> = {
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <p className={`mt-1 text-sm ${typeClasses[type]}`} role="alert">
      {message}
    </p>
  );
};

export default ValidationMessage; 