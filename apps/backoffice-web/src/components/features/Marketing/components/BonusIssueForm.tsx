import React, { useState } from 'react';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';

const GET_BONUS_TEMPLATES = gql`
  query BonusIssueTemplates {
    bonusTemplates {
      id
      name
      type
      amount
      currency
      wagerRequirement
      maxCashout
      minDeposit
      freeSpins
      validityDays
      autoActivate
    }
  }
`;

const FIND_USER = gql`
  query FindUserForBonus($search: String!) {
    users(filter: { search: $search }, pagination: { limit: 5 }) {
      totalCount
      nodes { id username email }
    }
  }
`;

const CREATE_BONUS = gql`
  mutation IssueBonus($input: CreateBonusInput!) {
    createBonus(input: $input) {
      id
      status
      user { username }
    }
  }
`;

export const BonusIssueForm = () => {
  const [formData, setFormData] = useState({
    templateId: '',
    userType: 'individual',
    userId: '',
    userSegment: '',
    notes: '',
    sendNotification: true,
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [issuing, setIssuing] = useState(false);

  const { data: templatesData, loading: templatesLoading } = useQuery(GET_BONUS_TEMPLATES, { fetchPolicy: 'cache-and-network' });
  const [createBonus] = useMutation(CREATE_BONUS);
  const apolloClient = useApolloClient();

  const bonusTemplates = templatesData?.bonusTemplates ?? [];

  // No backend support for bulk CSV upload or user-segment targeting -
  // createBonus takes a single userId. Rather than fake success, this stays
  // disabled with an explanation.
  const userSegments = [
    { id: '1', name: 'VIP Players' },
    { id: '2', name: 'High Rollers' },
    { id: '3', name: 'Inactive Users (30+ days)' },
    { id: '4', name: 'New Users (< 7 days)' },
    { id: '5', name: 'Regular Players' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (formData.userType !== 'individual') {
      setFormError('Bulk and segment targeting aren’t supported by the backend yet - only individual users can be issued a bonus.');
      return;
    }
    if (!formData.templateId) {
      setFormError('Select a bonus template.');
      return;
    }
    if (!formData.userId.trim()) {
      setFormError('Enter a user ID, username, or email.');
      return;
    }

    setIssuing(true);
    try {
      const template = bonusTemplates.find((t) => t.id === formData.templateId);
      if (!template) throw new Error('Selected template not found.');

      // Resolve the typed identifier to a real user id via the search filter.
      const { data: userSearch } = await apolloClient.query({
        query: FIND_USER,
        variables: { search: formData.userId.trim() },
        fetchPolicy: 'network-only',
      });
      const matches = userSearch.users.nodes;
      if (matches.length === 0) {
        throw new Error(`No user found matching "${formData.userId}".`);
      }
      if (matches.length > 1) {
        throw new Error(`Multiple users match "${formData.userId}" (${matches.map((u) => u.username).join(', ')}) - enter a more specific identifier.`);
      }
      const targetUser = matches[0];

      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + (template.validityDays || 30) * 24 * 60 * 60 * 1000);

      await createBonus({
        variables: {
          input: {
            userId: targetUser.id,
            templateId: template.id,
            type: template.type,
            amount: template.amount,
            currency: template.currency,
            wagerRequirement: template.wagerRequirement,
            maxCashout: template.maxCashout,
            minDeposit: template.minDeposit,
            freeSpins: template.freeSpins,
            validFrom: validFrom.toISOString(),
            validUntil: validUntil.toISOString(),
            autoActivate: template.autoActivate,
            notes: formData.notes || undefined,
          },
        },
      });

      setSuccessMessage(`Bonus "${template.name}" issued to ${targetUser.username}.`);
      setFormData({
        templateId: '',
        userType: 'individual',
        userId: '',
        userSegment: '',
        notes: '',
        sendNotification: true,
      });
    } catch (err) {
      setFormError(err.graphQLErrors?.[0]?.message || err.message);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Issue Bonus</h2>

      {formError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">
            Bonus Template
          </label>
          <select
            id="templateId"
            name="templateId"
            value={formData.templateId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">
              {templatesLoading ? 'Loading templates…' : 'Select a bonus template'}
            </option>
            {bonusTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.currency} {template.amount})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue To
          </label>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="individual"
                name="userType"
                type="radio"
                value="individual"
                checked={formData.userType === 'individual'}
                onChange={handleChange}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="individual" className="ml-3 block text-sm font-medium text-gray-700">
                Individual User
              </label>
            </div>

            {formData.userType === 'individual' && (
              <div className="ml-7">
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                  Username or Email
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                id="bulk"
                name="userType"
                type="radio"
                value="bulk"
                checked={formData.userType === 'bulk'}
                onChange={handleChange}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="bulk" className="ml-3 block text-sm font-medium text-gray-700">
                Bulk Users (CSV Upload) <span className="text-gray-400">- not supported by backend yet</span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="segment"
                name="userType"
                type="radio"
                value="segment"
                checked={formData.userType === 'segment'}
                onChange={handleChange}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="segment" className="ml-3 block text-sm font-medium text-gray-700">
                User Segment <span className="text-gray-400">- not supported by backend yet</span>
              </label>
            </div>

            {formData.userType === 'segment' && (
              <div className="ml-7">
                <label htmlFor="userSegment" className="block text-sm font-medium text-gray-700">
                  Select Segment
                </label>
                <select
                  id="userSegment"
                  name="userSegment"
                  value={formData.userSegment}
                  onChange={handleChange}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                >
                  <option value="">Select a user segment</option>
                  {userSegments.map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Internal)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div className="flex items-center">
          <input
            id="sendNotification"
            name="sendNotification"
            type="checkbox"
            checked={formData.sendNotification}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
            Send notification to users <span className="text-gray-400 text-xs">(not backend-connected)</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFormData({ templateId: '', userType: 'individual', userId: '', userSegment: '', notes: '', sendNotification: true })}
            className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={issuing}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {issuing ? 'Issuing…' : 'Issue Bonus'}
          </button>
        </div>
      </form>
    </div>
  );
};
