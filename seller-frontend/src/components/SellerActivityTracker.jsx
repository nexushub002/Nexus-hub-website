import React, { useState, useEffect } from 'react';
import { useSeller } from '../context/SellerContext';

const SellerActivityTracker = () => {
  const { 
    seller, 
    sellerHistory, 
    getSellerAnalytics, 
    trackBusinessActivity,
    exportSellerData,
    clearSellerHistory,
    sessionData 
  } = useSeller();
  
  const [analytics, setAnalytics] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (seller) {
      setAnalytics(getSellerAnalytics());
    }
  }, [seller, sellerHistory]);

  const handleExportData = () => {
    const data = exportSellerData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    trackBusinessActivity('data_export', { format: 'json' });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all activity history?')) {
      clearSellerHistory();
      trackBusinessActivity('history_cleared');
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return sellerHistory;
    return sellerHistory.filter(activity => activity.action.includes(filter));
  };

  const getActivityIcon = (action) => {
    const icons = {
      login: '🔐',
      logout: '🚪',
      register: '📝',
      page_visit: '👁️',
      business_product_add: '➕',
      business_order_view: '📦',
      business_profile_update: '✏️',
      auth_check: '🔍'
    };
    return icons[action] || '📊';
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      error: 'text-red-600 bg-red-50',
      initiated: 'text-blue-600 bg-blue-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  if (!seller) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Please log in to view activity tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Activity Analytics</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleExportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Export Data
            </button>
            <button
              onClick={handleClearHistory}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear History
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-900">Total Activities</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalActivities || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🔐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-900">Login Count</p>
                <p className="text-2xl font-bold text-green-600">{analytics.loginCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⏱️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-900">Session Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatDuration(analytics.sessionDuration || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🕐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-900">Most Active Hour</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.mostActiveHour || 0}:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Session ID:</span>
              <p className="font-mono text-xs">{sessionData.sessionId}</p>
            </div>
            <div>
              <span className="text-gray-600">Started:</span>
              <p>{sessionData.startTime ? new Date(sessionData.startTime).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Last Activity:</span>
              <p>{sessionData.lastActivity ? new Date(sessionData.lastActivity).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Activity History</h3>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Activities</option>
              <option value="login">Login/Logout</option>
              <option value="business">Business Activities</option>
              <option value="page">Page Visits</option>
            </select>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getFilteredHistory().length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activities found</p>
            ) : (
              getFilteredHistory().map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActivityIcon(activity.action)}</span>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {activity.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    )}
                    {activity.page && (
                      <span className="text-xs text-gray-500">
                        {activity.page}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Activity Types Breakdown */}
      {analytics.activityByType && Object.keys(analytics.activityByType).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.activityByType).map(([type, count]) => (
              <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{getActivityIcon(type)}</div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {type.replace(/_/g, ' ')}
                </p>
                <p className="text-lg font-bold text-blue-600">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerActivityTracker;
