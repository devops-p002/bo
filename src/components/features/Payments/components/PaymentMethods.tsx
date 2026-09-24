import React, { useState, useEffect } from 'react';
import { Card, Modal, Button } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';
import usePayments from '../hooks/usePayments';

const PaymentMethods = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'active',
    minAmount: '',
    maxAmount: '',
    processingTime: '',
    fees: '',
    description: ''
  });

  const { paymentMethods, loading, error, fetchPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = usePayments();

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handleOpenModal = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData(method);
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        type: '',
        status: 'active',
        minAmount: '',
        maxAmount: '',
        processingTime: '',
        fees: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMethod(null);
    setFormData({
      name: '',
      type: '',
      status: 'active',
      minAmount: '',
      maxAmount: '',
      processingTime: '',
      fees: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, formData);
      } else {
        await createPaymentMethod(formData);
      }
      handleCloseModal();
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleDelete = async (methodId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod(methodId);
        fetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      credit_card: '💳',
      bank_transfer: '🏦',
      e_wallet: '📱',
      cryptocurrency: '₿',
      check: '📄'
    };
    return icons[type] || '💰';
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <Button onClick={() => handleOpenModal()}>
              Add Payment Method
            </Button>
          </div>

          {loading ? (
            <div className="animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods?.map((method) => (
                <div key={method.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(method.type)}</span>
                      <h3 className="font-semibold">{method.name}</h3>
                    </div>
                    {getStatusBadge(method.status)}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Type:</span> {method.type.replace('_', ' ').toUpperCase()}</p>
                    <p><span className="font-medium">Limits:</span> ${method.minAmount} - ${method.maxAmount}</p>
                    <p><span className="font-medium">Processing:</span> {method.processingTime}</p>
                    <p><span className="font-medium">Fees:</span> {method.fees}</p>
                  </div>
                  
                  {method.description && (
                    <p className="text-sm text-gray-500 mb-3">{method.description}</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenModal(method)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Method Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: '', label: 'Select Type' },
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'e_wallet', label: 'E-Wallet' },
                { value: 'cryptocurrency', label: 'Cryptocurrency' },
                { value: 'check', label: 'Check' }
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Amount"
              type="number"
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
              required
            />
            <Input
              label="Maximum Amount"
              type="number"
              value={formData.maxAmount}
              onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Processing Time"
              type="text"
              value={formData.processingTime}
              onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
              placeholder="e.g., 1-3 business days"
              required
            />
            <Input
              label="Fees"
              type="text"
              value={formData.fees}
              onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              placeholder="e.g., 2.5% or $5"
              required
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'maintenance', label: 'Maintenance' }
            ]}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingMethod ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentMethods; 