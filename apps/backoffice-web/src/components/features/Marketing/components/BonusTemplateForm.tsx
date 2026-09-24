import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_BONUS_TEMPLATES = gql`
  query BonusTemplatesList {
    bonusTemplates {
      id
      name
      type
      amount
      currency
      wagerRequirement
      isActive
      validityDays
    }
  }
`;

const CREATE_BONUS_TEMPLATE = gql`
  mutation CreateBonusTemplateForm($input: CreateBonusTemplateInput!) {
    createBonusTemplate(input: $input) {
      id
    }
  }
`;

const EMPTY_TEMPLATE = {
  name: '',
  type: 'DEPOSIT',
  amount: '',
  currency: 'USD',
  minDeposit: '',
  maxCashout: '',
  wagerRequirement: '',
  validityDays: '',
  isActive: true,
  description: '',
  termsAndConditions: '',
};

export const BonusTemplateForm = () => {
  const [template, setTemplate] = useState(EMPTY_TEMPLATE);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_BONUS_TEMPLATES, { fetchPolicy: 'cache-and-network' });
  const [createBonusTemplate] = useMutation(CREATE_BONUS_TEMPLATE);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplate({
      ...template,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const input = {
        name: template.name,
        type: template.type,
        amount: parseFloat(template.amount),
        currency: template.currency,
        wagerRequirement: template.wagerRequirement ? parseFloat(template.wagerRequirement) : undefined,
        minDeposit: template.minDeposit ? parseFloat(template.minDeposit) : undefined,
        maxCashout: template.maxCashout ? parseFloat(template.maxCashout) : undefined,
        validityDays: template.validityDays ? parseInt(template.validityDays, 10) : undefined,
        isActive: template.isActive,
        description: template.description || undefined,
        terms: template.termsAndConditions || undefined,
      };
      await createBonusTemplate({ variables: { input } });
      setTemplate(EMPTY_TEMPLATE);
      await refetch();
    } catch (err) {
      setFormError(err.graphQLErrors?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const templates = data?.bonusTemplates ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-6">Create Bonus Template</h2>

        {formError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={template.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Bonus Type
              </label>
              <select
                id="type"
                name="type"
                value={template.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="WELCOME">Welcome Bonus</option>
                <option value="DEPOSIT">Deposit Bonus</option>
                <option value="NO_DEPOSIT">No Deposit Bonus</option>
                <option value="FREE_SPINS">Free Spins</option>
                <option value="CASHBACK">Cashback</option>
                <option value="RELOAD">Reload Bonus</option>
                <option value="VIP">VIP Bonus</option>
                <option value="LOYALTY">Loyalty Bonus</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Bonus Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={template.amount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={template.currency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label htmlFor="minDeposit" className="block text-sm font-medium text-gray-700">
                Minimum Deposit
              </label>
              <input
                type="number"
                id="minDeposit"
                name="minDeposit"
                value={template.minDeposit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="maxCashout" className="block text-sm font-medium text-gray-700">
                Maximum Cashout
              </label>
              <input
                type="number"
                id="maxCashout"
                name="maxCashout"
                value={template.maxCashout}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="wagerRequirement" className="block text-sm font-medium text-gray-700">
                Wager Requirement (x)
              </label>
              <input
                type="number"
                id="wagerRequirement"
                name="wagerRequirement"
                value={template.wagerRequirement}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="validityDays" className="block text-sm font-medium text-gray-700">
                Validity (Days)
              </label>
              <input
                type="number"
                id="validityDays"
                name="validityDays"
                value={template.validityDays}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={template.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700">
              Terms and Conditions
            </label>
            <textarea
              id="termsAndConditions"
              name="termsAndConditions"
              rows={4}
              value={template.termsAndConditions}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={template.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setTemplate(EMPTY_TEMPLATE)}
              className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Templates</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">Failed to load templates: {error.message}</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-gray-500">No bonus templates yet.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wager Req.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{t.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{t.type}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{t.currency} {t.amount}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{t.wagerRequirement}x</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{t.isActive ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
