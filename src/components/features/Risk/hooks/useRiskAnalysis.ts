import { useCallback, useState } from 'react';
import { gql, useMutation, useApolloClient } from '@apollo/client';

// Real fields only - RiskAssessment has riskScore/riskLevel/factors/
// recommendations/notes, no "trustScore"/"behaviorScore"/"complianceScore"
// or activity-pattern time series (those were fabricated in the old mock
// hook and have been dropped).
const RISK_ASSESSMENT_FIELDS = gql`
  fragment MemberRiskAssessmentFields on RiskAssessment {
    id
    userId
    riskScore
    riskLevel
    factors {
      type
      score
      description
      severity
    }
    recommendations
    assessedAt
    notes
    assessedByUser {
      username
    }
  }
`;

const SEARCH_MEMBERS = gql`
  query SearchMembersForAnalysis($search: String!) {
    users(filter: { search: $search }, pagination: { limit: 10 }) {
      nodes {
        id
        username
        email
        vipLevel
      }
    }
  }
`;

const GET_USER_RISK_ASSESSMENT = gql`
  query UserRiskAssessment($userId: ID!) {
    user(id: $userId) {
      id
      username
      email
      vipLevel
      isKYCVerified
      totalDeposits
      totalWithdrawals
      totalBets
      totalWins
    }
    userRiskAssessment(userId: $userId) {
      ...MemberRiskAssessmentFields
    }
  }
  ${RISK_ASSESSMENT_FIELDS}
`;

const CREATE_RISK_ASSESSMENT = gql`
  mutation CreateRiskAssessment($userId: ID!, $notes: String) {
    createRiskAssessment(userId: $userId, notes: $notes) {
      ...MemberRiskAssessmentFields
    }
  }
  ${RISK_ASSESSMENT_FIELDS}
`;

const UPDATE_RISK_ASSESSMENT = gql`
  mutation UpdateRiskAssessment($id: ID!, $input: UpdateRiskAssessmentInput!) {
    updateRiskAssessment(id: $id, input: $input) {
      ...MemberRiskAssessmentFields
    }
  }
  ${RISK_ASSESSMENT_FIELDS}
`;

/**
 * Wires the Member Analysis tab to the real backend:
 * - Query.users(filter: { search }) to resolve a typed username/email to a
 *   real user id (same pattern as Marketing/components/BonusIssueForm.js)
 * - Query.userRiskAssessment(userId) for the member's latest assessment
 * - Mutation.createRiskAssessment / updateRiskAssessment for the "run a new
 *   assessment" / "edit assessment" actions
 */
const useRiskAnalysis = () => {
  const apolloClient = useApolloClient();
  const [member, setMember] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [createRiskAssessmentMutation] = useMutation(CREATE_RISK_ASSESSMENT);
  const [updateRiskAssessmentMutation] = useMutation(UPDATE_RISK_ASSESSMENT);

  const searchMembers = useCallback(
    async (query) => {
      if (!query || !query.trim()) return [];
      const { data } = await apolloClient.query({
        query: SEARCH_MEMBERS,
        variables: { search: query.trim() },
        fetchPolicy: 'network-only',
      });
      return data?.users?.nodes ?? [];
    },
    [apolloClient]
  );

  const fetchMemberAnalysis = useCallback(
    async (userId) => {
      if (!userId) {
        setMember(null);
        setAssessment(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data } = await apolloClient.query({
          query: GET_USER_RISK_ASSESSMENT,
          variables: { userId },
          fetchPolicy: 'network-only',
        });
        setMember(data?.user ?? null);
        setAssessment(data?.userRiskAssessment ?? null);
      } catch (err) {
        setError(err.message || 'Failed to load member risk assessment');
        setMember(null);
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    },
    [apolloClient]
  );

  const runAssessment = useCallback(
    async (userId, notes) => {
      // The backend's RiskAssessment.notes column is validated as a plain
      // string (not nullable) - an explicit `notes: null` variable fails
      // that check, so the key is left out entirely when there are no notes
      // (same fix as the `filter: null` gotcha elsewhere in this app).
      const variables = notes ? { userId, notes } : { userId };
      const { data } = await createRiskAssessmentMutation({ variables });
      setAssessment(data?.createRiskAssessment ?? null);
      return data?.createRiskAssessment;
    },
    [createRiskAssessmentMutation]
  );

  // input: { riskScore?, riskLevel? (LOW/MEDIUM/HIGH/CRITICAL), notes?,
  // recommendations? } - see UpdateRiskAssessmentInput in the schema.
  const updateAssessment = useCallback(
    async (id, input) => {
      const { data } = await updateRiskAssessmentMutation({ variables: { id, input } });
      setAssessment(data?.updateRiskAssessment ?? null);
      return data?.updateRiskAssessment;
    },
    [updateRiskAssessmentMutation]
  );

  return {
    member,
    memberAnalysis: assessment,
    loading,
    error,
    searchMembers,
    fetchMemberAnalysis,
    runAssessment,
    updateAssessment,
  };
};

export default useRiskAnalysis;
