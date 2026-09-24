import React, { useState, useEffect } from 'react';
import { Card, Modal, Button } from '../../../common/UI';
import { Input, Select } from '../../../common/Forms';
import useReferral from '../hooks/useReferral';

const ReferralTree = () => {
  const [selectedUser, setSelectedUser] = useState('');
  const [treeData, setTreeData] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [treeView, setTreeView] = useState('hierarchical');

  const { 
    referralTree, 
    users, 
    loading, 
    error, 
    fetchReferralTree, 
    fetchUsers,
    updateReferralTree 
  } = useReferral();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchReferralTree(selectedUser);
    }
  }, [selectedUser, fetchReferralTree]);

  useEffect(() => {
    if (referralTree) {
      setTreeData(referralTree);
      // Auto-expand first two levels
      const expandedSet = new Set();
      const expandFirstLevels = (node, level = 0) => {
        if (level < 2) {
          expandedSet.add(node.id);
          if (node.children) {
            node.children.forEach(child => expandFirstLevels(child, level + 1));
          }
        }
      };
      expandFirstLevels(referralTree);
      setExpandedNodes(expandedSet);
    }
  }, [referralTree]);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setShowModal(true);
  };

  const expandAll = () => {
    const expandedSet = new Set();
    const expandAllNodes = (node) => {
      expandedSet.add(node.id);
      if (node.children) {
        node.children.forEach(child => expandAllNodes(child));
      }
    };
    if (treeData) {
      expandAllNodes(treeData);
      setExpandedNodes(expandedSet);
    }
  };

  const collapseAll = () => {
    setExpandedNodes(new Set([treeData?.id]));
  };

  const getNodeStats = (node) => {
    let totalReferrals = 0;
    let totalCommissions = 0;
    let totalRevenue = 0;
    let activeReferrals = 0;

    const calculateStats = (currentNode) => {
      if (currentNode.children) {
        totalReferrals += currentNode.children.length;
        currentNode.children.forEach(child => {
          if (child.status === 'active') activeReferrals++;
          totalCommissions += child.totalCommissions || 0;
          totalRevenue += child.totalRevenue || 0;
          calculateStats(child);
        });
      }
    };

    calculateStats(node);
    return { totalReferrals, totalCommissions, totalRevenue, activeReferrals };
  };

  const renderTreeNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const nodeStats = getNodeStats(node);

    const getStatusColor = (status) => {
      const colors = {
        active: 'bg-green-100 border-green-300 text-green-800',
        inactive: 'bg-gray-100 border-gray-300 text-gray-800',
        pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        suspended: 'bg-red-100 border-red-300 text-red-800'
      };
      return colors[status] || colors.inactive;
    };

    const shouldShowNode = () => {
      if (filterLevel !== 'all' && level !== parseInt(filterLevel)) return false;
      if (searchTerm && !node.username.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    };

    if (!shouldShowNode()) return null;

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(node.status)}`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => handleNodeClick(node)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="mr-3 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 text-xs font-bold hover:bg-gray-50"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          
          {/* Node Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{node.username}</span>
                  <span className="text-xs text-gray-600">{node.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Level {level}
                  </span>
                  {node.isVip && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      VIP
                    </span>
                  )}
                </div>
              </div>
              
              {/* Node Statistics */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{hasChildren ? node.children.length : 0}</div>
                  <div className="text-gray-600">Direct</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{nodeStats.totalReferrals}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">${nodeStats.totalCommissions.toLocaleString()}</div>
                  <div className="text-gray-600">Commissions</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">${nodeStats.totalRevenue.toLocaleString()}</div>
                  <div className="text-gray-600">Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNetworkView = () => {
    if (!treeData) return null;

    const networkStats = getNodeStats(treeData);
    
    return (
      <div className="space-y-6">
        {/* Network Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">{networkStats.totalReferrals}</div>
            <div className="text-sm text-blue-600">Total Network Size</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-800">{networkStats.activeReferrals}</div>
            <div className="text-sm text-green-600">Active Members</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">${networkStats.totalCommissions.toLocaleString()}</div>
            <div className="text-sm text-purple-600">Total Commissions</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-800">${networkStats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-orange-600">Network Revenue</div>
          </div>
        </div>

        {/* Level Breakdown */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Network Level Breakdown</h3>
            <div className="space-y-3">
              {treeData.levelStats?.map((level, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {level.level}
                    </span>
                    <div>
                      <p className="font-medium">Level {level.level}</p>
                      <p className="text-sm text-gray-600">{level.members} members</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${level.totalCommissions.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Commissions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderNodeModal = () => {
    if (!selectedNode) return null;

    const nodeStats = getNodeStats(selectedNode);

    return (
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Network Details: ${selectedNode.username}`}
        size="large"
      >
        <div className="space-y-6">
          {/* Node Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Direct Referrals</div>
              <div className="text-2xl font-bold text-blue-800">
                {selectedNode.children?.length || 0}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-green-600">Total Network</div>
              <div className="text-2xl font-bold text-green-800">{nodeStats.totalReferrals}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-purple-600">Total Commissions</div>
              <div className="text-2xl font-bold text-purple-800">${nodeStats.totalCommissions.toLocaleString()}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <div className="text-sm text-orange-600">Network Revenue</div>
              <div className="text-2xl font-bold text-orange-800">${nodeStats.totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          {/* User Information */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">User Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Username:</span>
                  <span className="ml-2">{selectedNode.username}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{selectedNode.email}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2">{selectedNode.status}</span>
                </div>
                <div>
                  <span className="font-medium">Registration Date:</span>
                  <span className="ml-2">{new Date(selectedNode.registrationDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium">Total Deposits:</span>
                  <span className="ml-2">${selectedNode.totalDeposits?.toLocaleString() || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Total Bets:</span>
                  <span className="ml-2">${selectedNode.totalBets?.toLocaleString() || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Country:</span>
                  <span className="ml-2">{selectedNode.country || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium">Referrer:</span>
                  <span className="ml-2">{selectedNode.referrerUsername || 'Direct'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Direct Referrals */}
          {selectedNode.children && selectedNode.children.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Direct Referrals ({selectedNode.children.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedNode.children.map((child, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{child.username}</p>
                          <p className="text-sm text-gray-600">{child.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {child.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${child.totalCommissions?.toLocaleString() || 0}</p>
                        <p className="text-sm text-gray-600">Commission earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setSelectedUser(selectedNode.id);
                setShowModal(false);
              }}
            >
              View Tree
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Referral Tree</h2>
            <div className="flex space-x-2">
              <Select
                value={treeView}
                onChange={(e) => setTreeView(e.target.value)}
                options={[
                  { value: 'hierarchical', label: 'Hierarchical View' },
                  { value: 'network', label: 'Network Overview' }
                ]}
                className="w-40"
              />
            </div>
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Select
              label="Select User"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              options={[
                { value: '', label: 'Select a user...' },
                ...(users?.map(user => ({ value: user.id, label: user.username })) || [])
              ]}
            />
            <Input
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
            />
            <Select
              label="Filter by Level"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              options={[
                { value: 'all', label: 'All Levels' },
                { value: '0', label: 'Level 0' },
                { value: '1', label: 'Level 1' },
                { value: '2', label: 'Level 2' },
                { value: '3', label: 'Level 3' },
                { value: '4', label: 'Level 4+' }
              ]}
            />
            <div className="flex space-x-2 pt-6">
              <Button variant="outline" onClick={expandAll} size="sm">
                Expand All
              </Button>
              <Button variant="outline" onClick={collapseAll} size="sm">
                Collapse All
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tree Content */}
      {loading ? (
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      ) : error ? (
        <Card>
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
          </div>
        </Card>
      ) : !selectedUser ? (
        <Card>
          <div className="p-8 text-center text-gray-500">
            <p>Please select a user to view their referral tree</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-4">
            {treeView === 'hierarchical' ? (
              treeData ? (
                <div className="space-y-2">
                  {renderTreeNode(treeData)}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No referral tree data available for this user</p>
                </div>
              )
            ) : (
              renderNetworkView()
            )}
          </div>
        </Card>
      )}

      {/* Node Detail Modal */}
      {renderNodeModal()}
    </div>
  );
};

export default ReferralTree; 