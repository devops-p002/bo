import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import useSettings from '../hooks/useSettings';

const GameSettings = () => {
  const [games, setGames] = useState([]);
  const [gameCategories, setGameCategories] = useState([]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('games');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    provider: 'all'
  });

  const { 
    gamesData, 
    categoriesData, 
    loading, 
    error, 
    fetchGames, 
    createGame, 
    updateGame, 
    deleteGame,
    createCategory,
    updateCategory,
    deleteCategory 
  } = useSettings();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (gamesData) setGames(gamesData);
    if (categoriesData) setGameCategories(categoriesData);
  }, [gamesData, categoriesData]);

  const gameColumns = [
    { header: 'Image', accessor: 'image' },
    { header: 'Name', accessor: 'name' },
    { header: 'Provider', accessor: 'provider' },
    { header: 'Category', accessor: 'category' },
    { header: 'RTP', accessor: 'rtp' },
    { header: 'Status', accessor: 'status' },
    { header: 'Popular', accessor: 'isPopular' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const categoryColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Games Count', accessor: 'gamesCount' },
    { header: 'Status', accessor: 'status' },
    { header: 'Order', accessor: 'sortOrder' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const handleCreateGame = () => {
    setSelectedGame({
      id: '',
      name: '',
      provider: '',
      categoryId: '',
      description: '',
      rtp: 96.0,
      minBet: 0.01,
      maxBet: 100,
      volatility: 'medium',
      paylines: 20,
      reels: 5,
      isActive: true,
      isPopular: false,
      isFeatured: false,
      imageUrl: '',
      thumbnailUrl: '',
      demoUrl: '',
      gameUrl: '',
      mobileCompatible: true,
      tags: []
    });
    setIsEditing(false);
    setShowGameModal(true);
  };

  const handleEditGame = (game) => {
    setSelectedGame({ ...game });
    setIsEditing(true);
    setShowGameModal(true);
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(gameId);
        setGames(prev => prev.filter(g => g.id !== gameId));
        alert('Game deleted successfully!');
      } catch (error) {
        console.error('Error deleting game:', error);
        alert('Error deleting game. Please try again.');
      }
    }
  };

  const handleSaveGame = async () => {
    try {
      if (isEditing) {
        await updateGame(selectedGame.id, selectedGame);
        setGames(prev => 
          prev.map(g => g.id === selectedGame.id ? selectedGame : g)
        );
      } else {
        const newGame = await createGame(selectedGame);
        setGames(prev => [...prev, newGame]);
      }
      setShowGameModal(false);
      alert('Game saved successfully!');
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Error saving game. Please try again.');
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory({
      id: '',
      name: '',
      description: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true
    });
    setIsEditing(false);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory({ ...category });
    setIsEditing(true);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        setGameCategories(prev => prev.filter(c => c.id !== categoryId));
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (isEditing) {
        await updateCategory(selectedCategory.id, selectedCategory);
        setGameCategories(prev => 
          prev.map(c => c.id === selectedCategory.id ? selectedCategory : c)
        );
      } else {
        const newCategory = await createCategory(selectedCategory);
        setGameCategories(prev => [...prev, newCategory]);
      }
      setShowCategoryModal(false);
      alert('Category saved successfully!');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please try again.');
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
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const getVolatilityBadge = (volatility) => {
    const volatilityColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${volatilityColors[volatility] || 'bg-gray-100 text-gray-800'}`}>
        {volatility?.toUpperCase() || 'MEDIUM'}
      </span>
    );
  };

  const renderGameImage = (game) => (
    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
      {game.imageUrl ? (
        <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover rounded" />
      ) : (
        <span className="text-gray-400 text-xs">🎮</span>
      )}
    </div>
  );

  const renderGameActions = (game) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditGame(game)}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteGame(game.id)}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );

  const renderCategoryActions = (category) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditCategory(category)}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteCategory(category.id)}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );

  const filteredGames = games.filter(g => {
    const matchesSearch = g.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         g.provider?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || g.categoryId === filters.category;
    const matchesStatus = filters.status === 'all' || g.status === filters.status;
    const matchesProvider = filters.provider === 'all' || g.provider === filters.provider;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesProvider;
  });

  const processedGameData = filteredGames.map(g => ({
    ...g,
    image: renderGameImage(g),
    category: gameCategories.find(c => c.id === g.categoryId)?.name || 'Unknown',
    rtp: `${g.rtp}%`,
    status: getStatusBadge(g.status),
    isPopular: g.isPopular ? '⭐' : '',
    actions: renderGameActions(g)
  }));

  const processedCategoryData = gameCategories.map(c => ({
    ...c,
    gamesCount: games.filter(g => g.categoryId === c.id).length,
    status: getStatusBadge(c.isActive ? 'active' : 'inactive'),
    actions: renderCategoryActions(c)
  }));

  const renderGameModal = () => {
    if (!selectedGame) return null;

    return (
      <Modal
        isOpen={showGameModal}
        onClose={() => setShowGameModal(false)}
        title={isEditing ? 'Edit Game' : 'Add Game'}
        size="large"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Game Name"
              value={selectedGame.name}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter game name"
            />
            <Input
              label="Provider"
              value={selectedGame.provider}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, provider: e.target.value }))}
              placeholder="Enter provider name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={selectedGame.categoryId}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, categoryId: e.target.value }))}
              options={[
                { value: '', label: 'Select category...' },
                ...gameCategories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
            />
            <Select
              label="Volatility"
              value={selectedGame.volatility}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, volatility: e.target.value }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
            />
          </div>

          <Textarea
            label="Description"
            value={selectedGame.description}
            onChange={(e) => setSelectedGame(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter game description"
            rows={3}
          />

          {/* Game Specifications */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="RTP (%)"
              type="number"
              step="0.01"
              value={selectedGame.rtp}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, rtp: parseFloat(e.target.value) }))}
              min="80"
              max="99"
            />
            <Input
              label="Reels"
              type="number"
              value={selectedGame.reels}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, reels: parseInt(e.target.value) }))}
              min="3"
              max="10"
            />
            <Input
              label="Paylines"
              type="number"
              value={selectedGame.paylines}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, paylines: parseInt(e.target.value) }))}
              min="1"
              max="1024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Bet"
              type="number"
              step="0.01"
              value={selectedGame.minBet}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, minBet: parseFloat(e.target.value) }))}
              min="0.01"
            />
            <Input
              label="Max Bet"
              type="number"
              value={selectedGame.maxBet}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, maxBet: parseFloat(e.target.value) }))}
              min="1"
            />
          </div>

          {/* URLs */}
          <div className="space-y-4">
            <Input
              label="Image URL"
              value={selectedGame.imageUrl}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/game-image.jpg"
            />
            <Input
              label="Thumbnail URL"
              value={selectedGame.thumbnailUrl}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              placeholder="https://example.com/game-thumb.jpg"
            />
            <Input
              label="Demo URL"
              value={selectedGame.demoUrl}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, demoUrl: e.target.value }))}
              placeholder="https://example.com/demo"
            />
            <Input
              label="Game URL"
              value={selectedGame.gameUrl}
              onChange={(e) => setSelectedGame(prev => ({ ...prev, gameUrl: e.target.value }))}
              placeholder="https://example.com/game"
            />
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedGame.isActive}
                  onChange={(e) => setSelectedGame(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={selectedGame.isPopular}
                  onChange={(e) => setSelectedGame(prev => ({ ...prev, isPopular: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isPopular" className="text-sm">Popular</label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={selectedGame.isFeatured}
                  onChange={(e) => setSelectedGame(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isFeatured" className="text-sm">Featured</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mobileCompatible"
                  checked={selectedGame.mobileCompatible}
                  onChange={(e) => setSelectedGame(prev => ({ ...prev, mobileCompatible: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="mobileCompatible" className="text-sm">Mobile Compatible</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowGameModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveGame}>
              {isEditing ? 'Update Game' : 'Create Game'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderCategoryModal = () => {
    if (!selectedCategory) return null;

    return (
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={isEditing ? 'Edit Category' : 'Create Category'}
        size="medium"
      >
        <div className="space-y-6">
          <Input
            label="Category Name"
            value={selectedCategory.name}
            onChange={(e) => setSelectedCategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter category name"
          />

          <Textarea
            label="Description"
            value={selectedCategory.description}
            onChange={(e) => setSelectedCategory(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter category description"
            rows={3}
          />

          <Input
            label="Image URL"
            value={selectedCategory.imageUrl}
            onChange={(e) => setSelectedCategory(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://example.com/category-image.jpg"
          />

          <Input
            label="Sort Order"
            type="number"
            value={selectedCategory.sortOrder}
            onChange={(e) => setSelectedCategory(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
            min="0"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="categoryActive"
              checked={selectedCategory.isActive}
              onChange={(e) => setSelectedCategory(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="categoryActive" className="text-sm">Active</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCategory}>
              {isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Game Settings</h2>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            onClick={handleCreateCategory}
            disabled={activeTab !== 'categories'}
          >
            Add Category
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateGame}
            disabled={activeTab !== 'games'}
          >
            Add Game
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'games', label: 'Games', count: games.length },
              { id: 'categories', label: 'Categories', count: gameCategories.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Content */}
      {activeTab === 'games' && (
        <Card>
          <div className="p-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Input
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search games..."
              />
              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...gameCategories.map(cat => ({ value: cat.id, label: cat.name }))
                ]}
              />
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'maintenance', label: 'Maintenance' }
                ]}
              />
              <Select
                label="Provider"
                value={filters.provider}
                onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Providers' },
                  ...Array.from(new Set(games.map(g => g.provider))).map(provider => ({
                    value: provider,
                    label: provider
                  }))
                ]}
              />
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <Table
                columns={gameColumns}
                data={processedGameData}
              />
            )}
          </div>
        </Card>
      )}

      {activeTab === 'categories' && (
        <Card>
          <div className="p-4">
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
                columns={categoryColumns}
                data={processedCategoryData}
              />
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      {renderGameModal()}
      {renderCategoryModal()}
    </div>
  );
};

export default GameSettings; 