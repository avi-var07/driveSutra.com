import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingTrips, setPendingTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    // Set admin token for API calls
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, tripsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/trips/pending')
      ]);

      setStats(dashboardRes.data.stats);
      setPendingTrips(tripsRes.data.trips);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tripId, adjustedEcoScore = null) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/trips/${tripId}/approve`, {
        notes: 'Approved by admin',
        adjustedEcoScore
      });

      alert('✅ Trip approved successfully!');
      fetchDashboardData();
      setSelectedTrip(null);
    } catch (error) {
      console.error('Failed to approve trip:', error);
      alert('Failed to approve trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (tripId, reason) => {
    if (!reason) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/trips/${tripId}/reject`, {
        reason,
        notes: 'Rejected by admin'
      });

      alert('❌ Trip rejected');
      fetchDashboardData();
      setSelectedTrip(null);
    } catch (error) {
      console.error('Failed to reject trip:', error);
      alert('Failed to reject trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Verifications"
            value={stats?.pendingVerifications || 0}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Total Trips"
            value={stats?.totalTrips || 0}
            icon="🚗"
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon="👥"
            color="green"
          />
          <StatCard
            title="CO2 Saved"
            value={`${(stats?.totalCO2Saved || 0).toFixed(1)} kg`}
            icon="🌍"
            color="purple"
          />
        </div>

        {/* Pending Trips Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Trip Verifications ({pendingTrips.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EcoScore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingTrips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {trip.user?.firstName?.[0]}{trip.user?.lastName?.[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {trip.user?.firstName} {trip.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trip.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {trip.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.distanceKm.toFixed(2)} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.ecoScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {trip.verification.ticketUploaded && (
                        <span className="text-green-600">📷 Ticket</span>
                      )}
                      {trip.verification.transactionVerified && (
                        <span className="text-blue-600">💳 Transaction</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTrip(trip)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pendingTrips.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No pending verifications
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Trip Review Modal */}
      {selectedTrip && (
        <TripReviewModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  return (
    <div className={`${colors[color]} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function TripReviewModal({ trip, onClose, onApprove, onReject, loading }) {
  const [adjustedScore, setAdjustedScore] = useState(trip.ecoScore);
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trip Review</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Trip Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">User</label>
                <p className="text-lg">{trip.user?.firstName} {trip.user?.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Mode</label>
                <p className="text-lg">{trip.mode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Distance</label>
                <p className="text-lg">{trip.distanceKm.toFixed(2)} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-lg">{trip.actualMinutes || trip.etaMinutes} min</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">EcoScore</label>
                <p className="text-lg font-bold text-green-600">{trip.ecoScore}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">CO2 Saved</label>
                <p className="text-lg">{trip.co2Saved.toFixed(2)} kg</p>
              </div>
            </div>

            {/* Verification Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Verification Details</h3>
              {trip.verification.ticketUploaded && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Ticket Image:</p>
                  <img
                    src={trip.verification.ticketImageUrl}
                    alt="Ticket"
                    className="mt-2 max-w-full h-auto rounded border"
                  />
                </div>
              )}
              {trip.verification.transactionVerified && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID:</p>
                  <p className="font-mono">{trip.verification.transactionId}</p>
                </div>
              )}
            </div>

            {/* Adjust EcoScore */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjust EcoScore (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={adjustedScore}
                onChange={(e) => setAdjustedScore(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Original: {trip.ecoScore} | Adjusted: {adjustedScore}
              </p>
            </div>

            {/* Rejection Reason */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Enter reason for rejection..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onApprove(trip._id, adjustedScore !== trip.ecoScore ? adjustedScore : null)}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : '✅ Approve'}
            </button>
            <button
              onClick={() => onReject(trip._id, rejectionReason)}
              disabled={loading || !rejectionReason}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : '❌ Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
