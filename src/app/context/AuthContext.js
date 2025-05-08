'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../components/ui/ToastContainer';

// Create the auth context
const AuthContext = createContext();
const setCookie = (name, value, days) => {
  if (typeof window === 'undefined') return;
  
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const removeCookie = (name) => {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999;';
}; 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  // Check if user is logged in on page load
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken && storedUser !== 'undefined') {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // Ensure cookie is set as well
          setCookie('jwt', storedToken, 7);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        removeCookie('jwt');
      }
    }
    
    setLoading(false);
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save user and token to local storage and state
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCookie('jwt', data.token, 7); // Store for 7 days
      
      addToast('Registration successful!', 'success');
      router.push('/dashboard');
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.message);
      addToast(error.message, 'error');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save user and token to local storage and state
      if (data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Also store in cookies for middleware
        setCookie('jwt', data.token, 7); // Store for 7 days
        
        setToken(data.token);
        setUser(data.user);
      } else {
        console.error('No user data received from server');
      }
      
      addToast('Login successful!', 'success');
      router.push('/dashboard');
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message);
      addToast(error.message, 'error');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      // Call logout API
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Clear local storage and cookies
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      removeCookie('jwt');
      setToken(null);
      setUser(null);
      
      addToast('Logged out successfully', 'success');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error.message);
      
      // Even if there's an error, we want to clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/updatedetails`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update user in local storage and state
      const updatedUser = { ...user, ...data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      addToast('Profile updated successfully', 'success');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error.message);
      addToast(error.message, 'error');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/updatepassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      // Update token if returned
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      
      addToast('Password changed successfully', 'success');
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error.message);
      addToast(error.message, 'error');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Forgot password request failed');
      }
      
      addToast('Password reset email sent', 'success');
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error.message);
      addToast(error.message, 'error');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resetpassword/${resetToken}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
      
      addToast('Password has been reset successfully', 'success');
      router.push('/login');
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error.message);
      addToast(error.message, 'error');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If token is invalid, logout
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
    } catch (error) {
      console.error('Fetch user error:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 