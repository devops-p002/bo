import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import ComponentTemplate from '../ComponentTemplate';
import { Modal, Button, Breadcrumb } from '../../common/UI';
import { useTheme } from '../../../context/ThemeContext';
import { Input, Select } from '../../common/Forms';

const GET_GAMES = gql`
  query CMSGames {
    games(pagination: { limit: 50 }) {
      totalCount
      nodes {
        id
        name
        provider
        category
        status
      }
    }
  }
`;

const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      id
    }
  }
`;

const UPDATE_GAME = gql`
  mutation UpdateGame($id: ID!, $input: UpdateGameInput!) {
    updateGame(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_GAME = gql`
  mutation DeleteGame($id: ID!) {
    deleteGame(id: $id)
  }
`;

const CATEGORY_OPTIONS = [
  { value: 'SLOTS', label: 'Slots' },
  { value: 'TABLE_GAMES', label: 'Table Games' },
  { value: 'LIVE_CASINO', label: 'Live Casino' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'VIRTUAL_SPORTS', label: 'Virtual Sports' },
  { value: 'LOTTERY', label: 'Lottery' },
];

const EMPTY_FORM = { name: '', provider: '', category: 'SLOTS' };

const CMSGames = () => {
  const { isDarkTheme } = useTheme();
  const { data, loading, error, refetch } = useQuery(GET_GAMES, { fetchPolicy: 'cache-and-network' });
  const [createGame] = useMutation(CREATE_GAME);
  const [updateGame] = useMutation(UPDATE_GAME);
  const [deleteGame] = useMutation(DELETE_GAME);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const games = data?.games?.nodes ?? [];
  const totalCount = data?.games?.totalCount ?? 0;

  const openAddModal = () => {
    setEditingGame(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (game) => {
    setEditingGame(game);
    setForm({ name: game.name, provider: game.provider, category: game.category });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.provider) {
      setFormError('Name and provider are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingGame) {
        await updateGame({ variables: { id: editingGame.id, input: form } });
      } else {
        await createGame({ variables: { input: form } });
      }
      setModalOpen(false);
      await refetch();
    } catch (err) {
      setFormError(err.graphQLErrors?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (game) => {
    const nextStatus = game.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateGame({ variables: { id: game.id, input: { status: nextStatus } } });
    refetch();
  };

  const handleDelete = async (game) => {
     
    if (!window.confirm(`Delete "${game.name}"? This cannot be undone.`)) return;
    await deleteGame({ variables: { id: game.id } });
    refetch();
  };

  const stats = [
    { label: 'Total Games', value: totalCount.toLocaleString() },
    { label: 'Active Games', value: games.filter((g) => g.status === 'ACTIVE').length.toLocaleString() },
    { label: 'Providers', value: new Set(games.map((g) => g.provider)).size.toLocaleString() },
    { label: 'Categories', value: new Set(games.map((g) => g.category)).size.toLocaleString() },
  ];

  const columns = ['Game Name', 'Provider', 'Category', 'Status'];
  const rowKeys = ['name', 'provider', 'category', 'status'];
  const actions = [
    { label: 'Edit', color: 'blue', onClick: openEditModal },
    {
      label: 'Toggle Status',
      color: 'green',
      onClick: toggleStatus,
    },
    { label: 'Delete', color: 'red', onClick: handleDelete },
  ];

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <ComponentTemplate
        title="Game Management"
        description="Manage all games, providers, and categories available on the platform"
        data={games}
        columns={columns}
        rowKeys={rowKeys}
        stats={stats}
        actions={actions}
        hasAddButton
        addButtonText="Add Game"
        onAdd={openAddModal}
        loading={loading}
        error={error ? `Failed to load games: ${error.message}` : null}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGame ? 'Edit Game' : 'Add Game'}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600">{formError}</div>}
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Provider"
            name="provider"
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
            required
          />
          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={CATEGORY_OPTIONS}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CMSGames;
