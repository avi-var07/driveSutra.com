
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords don't match");
    }
    if (formData.password.length < 6) {
      return setError('Password must be 6+ characters');
    }

    setLoading(true);

    // Mock registration
    setTimeout(() => {
      login({ name: formData.name, email: formData.email }, 'fake-jwt-token-123');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-8">Create Account</h2>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-70"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-green-600 font-bold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;