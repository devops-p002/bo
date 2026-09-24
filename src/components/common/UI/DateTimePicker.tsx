import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const DateTimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select date and time",
  disabled = false,
  className = ""
}) => {
  const { isDarkTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hours, setHours] = useState(value ? new Date(value).getHours() : 0);
  const [minutes, setMinutes] = useState(value ? new Date(value).getMinutes() : 0);
  const [seconds, setSeconds] = useState(value ? new Date(value).getSeconds() : 0);
  
  // Custom dropdown states
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);
  const [showMinutesDropdown, setShowMinutesDropdown] = useState(false);
  const [showSecondsDropdown, setShowSecondsDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowHoursDropdown(false);
        setShowMinutesDropdown(false);
        setShowSecondsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format display value - Always include time
  const formatDisplayValue = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isSelected
      });
    }
    
    return days;
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(seconds);
    setSelectedDate(newDate);
  };

  // Handle apply button
  const handleApply = () => {
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours);
    finalDate.setMinutes(minutes);
    finalDate.setSeconds(seconds);
    if (onChange) onChange(finalDate);
    setIsOpen(false);
  };

  // Handle cancel button
  const handleCancel = () => {
    if (value) {
      setSelectedDate(new Date(value));
      setHours(new Date(value).getHours());
      setMinutes(new Date(value).getMinutes());
      setSeconds(new Date(value).getSeconds());
    }
    setIsOpen(false);
  };

  // Navigate months
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const calendarDays = getCalendarDays();

  return (
    <div className="relative">
      {/* Input Field - Matches Member Search field styling */}
      <div
        ref={inputRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between px-2 py-1 text-xs border rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : isDarkTheme ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-50'}
          ${className}
        `}
      >
        <span className={`text-xs ${value ? (isDarkTheme ? 'text-gray-200' : 'text-gray-900') : (isDarkTheme ? 'text-gray-400' : 'text-gray-500')}`}>
          {value ? formatDisplayValue(new Date(value)) : placeholder}
        </span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute top-full left-0 mt-1 p-2 border rounded-lg shadow-lg z-50 ${
            isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}
          style={{ width: '240px' }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigateMonth(-1)}
              className={`p-0.5 rounded ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className={`text-xs font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            
            <button
              onClick={() => navigateMonth(1)}
              className={`p-0.5 rounded ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Days Header */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className={`text-center text-xs font-medium py-0.5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {calendarDays.map((dayObj, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(dayObj.date)}
                className={`
                  text-center text-xs py-0.5 rounded transition-colors min-h-[20px] flex items-center justify-center
                  ${!dayObj.isCurrentMonth 
                    ? (isDarkTheme ? 'text-gray-600' : 'text-gray-300') 
                    : (isDarkTheme ? 'text-gray-200' : 'text-gray-700')
                  }
                  ${dayObj.isSelected ? 'bg-blue-500 text-white' : ''}
                  ${!dayObj.isSelected && dayObj.isCurrentMonth 
                    ? (isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100') 
                    : ''
                  }
                `}
              >
                {dayObj.day}
              </button>
            ))}
          </div>

          {/* Time Picker - Always visible */}
          <div className={`border-t pt-2 mb-2 ${isDarkTheme ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center justify-center space-x-1">
              {/* Hours */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowHoursDropdown(!showHoursDropdown);
                    setShowMinutesDropdown(false);
                    setShowSecondsDropdown(false);
                  }}
                  className={`px-1 py-0.5 border rounded text-center text-xs w-12 cursor-pointer flex items-center justify-between ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {String(hours).padStart(2, '0')}
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showHoursDropdown && (
                  <div 
                    className={`absolute top-full left-0 mt-1 w-12 max-h-32 overflow-y-auto border rounded shadow-lg z-50 ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setHours(i);
                          setShowHoursDropdown(false);
                        }}
                        className={`w-full px-1 py-1 text-xs text-center transition-colors ${
                          hours === i 
                            ? 'bg-blue-500 text-white' 
                            : `hover:bg-blue-500 hover:text-white ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`
                        }`}
                      >
                        {String(i).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>:</span>

              {/* Minutes */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMinutesDropdown(!showMinutesDropdown);
                    setShowHoursDropdown(false);
                    setShowSecondsDropdown(false);
                  }}
                  className={`px-1 py-0.5 border rounded text-center text-xs w-12 cursor-pointer flex items-center justify-between ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {String(minutes).padStart(2, '0')}
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showMinutesDropdown && (
                  <div 
                    className={`absolute top-full left-0 mt-1 w-12 max-h-32 overflow-y-auto border rounded shadow-lg z-50 ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setMinutes(i);
                          setShowMinutesDropdown(false);
                        }}
                        className={`w-full px-1 py-1 text-xs text-center transition-colors ${
                          minutes === i 
                            ? 'bg-blue-500 text-white' 
                            : `hover:bg-blue-500 hover:text-white ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`
                        }`}
                      >
                        {String(i).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>:</span>

              {/* Seconds */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSecondsDropdown(!showSecondsDropdown);
                    setShowHoursDropdown(false);
                    setShowMinutesDropdown(false);
                  }}
                  className={`px-1 py-0.5 border rounded text-center text-xs w-12 cursor-pointer flex items-center justify-between ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {String(seconds).padStart(2, '0')}
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSecondsDropdown && (
                  <div 
                    className={`absolute top-full left-0 mt-1 w-12 max-h-32 overflow-y-auto border rounded shadow-lg z-50 ${
                      isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSeconds(i);
                          setShowSecondsDropdown(false);
                        }}
                        className={`w-full px-1 py-1 text-xs text-center transition-colors ${
                          seconds === i 
                            ? 'bg-blue-500 text-white' 
                            : `hover:bg-blue-500 hover:text-white ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`
                        }`}
                      >
                        {String(i).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-1">
            <button
              onClick={handleCancel}
              className={`px-2 py-1 text-xs border rounded transition-colors ${
                isDarkTheme 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker; 