import { useState, useCallback } from 'react';

// Mock data
const mockTemplates = [
  {
    id: 1,
    name: 'Welcome Bonus',
    type: 'welcome',
    amount: 100,
    wagering: 35,
    maxWin: 1000,
    validity: 7,
    status: 'active',
  },
  {
    id: 2,
    name: 'Reload Bonus',
    type: 'reload',
    amount: 50,
    wagering: 25,
    maxWin: 500,
    validity: 3,
    status: 'active',
  },
];

export const useBonusTemplates = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTemplate = useCallback(async (templateData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTemplate = {
        id: templates.length + 1,
        ...templateData,
        status: 'active',
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates]);

  const updateTemplate = useCallback(async (id, templateData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTemplates(prev =>
        prev.map(template =>
          template.id === id ? { ...template, ...templateData } : template
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (id) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const issueBonus = useCallback(async (userId, templateId, amount) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Here you would typically make an API call to issue the bonus
      console.log(`Issuing bonus to user ${userId} using template ${templateId} with amount ${amount}`);
      
      return {
        success: true,
        message: 'Bonus issued successfully',
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates]);

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