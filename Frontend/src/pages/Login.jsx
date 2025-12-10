import React from 'react';
import Navbar from '../components/common/Navbar';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#05181a] to-[#04121a]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
