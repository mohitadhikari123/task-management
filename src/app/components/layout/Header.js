'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { user, token, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch notifications on component load if user is logged in
    const fetchNotifications = async () => {
      if (user && token) {
        try {
          const res = await getNotifications(token, 1, 10);
          setNotifications(res.data || []);
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      }
    };
    
    fetchNotifications();
  }, [user, token]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Initialize dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Add click outside handler for mobile menu and notifications
    const handleClickOutside = (event) => {
      // Process if the mobile menu is open
      if (isMobileMenuOpen) {
        // Check if the click was outside the mobile menu container
        const mobileMenuContainer = document.querySelector('.mobile-menu-container');
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        
        if (mobileMenuContainer && 
            !mobileMenuContainer.contains(event.target) && 
            !mobileMenuButton.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
      
      // Process if the notifications panel is open
      if (isNotificationsOpen) {
        const notificationButton = document.querySelector('.notification-button');
        const notificationPanel = document.querySelector('.position-absolute.end-0.mt-2.card-glass');
        const mobileNotificationPanel = document.querySelector('.mobile-notifications-container');
        
        // Close if click is outside the notification button and panels
        if ((!notificationButton || !notificationButton.contains(event.target)) &&
            (!notificationPanel || !notificationPanel.contains(event.target)) &&
            (!mobileNotificationPanel || !mobileNotificationPanel.contains(event.target))) {
          setIsNotificationsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isNotificationsOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotifications = async (e) => {
    // If an event is passed, prevent it from bubbling up
    if (e) {
      e.stopPropagation();
    }
    
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen && user && token) {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        const res = await getNotifications(token, 1, 10);
        setNotifications(res.data || []);
      } catch (err) {
        setNotificationsError('Failed to load notifications');
      } finally {
        setNotificationsLoading(false);
      }
    }
  };

  const handleMarkRead = async (notificationId) => {
    if (!token) return;
    try {
      await markAsRead(token, notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markAllAsRead(token);
      setNotifications([]);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.task) {
      router.push(`/tasks/${notification.task._id || notification.task}`);
      setIsNotificationsOpen(false);
    }
  };

  return (
    <header className={`${scrolled ? 'glass sticky-top shadow-lg' : 'bg-transparent'} transition-all duration-300`} style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div className="container mx-auto px-4 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Link href="/" className="text-decoration-none">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{
                background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Taskify</h1>
            </Link>
          </div>

          {/* Mobile menu button - only visible on mobile (<576px) screens */}
          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-button"
            aria-label="Toggle navigation menu"
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--glass-background)',
              backdropFilter: 'var(--glass-backdrop-filter)',
              WebkitBackdropFilter: 'var(--glass-backdrop-filter)',
              border: 'var(--glass-border)',
              zIndex: 1100,
            }}
          >
            <span style={{ 
              display: 'block', 
              position: 'relative',
              width: '18px', 
              height: '2px',
              backgroundColor: isMobileMenuOpen ? 'transparent' : 'currentColor',
              transition: 'all 0.3s ease'
            }}>
              <span style={{
                position: 'absolute',
                width: '18px',
                height: '2px',
                backgroundColor: 'currentColor',
                left: 0,
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(45deg)' : 'translateY(-6px)',
              }}></span>
              <span style={{
                position: 'absolute',
                width: '18px',
                height: '2px',
                backgroundColor: 'currentColor',
                left: 0,
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'translateY(6px)',
              }}></span>
            </span>
          </button>

          <div className={`d-none d-sm-flex align-items-center`}>
            {user ? (
              <>
                {/* Navigation for authenticated users */}
                <nav className="d-flex space-x-4 mr-4">
                  <Link href="/dashboard" className="hover-lift nav-link position-relative px-2 py-1">
                    Dashboard
                    <span className="nav-link-highlight"></span>
                  </Link>
                  <Link href="/tasks" className="hover-lift nav-link position-relative px-2 py-1">
                    Tasks
                    <span className="nav-link-highlight"></span>
                  </Link>
                  {['admin', 'manager'].includes(user.role) && (
                    <Link href="/tasks/create" className="hover-lift nav-link position-relative px-2 py-1">
                      Create Task
                      <span className="nav-link-highlight"></span>
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="hover-lift nav-link position-relative px-2 py-1">
                      Admin Panel
                      <span className="nav-link-highlight"></span>
                    </Link>
                  )}
                </nav>

                {/* Notifications */}
                <div className="position-relative mr-4">
                  <button
                    onClick={(e) => toggleNotifications(e)}
                    className="btn btn-glass rounded-circle p-2 position-relative notification-button"
                    aria-expanded={isNotificationsOpen}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--glass-background)',
                      backdropFilter: 'var(--glass-backdrop-filter)',
                      WebkitBackdropFilter: 'var(--glass-backdrop-filter)',
                      border: 'var(--glass-border)',
                      overflow: 'visible'
                    }}
                  >
                    <span>🔔</span>
                    
                    {notifications.length > 0 && (
                      <span className="badge badge-danger position-absolute" style={{
                        top: '-5px',
                        right: '-5px',
                        transform: 'scale(0.8)'
                      }}>
                        {notifications.length}
                      </span>
                    )}
                    
                  </button>

                  {isNotificationsOpen && (
                    <div className="position-absolute end-0 mt-2 card-glass" style={{
                      width: '320px',
                      zIndex: 1000,
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--box-shadow)',
                      overflow: 'hidden',
                      animation: 'fadeInDown 0.3s ease'
                    }}>
                      <div className="p-3 border-bottom">
                        <h3 className="font-weight-bold mb-0 d-flex align-items-center justify-content-between">
                          <span>Notifications</span>
                          {notifications.length > 0 && (
                            <span className="badge badge-primary">{notifications.length}</span>
                          )}
                        </h3>
                      </div>
                      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {notificationsLoading ? (
                          <div className="p-4 text-center">
                            <div className="mb-3" style={{ fontSize: '2rem' }}>⏳</div>
                            <p className="text-muted mb-0">Loading notifications...</p>
                          </div>
                        ) : notificationsError ? (
                          <div className="p-4 text-center">
                            <div className="mb-3" style={{ fontSize: '2rem' }}>⚠️</div>
                            <p className="text-danger mb-0">{notificationsError}</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center">
                            <div className="mb-3" style={{ fontSize: '2rem' }}>🔔</div>
                            <p className="text-muted mb-0">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className="p-3 border-bottom hover-shadow transition-all"
                              style={{ transition: 'all 0.2s ease', cursor: notification.task ? 'pointer' : 'default' }}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <p className="font-weight-medium mb-1">{notification.title}</p>
                              <p className="small text-muted mb-1">{notification.message}</p>
                              <p className="small text-muted mb-0 d-flex justify-content-between">
                                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                <button
                                  className="btn-link small p-0 border-0 bg-transparent"
                                  onClick={e => { e.stopPropagation(); handleMarkRead(notification._id); }}
                                >Mark read</button>
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && !notificationsLoading && !notificationsError && (
                        <div className="p-2 text-center border-top">
                          <button className="btn btn-sm btn-link text-decoration-none" onClick={handleMarkAllRead}>Mark all as read</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User dropdown */}
                <div className="position-relative">
                  <button
                    onClick={toggleMenu}
                    className="d-flex align-items-center rounded-pill hover-lift transition-all px-3 py-1"
                    aria-expanded={isMenuOpen}
                    style={{
                      borderRadius: '20px',
                      border: '1px solid var(--color-gray-300)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className="rounded-circle bg-gradient-to-r from-primary to-secondary text-white d-flex align-items-center justify-content-center mr-2" style={{
                      width: '30px',
                      height: '30px',
                      color: '#ffffff',
                      WebkitBackgroundClip: 'text',
                      background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))'
                    }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="mr-2 d-none d-sm-inline">{user.name}</span>
                    <span className="text-muted small">▼</span>
                  </button>

                  {isMenuOpen && (
                    <div className="position-absolute end-0 mt-2 card-glass" style={{
                      width: '200px',
                      zIndex: 1000,
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--box-shadow)',
                      overflow: 'hidden',
                      animation: 'fadeInDown 0.3s ease'
                    }}>
                      
                      <button
                        onClick={logout}
                        className="d-block w-100 text-start px-4 py-2 hover-shadow transition-all border-0 bg-transparent"
                        style={{ color: 'var(--color-danger)', width: '100%' }}
                      >
                        <i className="mr-2">🚪</i> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Navigation for unauthenticated users */}
                <Link href="/login" className="btn btn-outline-primary hover-lift mr-2">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary hover-lift">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease',
          }}>
            <div className="mobile-menu-container d-sm-none card-glass" style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '75%',
              maxWidth: '300px',
              height: '100vh',
              boxShadow: 'var(--box-shadow)',
              padding: '2rem 1rem',
              zIndex: 1001,
              animation: 'slideInRight 0.3s ease',
              overflowY: 'auto',
            }}>
              <div className="mobile-menu-header d-flex justify-content-between align-items-center mb-4" style={{
                marginTop: '-11px',
                marginRight: '12px'
              }}>
                <h3 className="m-0 font-weight-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem'
                }}>Menu</h3>
                <div className="d-flex align-items-center">
                  {user && (
                    <div className="position-relative mr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNotifications(e);
                        }}
                        className="btn btn-glass rounded-circle p-2 position-relative notification-button"
                        aria-expanded={isNotificationsOpen}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--glass-background)',
                          overflow: 'visible'
                        }}
                      >
                        <span>🔔</span>
                        
                        {notifications.length > 0 && (
                          <span className="badge badge-danger position-absolute" style={{
                            top: '-5px',
                            right: '-5px',
                            transform: 'scale(0.8)'
                          }}>
                            {notifications.length}
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={toggleMobileMenu} 
                    className="btn btn-glass rounded-circle p-2"
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--glass-background)',
                    }}
                  >
                    <span>✕</span>
                  </button>
                </div>
              </div>

              {user ? (
                <>
                  {/* User info in mobile menu */}
                  <div className="mobile-user-info d-flex align-items-center mb-4 p-3" style={{
                    borderRadius: 'var(--border-radius)',
                    background: 'var(--glass-background)',
                    backdropFilter: 'var(--glass-backdrop-filter)',
                    WebkitBackdropFilter: 'var(--glass-backdrop-filter)',
                  }}>
                    <div className="rounded-circle bg-gradient-to-r from-primary to-secondary text-white d-flex align-items-center justify-content-center mr-3" style={{
                      width: '40px',
                      height: '40px',
                      flexShrink: 0,
                      WebkitTextFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))'
                    }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-weight-bold mb-0">{user.name}</p>
                      <p className="text-muted small mb-0">{user.email}</p>
                    </div>
                  </div>

                  {/* Navigation items in mobile menu */}
                  <nav className="mobile-nav">
                    <Link href="/dashboard" 
                      className="mobile-nav-item d-flex align-items-center p-3 mb-2"
                      onClick={toggleMobileMenu}
                      style={{
                        borderRadius: 'var(--border-radius)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="mr-3">📊</span>
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/tasks" 
                      className="mobile-nav-item d-flex align-items-center p-3 mb-2"
                      onClick={toggleMobileMenu}
                      style={{
                        borderRadius: 'var(--border-radius)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="mr-3">📋</span>
                      <span>Tasks</span>
                    </Link>
                    <Link href="/tasks/create" 
                      className="mobile-nav-item d-flex align-items-center p-3 mb-2"
                      onClick={toggleMobileMenu}
                      style={{
                        borderRadius: 'var(--border-radius)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="mr-3">➕</span>
                      <span>Create Task</span>
                    </Link>
                    <Link href="/profile" 
                      className="mobile-nav-item d-flex align-items-center p-3 mb-2"
                      onClick={toggleMobileMenu}
                      style={{
                        borderRadius: 'var(--border-radius)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="mr-3">👤</span>
                      <span>Profile</span>
                    </Link>
                    <Link href="/settings" 
                      className="mobile-nav-item d-flex align-items-center p-3 mb-2"
                      onClick={toggleMobileMenu}
                      style={{
                        borderRadius: 'var(--border-radius)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="mr-3">⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        toggleMobileMenu();
                      }}
                      className="mobile-nav-item d-flex align-items-center p-3 mb-2 w-100 text-start border-0 bg-transparent"
                      style={{
                        borderRadius: 'var(--border-radius)',
                        transition: 'all 0.2s ease',
                        color: 'var(--color-danger)',
                      }}
                    >
                      <span className="mr-3">🚪</span>
                      <span>Logout</span>
                    </button>
                  </nav>
                </>
              ) : (
                <>
                  <div className="d-flex flex-column p-3">
                    <Link href="/login" 
                      className="btn btn-outline-primary hover-lift w-100 mb-3"
                      onClick={toggleMobileMenu}
                    >
                      Login
                    </Link>
                    <Link href="/register" 
                      className="btn btn-primary hover-lift w-100"
                      onClick={toggleMobileMenu}
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Notifications Panel - Only shown when mobile notifications are open */}
      {isNotificationsOpen && (
        <div className="mobile-notifications-overlay d-sm-none" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1050,
          animation: 'fadeIn 0.3s ease',
        }}>
          <div className="mobile-notifications-container card-glass" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '350px',
            maxHeight: '80vh',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            zIndex: 1051,
            animation: 'fadeInDown 0.3s ease',
            overflowY: 'auto',
          }}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h3 className="font-weight-bold mb-0">Notifications</h3>
              <button
                onClick={toggleNotifications}
                className="btn-glass rounded-circle p-1"
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ maxHeight: 'calc(80vh - 60px)', overflowY: 'auto' }}>
              {notificationsLoading ? (
                <div className="p-4 text-center">
                  <div className="mb-3" style={{ fontSize: '2rem' }}>⏳</div>
                  <p className="text-muted mb-0">Loading notifications...</p>
                </div>
              ) : notificationsError ? (
                <div className="p-4 text-center">
                  <div className="mb-3" style={{ fontSize: '2rem' }}>⚠️</div>
                  <p className="text-danger mb-0">{notificationsError}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="mb-3" style={{ fontSize: '2rem' }}>🔔</div>
                  <p className="text-muted mb-0">No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="p-3 border-bottom hover-shadow transition-all"
                    style={{ transition: 'all 0.2s ease', cursor: notification.task ? 'pointer' : 'default' }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="font-weight-medium mb-1">{notification.title}</p>
                    <p className="small text-muted mb-1">{notification.message}</p>
                    <p className="small text-muted mb-0 d-flex justify-content-between">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      <button
                        className="btn-link small p-0 border-0 bg-transparent"
                        onClick={e => { e.stopPropagation(); handleMarkRead(notification._id); }}
                      >Mark read</button>
                    </p>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && !notificationsLoading && !notificationsError && (
              <div className="p-2 text-center border-top">
                <button className="btn btn-sm btn-link text-decoration-none" onClick={handleMarkAllRead}>
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .nav-link {
          position: relative;
          color: var(--color-gray-700);
          transition: color 0.3s ease;
        }
        
        .nav-link:hover {
          color: var(--color-primary);
        }
        
        .nav-link-highlight {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          transition: width 0.3s ease;
        }
        
        .nav-link:hover .nav-link-highlight {
          width: 100%;
        }
        
        .mobile-nav-item {
          color: var(--color-gray-700);
          text-decoration: none;
        }
        
        .mobile-nav-item:hover {
          background: var(--glass-background);
          color: var(--color-primary);
        }
        
        /* Display utilities */
        .d-block {
          display: block;
        }
        
        .d-flex {
          display: flex;
        }
        
        .d-none {
          display: none;
        }
        
        /* Flexbox utilities */
        .align-items-center {
          align-items: center;
        }
        
        .justify-content-between {
          justify-content: space-between;
        }
        
        .space-x-4 > * + * {
          margin-left: 1rem;
        }
        
        /* Position utilities */
        .position-relative {
          position: relative;
        }
        
        .position-absolute {
          position: absolute;
        }
        
        .position-fixed {
          position: fixed;
        }
        
        /* Border utilities */
        .rounded-circle {
          border-radius: 50%;
        }
        
        /* Spacing utilities */
        .mr-2 {
          margin-right: 0.5rem;
        }
        
        .mr-3 {
          margin-right: 0.75rem;
        }
        
        .mr-4 {
          margin-right: 1rem;
        }
        
        .mb-0 {
          margin-bottom: 0;
        }
        
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        
        .mb-3 {
          margin-bottom: 0.75rem;
        }
        
        .mb-4 {
          margin-bottom: 1rem;
        }
        
        .p-2 {
          padding: 0.5rem;
        }
        
        .p-3 {
          padding: 0.75rem;
        }
        
        .px-2 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        
        .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        
        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        
        .py-3 {
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
        
        /* Glass styling */
        .glass {
          background: var(--glass-background, rgba(255, 255, 255, 0.1));
          backdrop-filter: var(--glass-backdrop-filter, blur(10px));
          -webkit-backdrop-filter: var(--glass-backdrop-filter, blur(10px));
          border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.18));
        }
        
        .card-glass {
          background: var(--glass-background, rgba(255, 255, 255, 0.1));
          backdrop-filter: var(--glass-backdrop-filter, blur(10px));
          -webkit-backdrop-filter: var(--glass-backdrop-filter, blur(10px));
          border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.18));
          border-radius: var(--border-radius, 0.5rem);
          box-shadow: var(--box-shadow, 0 8px 32px 0 rgba(31, 38, 135, 0.37));
        }
        
        .btn-glass {
          background: var(--glass-background, rgba(255, 255, 255, 0.1));
          backdrop-filter: var(--glass-backdrop-filter, blur(10px));
          -webkit-backdrop-filter: var(--glass-backdrop-filter, blur(10px));
          border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.18));
          cursor: pointer;
        }
        
        /* Hover animations */
        .hover-lift {
          transition: transform 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        .hover-shadow {
          transition: box-shadow 0.2s ease;
        }
        
        .hover-shadow:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Text utilities */
        .text-start {
          text-align: left;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-muted {
          color: var(--color-gray-500, #6c757d);
        }
        
        .small {
          font-size: 0.875rem;
        }
        
        .font-weight-bold {
          font-weight: 700;
        }
        
        .font-weight-medium {
          font-weight: 500;
        }
        
        /* Button utilities */
        .btn {
          display: inline-block;
          font-weight: 400;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          border-radius: 0.25rem;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .btn-primary {
          color: white;
          background-color: var(--color-primary);
          border: 1px solid var(--color-primary);
        }
        
        .btn-outline-primary {
          color: var(--color-primary);
          border: 1px solid var(--color-primary);
          background-color: transparent;
        }
        
        .btn-outline-primary:hover {
          color: white;
          background-color: var(--color-primary);
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
          border-radius: 0.2rem;
        }
        
        .btn-link {
          font-weight: 400;
          color: var(--color-primary);
          text-decoration: none;
          background-color: transparent;
        }
        
        /* Responsive breakpoints */
        @media (min-width: 576px) {
          .d-sm-none {
            display: none !important;
          }
          
          .d-sm-block {
            display: block !important;
          }
          
          .d-sm-flex {
            display: flex !important;
          }
          
          .d-sm-inline {
            display: inline !important;
          }

          .mobile-menu-button {
            display: none !important;
          }
        }
        
        @media (max-width: 575.98px) {
          .mobile-menu-button {
            display: flex !important;
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .sticky-top {
          position: sticky;
          top: 0;
        }
      `}</style>
    </header>
  );
};

export default Header; 