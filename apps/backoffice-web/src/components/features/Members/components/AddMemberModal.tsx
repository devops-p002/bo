import React from 'react';
import { Modal, Button } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';

const VIP_LEVEL_OPTIONS = [
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'DIAMOND', label: 'Diamond' },
];

const AddMemberModal = ({ isOpen, onClose, formData, onChange, onSubmit, saving, error }) => {
  const handleChange = (e) => onChange(e.target.name, e.target.value);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Member"
      footer={
        <>
          <Button variant="light" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={onSubmit} isLoading={saving}>Create Member</Button>
        </>
      }
    >
      {error && (
        <div className="mb-3 text-xs text-error bg-error-light border border-error rounded-md px-3 py-2">
          {error}
        </div>
      )}
      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Input
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Optional - a display handle, not used to log in"
      />
      <Input
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
      />
      <Input
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
      />
      <Input
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <Select
        label="VIP Level"
        name="vipLevel"
        value={formData.vipLevel}
        onChange={handleChange}
        options={VIP_LEVEL_OPTIONS}
      />
    </Modal>
  );
};

export default AddMemberModal;
