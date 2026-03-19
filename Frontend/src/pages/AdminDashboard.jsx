import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaUsers, FaRoute, FaTree, FaExclamationTriangle, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { getAdminDashboard, getPendingTrips, approveTrip, rejectTrip, getAllUsers } from '../services/adminService';

const modeIcons = { PUBLIC: '🚌', WALK: '🚶', CYCLE: '🚴', CAR: '🚗', BIKE: '🏍️' };
const modeColors = { PUBLIC: 'text-blue-400', WALK: 'text-green-400', CYCLE: 'text-cyan-400', CAR: 'text-orange-400', BIKE: 'text-red-400' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingTrips, setPendingTrips] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    const token = localStorage.getItem('adminToken');
    if (!storedAdmin || !token) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(storedAdmin));
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const response = await getAdminDashboard();
        if (response.success) setStats(response.stats);
      } else if (activeTab === 'verification') {
        const response = await getPendingTrips();
        if (response.success) setPendingTrips(response.trips);
      } else if (activeTab === 'users') {
        const response = await getAllUsers(1, 50, searchQuery);
        if (response.success) setUsers(response.users);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tripId) => {
    try {
      setActionLoading(tripId);
      const response = await approveTrip(tripId, 'Approved by admin');
      if (response.success) {
        setMessage({ type: 'success', text: 'Trip approved! Rewards awarded to user.' });
        setPendingTrips(prev => prev.filter(t => t._id !== tripId));
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to approve' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      setActionLoading(rejectModal);
      const response = await rejectTrip(rejectModal, rejectReason);
      if (response.success) {
        setMessage({ type: 'success', text: 'Trip rejected. Fraud strike applied.' });
        setPendingTrips(prev => prev.filter(t => t._id !== rejectModal));
        setRejectModal(null);
        setRejectReason('');
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const StatCard = ({ icon, label, value, color = 'emerald' }) => (
    <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <div className={`text-3xl font-bold text-${color}-400`}>{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              🛡️ Admin Panel
            </h1>
            {admin && (
              <span className="text-sm text-slate-400">
                Welcome, {admin.firstName} ({admin.role})
              </span>
            )}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '📊' },
            { key: 'verification', label: 'Trip Verification', icon: '✅' },
            { key: 'users', label: 'Users', icon: '👥' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
                }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mx-auto max-w-7xl mt-4 px-6`}
          >
            <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-red-500/20 border-red-500/50 text-red-300'
              }`}>
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon="⏳" label="Pending Verifications" value={stats.pendingTripsCount || 0} color="yellow" />
                  <StatCard icon="🚀" label="Total Trips" value={stats.totalTrips || 0} color="blue" />
                  <StatCard icon="👥" label="Total Users" value={stats.totalUsers || 0} color="purple" />
                  <StatCard icon="📆" label="Today's Trips" value={stats.todayTrips || 0} color="emerald" />
                </div>

                {/* Hero Eco Impact Section */}
                <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-900/20">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Global Eco Impact</h2>
                    <p className="text-emerald-200">The collective impact of the driveSutraGo community.</p>
                  </div>
                  <div className="flex gap-8 items-center bg-black/20 p-6 rounded-2xl border border-emerald-500/20">
                     <div className="text-center w-32">
                        <div className="text-4xl font-bold text-emerald-400">{(stats.totalCO2Saved || 0).toFixed(1)}<span className="text-lg">kg</span></div>
                        <div className="text-sm text-emerald-200 mt-1 font-medium">CO₂ Prevented</div>
                     </div>
                     <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"></div>
                     <div className="text-center w-32">
                        <div className="text-4xl font-bold text-teal-400">{stats.totalTreesPlanted || 0}</div>
                        <div className="text-sm text-teal-200 mt-1 font-medium">Trees Equivalent</div>
                     </div>
                  </div>
                </div>

                {/* Mode Distribution */}
                {stats.modeDistribution && stats.modeDistribution.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold mb-4">📊 Transport Mode Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {stats.modeDistribution.map(m => (
                        <div key={m._id} className="text-center p-4 bg-slate-700/30 rounded-xl">
                          <div className="text-3xl mb-2">{modeIcons[m._id] || '🚗'}</div>
                          <div className="text-xl font-bold text-white">{m.count}</div>
                          <div className="text-sm text-slate-400">{m._id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flagged Users */}
                {stats.flaggedUsers && stats.flaggedUsers.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-red-400">
                      <FaExclamationTriangle className="inline mr-2" />
                      Fraud-Flagged Users
                    </h3>
                    <div className="space-y-3">
                      {stats.flaggedUsers.map(u => (
                        <div key={u._id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div>
                            <span className="font-medium text-white">{u.firstName} {u.lastName}</span>
                            <span className="text-slate-400 ml-2 text-sm">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">{u.totalTrips} trips</span>
                            <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-bold">
                              {u.fraudStrikes} strikes
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Pending */}
                {stats.recentPendingTrips && stats.recentPendingTrips.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">⏳ Recent Pending Trips</h3>
                      <button onClick={() => setActiveTab('verification')} className="text-sm text-emerald-400 hover:underline">
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {stats.recentPendingTrips.slice(0, 5).map(trip => (
                        <div key={trip._id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{modeIcons[trip.mode] || '🚗'}</span>
                            <div>
                              <span className="font-medium text-white">{trip.user?.firstName} {trip.user?.lastName}</span>
                              <div className="text-sm text-slate-400">{trip.distanceKm?.toFixed(1)} km • EcoScore: {trip.ecoScore}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">Pending</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Trip Verification Queue</h2>
                  <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
                    {pendingTrips.length} pending
                  </span>
                </div>

                {pendingTrips.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
                    <p className="text-slate-400">No pending trip verifications.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTrips.map(trip => (
                      <motion.div
                        key={trip._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{modeIcons[trip.mode] || '🚗'}</div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{trip.user?.firstName} {trip.user?.lastName}</h3>
                              <p className="text-sm text-slate-400">{trip.user?.email}</p>
                              {trip.user?.fraudStrikes > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs mt-1">
                                  <FaExclamationTriangle /> {trip.user.fraudStrikes} fraud strike(s)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${modeColors[trip.mode] || 'text-white'}`}>{trip.mode}</div>
                            <div className="text-sm text-slate-400">{new Date(trip.endTime || trip.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Trip Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                            <div className="text-xs text-slate-400">Distance</div>
                            <div className="text-lg font-bold text-white">{trip.distanceKm?.toFixed(1)} km</div>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                            <div className="text-xs text-slate-400">Duration</div>
                            <div className="text-lg font-bold text-white">{trip.actualMinutes || trip.etaMinutes} min</div>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                            <div className="text-xs text-slate-400">EcoScore</div>
                            <div className="text-lg font-bold text-emerald-400">{trip.ecoScore}</div>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                            <div className="text-xs text-slate-400">XP</div>
                            <div className="text-lg font-bold text-yellow-400">{trip.xpEarned}</div>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                            <div className="text-xs text-slate-400">Credits</div>
                            <div className="text-lg font-bold text-blue-400">{trip.carbonCreditsEarned}</div>
                          </div>
                        </div>

                        {/* Verification Data */}
                        <div className="mb-4 p-4 bg-slate-700/20 rounded-lg">
                          <h4 className="text-sm font-semibold text-slate-300 mb-2">Verification Data</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-slate-400">Ticket:</span>{' '}
                              <span className={trip.verification?.ticketUploaded ? 'text-green-400' : 'text-red-400'}>
                                {trip.verification?.ticketUploaded ? '✅ Uploaded' : '❌ None'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">GPS Points:</span>{' '}
                              <span className="text-white">{trip.tracking?.locationHistory?.length || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Avg Speed:</span>{' '}
                              <span className="text-white">{trip.verification?.speedAnalysis?.avgSpeed?.toFixed(1) || '-'} km/h</span>
                            </div>
                            <div className="p-2 bg-slate-800/50 rounded-lg">
                              <span className="text-slate-400">Booked With Us:</span>{' '}
                              <span className={trip.bookedWithUs ? 'text-green-400 font-bold' : 'text-slate-400'}>
                                {trip.bookedWithUs ? '✅ Yes' : '❌ No'}
                              </span>
                            </div>
                            {trip.verification?.selfieUrls?.length > 0 && (
                              <div>
                                <span className="text-slate-400">Selfies:</span>{' '}
                                <span className="text-blue-400">{trip.verification.selfieUrls.length} uploaded</span>
                              </div>
                            )}
                            {trip.verification?.fraudCheck?.fraudScore !== undefined && (
                              <div>
                                <span className="text-slate-400">Fraud Score:</span>{' '}
                                <span className={trip.verification.fraudCheck.fraudScore > 40 ? 'text-red-400' : 'text-green-400'}>
                                  {trip.verification.fraudCheck.fraudScore}/100
                                </span>
                              </div>
                            )}
                          </div>
                          {trip.verification?.fraudCheck?.flags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {trip.verification.fraudCheck.flags.map((flag, i) => (
                                <span key={i} className="px-2 py-1 bg-red-500/10 text-red-300 rounded text-xs">{flag}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleApprove(trip._id)}
                            disabled={actionLoading === trip._id}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === trip._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaCheck />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModal(trip._id)}
                            disabled={actionLoading === trip._id}
                            className="flex items-center gap-2 px-6 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2">
                    <FaSearch className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                      className="bg-transparent border-none outline-none text-white placeholder-slate-500 w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">User</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Level</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">EcoScore</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Trips</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">CO₂ Saved</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Credits</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Trees</th>
                        <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Fraud</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {user.firstName?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-slate-400 text-xs">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-white">{user.level}</td>
                          <td className="text-center py-3 px-4 text-emerald-400 font-semibold">{user.ecoScore}</td>
                          <td className="text-center py-3 px-4 text-white">{user.totalTrips}</td>
                          <td className="text-center py-3 px-4 text-green-400">{(user.co2Saved || 0).toFixed(1)}kg</td>
                          <td className="text-center py-3 px-4 text-yellow-400">{user.carbonCredits}</td>
                          <td className="text-center py-3 px-4 text-green-400">{user.treesGrown}</td>
                          <td className="text-center py-3 px-4">
                            {user.fraudStrikes > 0 ? (
                              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-bold">{user.fraudStrikes}</span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Reject Trip Verification</h3>
              <p className="text-slate-400 text-sm mb-4">
                This will reject the trip, give no rewards, and add a fraud strike to the user.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (required)..."
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 outline-none focus:border-red-500 transition-colors resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(''); }}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Trip'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
