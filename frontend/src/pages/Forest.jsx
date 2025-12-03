// frontend/src/pages/Forest.jsx
import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageTitle from '../components/common/PageTitle';

const ForestView = () => {
  const trees = 89;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-50">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-20 p-10">
        <PageTitle title="Your Virtual Forest" subtitle={`${trees} trees planted by your eco-friendly trips`} />

        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-4">
            {Array.from({ length: trees }, (_, i) => (
              <div key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-4xl" role="img" aria-label="tree">Tree</span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-3xl font-bold text-green-700">You've saved {trees * 22} kg of CO₂!</p>
            <p className="text-gray-600 mt-4 text-lg">That's equal to planting {trees} real trees</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForestView;