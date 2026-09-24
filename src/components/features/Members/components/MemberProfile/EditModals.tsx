import React from 'react';
import { useTheme } from '../../../../../context/ThemeContext';

// Fields the mock UI exposed here that have no backend equivalent
// (UpdateUserInput only has: username, email, firstName, lastName, phone,
// dateOfBirth, country, currency, language, role, status, vipLevel,
// preferences). They're kept visible but disabled, with a note, rather than
// silently dropped or silently pretending to save - see task report.
const UNSUPPORTED_NOTE = 'Not supported by backend';

const EditModals = ({
  editModals,
  editData,
  toggleEditModal,
  handleInputChange,
  onSaveGeneral,
  onSaveStatus,
  onSaveContact,
  saving = false,
  saveError = null,
  vipLevels = [],
  statuses = [],
}) => {
  const { isDarkTheme } = useTheme();

  const inputClass = `w-full px-2 py-1.5 border rounded-md text-xs ${
    isDarkTheme
      ? 'bg-gray-700 border-gray-600 text-gray-100'
      : 'bg-white border-gray-300 text-gray-900'
  }`;
  const disabledInputClass = `w-full px-2 py-1.5 border rounded-md text-xs cursor-not-allowed opacity-50 ${
    isDarkTheme
      ? 'bg-gray-700 border-gray-600 text-gray-100'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const ErrorBanner = () => (
    saveError ? (
      <div className="mx-3 mt-3 px-2 py-1.5 text-xs bg-red-100 text-red-800 rounded">{saveError}</div>
    ) : null
  );

  // Edit General Modal
  const EditGeneralModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${editModals.general ? '' : 'hidden'}`}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>Edit General</h3>
          <button
            onClick={() => toggleEditModal('general')}
            className={`text-gray-400 hover:text-gray-600 ${isDarkTheme ? 'hover:text-gray-300' : ''}`}
          >
            ×
          </button>
        </div>

        <ErrorBanner />

        <div className="p-3 space-y-3">
          {/* First / Last Name (backend stores these separately; fullName
              is a computed field, so it isn't directly editable) */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              First Name
            </label>
            <div className="col-span-3">
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Last Name
            </label>
            <div className="col-span-3">
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Password - no admin "set password directly" mutation exists
              (only the token-based forgotPassword/resetPassword flow) */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="col-span-3">
              <input
                type="password"
                disabled
                placeholder={UNSUPPORTED_NOTE}
                className={disabledInputClass}
              />
            </div>
          </div>

          {/* Birthday */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Birthday
            </label>
            <div className="col-span-3">
              <input
                type="date"
                value={editData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Gender / Marital - not tracked by the backend */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Gender
            </label>
            <div className="col-span-3">
              <input type="text" disabled placeholder={UNSUPPORTED_NOTE} className={disabledInputClass} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Marital
            </label>
            <div className="col-span-3">
              <input type="text" disabled placeholder={UNSUPPORTED_NOTE} className={disabledInputClass} />
            </div>
          </div>

          {/* VIP - real field, real enum */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              VIP Level
            </label>
            <div className="col-span-3">
              <select
                value={editData.vip}
                onChange={(e) => handleInputChange('vip', e.target.value)}
                className={inputClass}
              >
                {vipLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* VIP experience points, member groups and free-text remarks
              have no backend model to save to */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              VIP Experience Adjustment
            </label>
            <div className="col-span-3">
              <input type="text" disabled placeholder={UNSUPPORTED_NOTE} className={disabledInputClass} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Group
            </label>
            <div className="col-span-3">
              <input type="text" disabled placeholder={`${UNSUPPORTED_NOTE} (no member-group model)`} className={disabledInputClass} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 items-start">
            <label className={`text-xs font-medium text-right pt-1.5 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              User Remark
            </label>
            <div className="col-span-3">
              <textarea disabled rows={2} placeholder={UNSUPPORTED_NOTE} className={disabledInputClass} />
            </div>
          </div>
        </div>

        <div className={`flex justify-end space-x-2 p-3 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => toggleEditModal('general')}
            className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSaveGeneral}
            disabled={saving}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Status Modal
  const EditStatusModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${editModals.status ? '' : 'hidden'}`}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-md mx-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>Edit Status</h3>
          <button
            onClick={() => toggleEditModal('status')}
            className={`text-gray-400 hover:text-gray-600 ${isDarkTheme ? 'hover:text-gray-300' : ''}`}
          >
            ×
          </button>
        </div>

        <ErrorBanner />

        <div className="p-3">
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <div className="col-span-3 flex flex-wrap gap-3">
              {statuses.map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={editData.status === status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mr-1.5"
                  />
                  <span className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={`flex justify-end space-x-2 p-3 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => toggleEditModal('status')}
            className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSaveStatus}
            disabled={saving}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Contact Modal
  const EditContactModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${editModals.contact ? '' : 'hidden'}`}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>Edit Contact</h3>
          <button
            onClick={() => toggleEditModal('contact')}
            className={`text-gray-400 hover:text-gray-600 ${isDarkTheme ? 'hover:text-gray-300' : ''}`}
          >
            ×
          </button>
        </div>

        <ErrorBanner />

        <div className="p-3 space-y-3">
          {/* Phone Number (the backend has a single `phone` field) */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number
            </label>
            <div className="col-span-3">
              <input
                type="text"
                value={editData.phoneNumber1}
                onChange={(e) => handleInputChange('phoneNumber1', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* A second/third phone number has nowhere to be saved - the User
              model only has one `phone` column */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number 2
            </label>
            <div className="col-span-3">
              <input type="text" disabled placeholder={`${UNSUPPORTED_NOTE} (single phone field only)`} className={disabledInputClass} />
            </div>
          </div>

          {/* Email (Required) */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <label className={`text-xs font-medium text-right ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              Email <span className="text-red-500">*</span>
            </label>
            <div className="col-span-3">
              <input
                type="email"
                value={editData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className={`flex justify-end space-x-2 p-3 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => toggleEditModal('contact')}
            className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSaveContact}
            disabled={saving}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <EditGeneralModal />
      <EditStatusModal />
      <EditContactModal />
    </>
  );
};

export default EditModals;
