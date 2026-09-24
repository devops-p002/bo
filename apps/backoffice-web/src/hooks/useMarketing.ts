import { useState, useCallback } from 'react';

// Mock data
const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Welcome Bonus',
    type: 'welcome',
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    budget: 50000,
    spent: 25000,
    conversions: 150,
  },
  {
    id: 2,
    name: 'Weekend Reload Bonus',
    type: 'reload',
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    budget: 100000,
    spent: 45000,
    conversions: 300,
  },
];

const mockPromos = [
  {
    id: 1,
    name: 'Free Spins Weekend',
    type: 'free_spins',
    status: 'active',
    startDate: '2024-06-15',
    endDate: '2024-06-16',
    budget: 10000,
    spent: 5000,
    conversions: 75,
  },
  {
    id: 2,
    name: 'Cashback Monday',
    type: 'cashback',
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    budget: 25000,
    spent: 12000,
    conversions: 200,
  },
];

export const useMarketing = () => {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [promos, setPromos] = useState(mockPromos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCampaign = useCallback(async (campaignData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCampaign = {
        id: campaigns.length + 1,
        ...campaignData,
        status: 'active',
        spent: 0,
        conversions: 0,
      };
      
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaigns]);

  const updateCampaign = useCallback(async (id, campaignData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCampaigns(prev =>
        prev.map(campaign =>
          campaign.id === id ? { ...campaign, ...campaignData } : campaign
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCampaign = useCallback(async (id) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPromo = useCallback(async (promoData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPromo = {
        id: promos.length + 1,
        ...promoData,
        status: 'active',
        spent: 0,
        conversions: 0,
      };
      
      setPromos(prev => [...prev, newPromo]);
      return newPromo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [promos]);

  const updatePromo = useCallback(async (id, promoData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPromos(prev =>
        prev.map(promo =>
          promo.id === id ? { ...promo, ...promoData } : promo
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePromo = useCallback(async (id) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPromos(prev => prev.filter(promo => promo.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    campaigns,
    promos,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    createPromo,
    updatePromo,
    deletePromo,
  };
}; 