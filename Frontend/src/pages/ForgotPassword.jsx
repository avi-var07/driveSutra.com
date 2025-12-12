import React from 'react';
import ForgetPassword from '../components/auth/ForgetPassword';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1f1a] via-[#112820] to-[#0a1d16] text-slate-100">
      <main className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <ForgetPassword />
      </main>
    </div>
  );
};

export default ForgotPassword;
