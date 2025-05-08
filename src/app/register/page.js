'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContainer';
import Image from 'next/image';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();

  const { name, email, password, confirmPassword, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    console.log('Selected role:', role);

    try {
      const result = await register({ name, email, password, role });
      
      if (!result.success) {
        setError(result.message || 'Registration failed');
      }else{
        router.push('/');
      }
    } catch (err) {
      console.error(err);
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
            Join Taskify for better productivity
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Create your account and start managing your tasks today.
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

      {/* Right side - Registration form */}
      <div className="auth-form">
        <div className="auth-form-container">
          <div className="mb-4">
            <h1 className="auth-title">Taskify</h1>
            <p className="auth-subtitle">Manage tasks</p>
          </div>

          <div className="mb-4">
            <h2 className="auth-form-title">Create an account</h2>
            <p className="auth-form-subtitle">Get started with Taskify</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="auth-input"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Full name"
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                className="auth-input"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Email address"
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                className="auth-input"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Password"
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                className="auth-input"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="form-group">
              <select
                className="auth-input"
                id="role"
                name="role"
                value={role}
                onChange={handleChange}
                suppressHydrationWarning
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                className="auth-button"
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="mt-3 text-center">
                <span className="auth-text">Already have an account? </span>
                <Link href="/login" className="auth-link">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 