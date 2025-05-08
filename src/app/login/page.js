'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContainer';
import Image from 'next/image';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login({ email, password });
      
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      addToast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left side - Illustration */}
      <div className="auth-illustration">
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            Taskify makes task management
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Stay organized with all your tasks in one place.
          </p>
          
          <div style={{ maxWidth: '320px', margin: '0 auto', position: 'relative', zIndex: '1' }}>
            <img 
              src="/images/task-management-hero.svg" 
              alt="Task Management" 
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="auth-form">
        <div className="auth-form-container">
          <div className="mb-4">
            <h1 className="auth-title">Taskify</h1>
            <p className="auth-subtitle">Manage tasks</p>
          </div>

          <div className="mb-4">
            <h2 className="auth-form-title">Log in</h2>
            <p className="auth-form-subtitle">Task details</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                className="auth-input"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="form-group">
              <label className="mb-2">Password</label>
              <input
                type="password"
                className="auth-input"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                className="auth-button"
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
              
              <div className="mt-3 text-center">
                <Link href="/forgot-password" className="auth-link">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 