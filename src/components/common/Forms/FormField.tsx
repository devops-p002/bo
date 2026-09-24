import React from 'react';
import Input from './Input';
import Select from './Select';
import DatePicker from './DatePicker';
import ValidationMessage from './ValidationMessage';

const FormField = ({
  type = 'text',
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options,
  children,
  helperText,
  required = false,
  disabled = false,
  className = '',
}: any) => {
  // Get the error message based on touched and error
  const errorMessage = touched && error ? error : null;
  
  // Get the field component based on the type
  const getFieldComponent = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            id={id}
            name={name}
            label={label}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            options={options || []}
            error={errorMessage}
            helperText={helperText}
            required={required}
            disabled={disabled}
          />
        );
      case 'date':
        return (
          <DatePicker
            id={id}
            name={name}
            label={label}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={errorMessage}
            helperText={helperText}
            required={required}
            disabled={disabled}
          />
        );
      case 'custom':
        return children;
      default:
        return (
          <Input
            id={id}
            name={name}
            type={type}
            label={label}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={errorMessage}
            helperText={helperText}
            required={required}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {getFieldComponent()}
      {!errorMessage && touched && !error && (
        <ValidationMessage type="success" message="Looks good!" />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormField; 