import { useState, useEffect } from 'react';

/**
 * Hook for managing bonus templates
 * @returns {Object} Bonus templates data and operations
 */
const useBonusTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Mock data - in a real app, this would be a GraphQL query
        setTimeout(() => {
          setTemplates([
            {
              id: '1',
              name: 'Welcome Bonus 100%',
              type: 'deposit',
              amount: 100,
              amountType: 'percentage',
              minDeposit: 20,
              maxBonus: 100,
              wagerRequirement: 35,
              expiryDays: 7,
              isActive: true,
              description: 'First deposit bonus for new players',
              termsAndConditions: 'Must be wagered 35x before withdrawal',
              createdAt: '2023-01-01',
              createdBy: 'admin',
            },
            {
              id: '2',
              name: 'Reload Bonus 50%',
              type: 'deposit',
              amount: 50,
              amountType: 'percentage',
              minDeposit: 20,
              maxBonus: 50,
              wagerRequirement: 30,
              expiryDays: 7,
              isActive: true,
              description: 'Reload bonus for existing players',
              termsAndConditions: 'Must be wagered 30x before withdrawal',
              createdAt: '2023-01-15',
              createdBy: 'admin',
            },
            {
              id: '3',
              name: 'Free Spins Package',
              type: 'free_spins',
              amount: 50,
              amountType: 'fixed',
              minDeposit: 0,
              maxBonus: 0,
              wagerRequirement: 40,
              expiryDays: 3,
              isActive: true,
              description: '50 free spins on selected slots',
              termsAndConditions: 'Winnings must be wagered 40x',
              createdAt: '2023-02-01',
              createdBy: 'admin',
            },
            {
              id: '4',
              name: 'VIP Cashback 10%',
              type: 'cashback',
              amount: 10,
              amountType: 'percentage',
              minDeposit: 0,
              maxBonus: 1000,
              wagerRequirement: 1,
              expiryDays: 30,
              isActive: true,
              description: 'Weekly cashback for VIP players',
              termsAndConditions: 'Based on net losses',
              createdAt: '2023-03-01',
              createdBy: 'admin',
            },
            {
              id: '5',
              name: 'No Deposit Bonus',
              type: 'no_deposit',
              amount: 10,
              amountType: 'fixed',
              minDeposit: 0,
              maxBonus: 10,
              wagerRequirement: 60,
              expiryDays: 3,
              isActive: false,
              description: 'Sign up bonus with no deposit required',
              termsAndConditions: 'Must be wagered 60x before withdrawal',
              createdAt: '2023-04-01',
              createdBy: 'admin',
            },
          ]);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError(err.message || 'Failed to fetch bonus templates');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const createTemplate = async (templateData) => {
    try {
      // Mock implementation
      const newTemplate = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin',
        ...templateData,
      };
      setTemplates([...templates, newTemplate]);
      return { success: true, template: newTemplate };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateTemplate = async (id, templateData) => {
    try {
      // Mock implementation
      const updatedTemplates = templates.map(template => 
        template.id === id ? { ...template, ...templateData } : template
      );
      setTemplates(updatedTemplates);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteTemplate = async (id) => {
    try {
      // Mock implementation
      const updatedTemplates = templates.filter(template => template.id !== id);
      setTemplates(updatedTemplates);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const issueBonus = async (templateId, userData) => {
    try {
      // Mock implementation - in a real app, this would connect to a GraphQL mutation
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Log the issue action
      console.log(`Bonus issued: Template ${templateId} to users:`, userData);
      
      return { 
        success: true, 
        message: `Bonus issued to ${typeof userData === 'string' ? '1 user' : `${userData.length} users`}` 
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    issueBonus,
  };
};

export default useBonusTemplates; 