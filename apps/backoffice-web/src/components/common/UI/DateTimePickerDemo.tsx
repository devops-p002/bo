import React, { useState } from 'react';
import DateTimePicker from './DateTimePicker';

const DateTimePickerDemo = () => {
  const [dateTime1, setDateTime1] = useState(new Date());
  const [dateTime2, setDateTime2] = useState(new Date());

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">DateTimePicker Demo</h2>
      
      {/* DateTime Picker Example 1 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Date & Time Picker (Default)
        </label>
        <DateTimePicker
          value={dateTime1}
          onChange={setDateTime1}
          placeholder="Select date and time"
          className="w-64"
        />
        <p className="text-sm text-gray-500">
          Selected: {dateTime1 ? dateTime1.toString() : 'None'}
        </p>
      </div>

      {/* DateTime Picker Example 2 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Date & Time Picker (Custom Placeholder)
        </label>
        <DateTimePicker
          value={dateTime2}
          onChange={setDateTime2}
          placeholder="Choose your date and time"
          className="w-64"
        />
        <p className="text-sm text-gray-500">
          Selected: {dateTime2 ? dateTime2.toString() : 'None'}
        </p>
      </div>

      {/* Disabled Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Disabled Picker
        </label>
        <DateTimePicker
          value={new Date()}
          onChange={() => {}}
          placeholder="Disabled picker"
          disabled={true}
          className="w-64"
        />
      </div>
    </div>
  );
};

export default DateTimePickerDemo; 