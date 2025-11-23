import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSellers: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/stats`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats || stats);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };


  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'people',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: 'inventory_2',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100',
      iconBg: 'bg-green-500',
      textColor: 'text-green-700',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Total Sellers',
      value: stats.totalSellers,
      icon: 'store',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-700',
      change: '+5%',
      changeType: 'positive',
    },
  ];

  const quickActions = [
    {
      label: 'Manage Users',
      icon: 'people',
      color: 'blue',
      path: '/admin/users',
      description: 'View and manage all users',
    },
    {
      label: 'Review Products',
      icon: 'inventory_2',
      color: 'green',
      path: '/admin/products',
      description: 'Review and approve products',
    },
    {
      label: 'Manage Sellers',
      icon: 'store',
      color: 'purple',
      path: '/admin/sellers',
      description: 'Manage seller accounts',
    },
  ];

  const recentActivities = [
    { type: 'user', message: 'New user registered', time: '2 minutes ago', icon: 'person_add' },
    { type: 'product', message: 'New product added', time: '15 minutes ago', icon: 'add_shopping_cart' },
    { type: 'seller', message: 'New seller joined', time: '2 hours ago', icon: 'store' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100',
        text: 'text-green-700',
        icon: 'text-green-600',
        border: 'border-green-200',
      },
      purple: {
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        border: 'border-purple-200',
      },
      orange: {
        bg: 'bg-orange-50',
        hover: 'hover:bg-orange-100',
        text: 'text-orange-700',
        icon: 'text-orange-600',
        border: 'border-orange-200',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1.5">Welcome back! Here's what's happening today.</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((card, index) => (
                  <div
                    key={index}
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                          <p className="text-4xl font-bold text-gray-900 mb-2">{card.value.toLocaleString()}</p>
                          {card.change && (
                            <div className="flex items-center gap-1">
                              <span className={`text-xs font-semibold ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                {card.change}
                              </span>
                              <span className="text-xs text-gray-500">vs last month</span>
                            </div>
                          )}
                        </div>
                        <div className={`${card.iconBg} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <span className="material-symbols-outlined text-white text-3xl">
                            {card.icon}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-tl-full`}></div>
                  </div>
                ))}
              </div>


              {/* Charts and Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
                      <p className="text-sm text-gray-600 mt-1">Last 30 days performance</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      View Report
                    </button>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400 mb-2">bar_chart</span>
                      <p className="text-gray-500 font-medium">Chart will be displayed here</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <span className="material-symbols-outlined text-blue-600 text-lg">
                            {activity.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => {
                    const colors = getColorClasses(action.color);
                    return (
                      <button
                        key={index}
                        onClick={() => navigate(action.path)}
                        className={`group relative ${colors.bg} ${colors.border} border-2 rounded-xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:scale-105`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-3 ${colors.bg} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                            <span className={`material-symbols-outlined ${colors.icon} text-2xl`}>
                              {action.icon}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600 transition-colors">
                            arrow_forward
                          </span>
                        </div>
                        <h3 className={`font-semibold ${colors.text} mb-1`}>{action.label}</h3>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-4xl opacity-80">trending_up</span>
                    <span className="text-sm font-medium opacity-80">Growth</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">+24.5%</h3>
                  <p className="text-sm opacity-90">Compared to last month</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-4xl opacity-80">payments</span>
                    <span className="text-sm font-medium opacity-80">Revenue</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">₹2.4M</h3>
                  <p className="text-sm opacity-90">Total revenue this month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-4xl opacity-80">verified</span>
                    <span className="text-sm font-medium opacity-80">Verified</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">98.2%</h3>
                  <p className="text-sm opacity-90">Verified sellers</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
