import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import useCommissions from '../hooks/useCommissions';

const CommissionSettings = () => {
  const [settings, setSettings] = useState({
    registrationCommission: {
      enabled: true,
      amount: 10,
      type: 'fixed',
      currency: 'USD'
    },
    depositCommission: {
      enabled: true,
      rate: 5,
      type: 'percentage',
      minDeposit: 20,
      maxCommission: 500
    },
    revenueShare: {
      enabled: true,
      rate: 25,
      levels: [
        { level: 1, rate: 25 },
        { level: 2, rate: 15 },
        { level: 3, rate: 10 },
        { level: 4, rate: 5 },
        { level: 5, rate: 2 }
      ]
    },
    cpa: {
      enabled: false,
      amount: 100,
      requirements: {
        minDeposit: 50,
        timeFrame: 30
      }
    }
  });

  const [commissionRules, setCommissionRules] = useState([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { 
    commissionSettings, 
    commissionRulesData, 
    loading, 
    error, 
    fetchCommissionSettings, 
    updateCommissionSettings,
    createCommissionRule,
    updateCommissionRule,
    deleteCommissionRule,
    saveSettings 
  } = useCommissions();

  useEffect(() => {
    fetchCommissionSettings();
  }, [fetchCommissionSettings]);

  useEffect(() => {
    if (commissionSettings) {
      setSettings(commissionSettings);
    }
    if (commissionRulesData) {
      setCommissionRules(commissionRulesData);
    }
  }, [commissionSettings, commissionRulesData]);

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleLevelRateChange = (levelIndex, newRate) => {
    setSettings(prev => ({
      ...prev,
      revenueShare: {
        ...prev.revenueShare,
        levels: prev.revenueShare.levels.map((level, index) =>
          index === levelIndex ? { ...level, rate: newRate } : level
        )
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await saveSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleCreateRule = () => {
    setSelectedRule({
      id: '',
      name: '',
      type: 'percentage',
      value: 0,
      conditions: {
        minDeposit: 0,
        maxDeposit: null,
        timeFrame: null,
        gameCategories: [],
        userTiers: []
      },
      isActive: true,
      description: ''
    });
    setIsEditing(false);
    setShowRuleModal(true);
  };

  const handleEditRule = (rule) => {
    setSelectedRule({ ...rule });
    setIsEditing(true);
    setShowRuleModal(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await deleteCommissionRule(ruleId);
        setCommissionRules(prev => prev.filter(rule => rule.id !== ruleId));
        alert('Rule deleted successfully!');
      } catch (error) {
        console.error('Error deleting rule:', error);
        alert('Error deleting rule. Please try again.');
      }
    }
  };

  const handleSaveRule = async () => {
    try {
      if (isEditing) {
        await updateCommissionRule(selectedRule.id, selectedRule);
        setCommissionRules(prev => 
          prev.map(rule => rule.id === selectedRule.id ? selectedRule : rule)
        );
      } else {
        const newRule = await createCommissionRule(selectedRule);
        setCommissionRules(prev => [...prev, newRule]);
      }
      setShowRuleModal(false);
      alert('Rule saved successfully!');
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Error saving rule. Please try again.');
    }
  };

  const ruleColumns = [
    { header: 'Rule Name', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    { header: 'Value', accessor: 'value' },
    { header: 'Min Deposit', accessor: 'minDeposit' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const processedRuleData = commissionRules.map(rule => ({
    ...rule,
    type: rule.type.charAt(0).toUpperCase() + rule.type.slice(1),
    value: rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value}`,
    minDeposit: `$${rule.conditions.minDeposit}`,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {rule.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleEditRule(rule)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteRule(rule.id)}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    )
  }));

  const renderRuleModal = () => {
    if (!selectedRule) return null;

    return (
      <Modal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        title={isEditing ? 'Edit Commission Rule' : 'Create Commission Rule'}
        size="large"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rule Name"
              value={selectedRule.name}
              onChange={(e) => setSelectedRule(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter rule name"
            />
            <Select
              label="Commission Type"
              value={selectedRule.type}
              onChange={(e) => setSelectedRule(prev => ({ ...prev, type: e.target.value }))}
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={selectedRule.type === 'percentage' ? 'Percentage Rate' : 'Fixed Amount'}
              type="number"
              value={selectedRule.value}
              onChange={(e) => setSelectedRule(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
              placeholder={selectedRule.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={selectedRule.isActive}
                onChange={(e) => setSelectedRule(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm">Active</label>
            </div>
          </div>

          {/* Conditions */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Conditions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Deposit"
                  type="number"
                  value={selectedRule.conditions.minDeposit}
                  onChange={(e) => setSelectedRule(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, minDeposit: parseFloat(e.target.value) }
                  }))}
                  placeholder="Minimum deposit amount"
                />
                <Input
                  label="Maximum Deposit (Optional)"
                  type="number"
                  value={selectedRule.conditions.maxDeposit || ''}
                  onChange={(e) => setSelectedRule(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, maxDeposit: e.target.value ? parseFloat(e.target.value) : null }
                  }))}
                  placeholder="Maximum deposit amount"
                />
                <Input
                  label="Time Frame (Days)"
                  type="number"
                  value={selectedRule.conditions.timeFrame || ''}
                  onChange={(e) => setSelectedRule(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, timeFrame: e.target.value ? parseInt(e.target.value) : null }
                  }))}
                  placeholder="Time frame in days"
                />
                <Select
                  label="User Tiers"
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !selectedRule.conditions.userTiers.includes(e.target.value)) {
                      setSelectedRule(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          userTiers: [...prev.conditions.userTiers, e.target.value]
                        }
                      }));
                    }
                  }}
                  options={[
                    { value: '', label: 'Select tier to add...' },
                    { value: 'bronze', label: 'Bronze' },
                    { value: 'silver', label: 'Silver' },
                    { value: 'gold', label: 'Gold' },
                    { value: 'platinum', label: 'Platinum' },
                    { value: 'vip', label: 'VIP' }
                  ]}
                />
              </div>

              {/* Selected User Tiers */}
              {selectedRule.conditions.userTiers.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Tiers:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedRule.conditions.userTiers.map((tier, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                      >
                        {tier}
                        <button
                          onClick={() => setSelectedRule(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              userTiers: prev.conditions.userTiers.filter((_, i) => i !== index)
                            }
                          }))}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          <Textarea
            label="Description"
            value={selectedRule.description}
            onChange={(e) => setSelectedRule(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter rule description"
            rows={3}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowRuleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRule}>
              {isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      {/* Commission Settings */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Commission Settings</h2>
            <Button variant="primary" onClick={handleSaveSettings}>
              Save All Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Commission */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Registration Commission</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="regCommissionEnabled"
                      checked={settings.registrationCommission.enabled}
                      onChange={(e) => handleSettingChange('registrationCommission', 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="regCommissionEnabled" className="text-sm">Enabled</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Commission Amount"
                    type="number"
                    value={settings.registrationCommission.amount}
                    onChange={(e) => handleSettingChange('registrationCommission', 'amount', parseFloat(e.target.value))}
                    disabled={!settings.registrationCommission.enabled}
                  />
                  <Select
                    label="Commission Type"
                    value={settings.registrationCommission.type}
                    onChange={(e) => handleSettingChange('registrationCommission', 'type', e.target.value)}
                    disabled={!settings.registrationCommission.enabled}
                    options={[
                      { value: 'fixed', label: 'Fixed Amount' },
                      { value: 'percentage', label: 'Percentage' }
                    ]}
                  />
                </div>
              </div>
            </Card>

            {/* Deposit Commission */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Deposit Commission</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="depCommissionEnabled"
                      checked={settings.depositCommission.enabled}
                      onChange={(e) => handleSettingChange('depositCommission', 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="depCommissionEnabled" className="text-sm">Enabled</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Commission Rate (%)"
                    type="number"
                    value={settings.depositCommission.rate}
                    onChange={(e) => handleSettingChange('depositCommission', 'rate', parseFloat(e.target.value))}
                    disabled={!settings.depositCommission.enabled}
                  />
                  <Input
                    label="Minimum Deposit"
                    type="number"
                    value={settings.depositCommission.minDeposit}
                    onChange={(e) => handleSettingChange('depositCommission', 'minDeposit', parseFloat(e.target.value))}
                    disabled={!settings.depositCommission.enabled}
                  />
                  <Input
                    label="Maximum Commission"
                    type="number"
                    value={settings.depositCommission.maxCommission}
                    onChange={(e) => handleSettingChange('depositCommission', 'maxCommission', parseFloat(e.target.value))}
                    disabled={!settings.depositCommission.enabled}
                  />
                </div>
              </div>
            </Card>

            {/* Revenue Share */}
            <Card className="lg:col-span-2">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Revenue Share (Multi-Level)</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="revShareEnabled"
                      checked={settings.revenueShare.enabled}
                      onChange={(e) => handleSettingChange('revenueShare', 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="revShareEnabled" className="text-sm">Enabled</label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {settings.revenueShare.levels.map((level, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level {level.level} Rate (%)
                      </label>
                      <Input
                        type="number"
                        value={level.rate}
                        onChange={(e) => handleLevelRateChange(index, parseFloat(e.target.value))}
                        disabled={!settings.revenueShare.enabled}
                        min="0"
                        max="100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* CPA Commission */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">CPA Commission</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cpaEnabled"
                      checked={settings.cpa.enabled}
                      onChange={(e) => handleSettingChange('cpa', 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="cpaEnabled" className="text-sm">Enabled</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input
                    label="CPA Amount"
                    type="number"
                    value={settings.cpa.amount}
                    onChange={(e) => handleSettingChange('cpa', 'amount', parseFloat(e.target.value))}
                    disabled={!settings.cpa.enabled}
                  />
                  <Input
                    label="Minimum Deposit Requirement"
                    type="number"
                    value={settings.cpa.requirements.minDeposit}
                    onChange={(e) => handleSettingChange('cpa', 'requirements', {
                      ...settings.cpa.requirements,
                      minDeposit: parseFloat(e.target.value)
                    })}
                    disabled={!settings.cpa.enabled}
                  />
                  <Input
                    label="Time Frame (Days)"
                    type="number"
                    value={settings.cpa.requirements.timeFrame}
                    onChange={(e) => handleSettingChange('cpa', 'requirements', {
                      ...settings.cpa.requirements,
                      timeFrame: parseInt(e.target.value)
                    })}
                    disabled={!settings.cpa.enabled}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Commission Rules */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Commission Rules</h2>
            <Button variant="primary" onClick={handleCreateRule}>
              Create New Rule
            </Button>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Table
              columns={ruleColumns}
              data={processedRuleData}
            />
          )}
        </div>
      </Card>

      {/* Rule Modal */}
      {renderRuleModal()}
    </div>
  );
};

export default CommissionSettings; 