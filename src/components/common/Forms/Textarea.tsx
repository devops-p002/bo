import React, { forwardRef } from 'react';

const Textarea = forwardRef<HTMLTextAreaElement, any>(({
  id,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  rows = 4,
  cols,
  maxLength,
  className = '',
  error = false,
  ...props
}, ref) => {
  const baseClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm text-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200 resize-vertical
  `;

  const stateClasses = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500';

  const disabledClasses = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
    : 'bg-white hover:border-gray-400';

  const readOnlyClasses = readOnly
    ? 'bg-gray-50 text-gray-700 cursor-default'
    : '';

  const combinedClasses = `
    ${baseClasses}
    ${stateClasses}
    ${disabledClasses}
    ${readOnlyClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <textarea
      ref={ref}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      rows={rows}
      cols={cols}
      maxLength={maxLength}
      className={combinedClasses}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 