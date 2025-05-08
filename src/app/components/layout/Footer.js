'use client';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="py-5 mt-auto position-relative">
      <div className="position-absolute top-0 left-0 w-100 h-1" style={{
        background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)'
      }}></div>
      <div className="container mx-auto px-4">
        <div className="card-cont">
          <div className="col-md-4 mb-4 mb-md-0">
            <h3 className="font-weight-bold mb-3" style={{
              background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Taskify</h3>
            <p className="text-muted mb-0">A powerful, collaborative platform for teams to create, assign, track, and manage tasks efficiently.</p>
          </div>
          <div className="col-md-2 mb-4 mb-md-0">
            <h5 className="font-weight-bold mb-3">Features</h5>
            <div className="footer-links">
              <a href="#" className="footer-link">Dashboard</a>
              <a href="#" className="footer-link">Tasks</a>
              <a href="#" className="footer-link">Projects</a>
              <a href="#" className="footer-link">Reports</a>
            </div>
          </div>
          <div className="col-md-2 mb-4 mb-md-0">
            <h5 className="font-weight-bold mb-3">Company</h5>
            <div className="footer-links">
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
          </div>
          <div className="col-md-4">
            <h5 className="font-weight-bold mb-3">Connect</h5>
            <div className="d-flex gap-3 mb-3">
              <a href="#" className="d-flex align-items-center justify-content-center rounded-circle hover-lift" style={{
                width: '40px',
                height: '40px',
                background: 'var(--glass-background)',
                backdropFilter: 'var(--glass-backdrop-filter)',
                border: 'var(--glass-border)',
                transition: 'all 0.3s ease'
              }}>
                <span>🐦</span>
              </a>
              <a href="#" className="d-flex align-items-center justify-content-center rounded-circle hover-lift" style={{
                width: '40px',
                height: '40px',
                background: 'var(--glass-background)',
                backdropFilter: 'var(--glass-backdrop-filter)',
                border: 'var(--glass-border)',
                transition: 'all 0.3s ease'
              }}>
                <span>📱</span>
              </a>
              <a href="#" className="d-flex align-items-center justify-content-center rounded-circle hover-lift" style={{
                width: '40px',
                height: '40px',
                background: 'var(--glass-background)',
                backdropFilter: 'var(--glass-backdrop-filter)',
                border: 'var(--glass-border)',
                transition: 'all 0.3s ease'
              }}>
                <span>💼</span>
              </a>
              <a href="#" className="d-flex align-items-center justify-content-center rounded-circle hover-lift" style={{
                width: '40px',
                height: '40px',
                background: 'var(--glass-background)',
                backdropFilter: 'var(--glass-backdrop-filter)',
                border: 'var(--glass-border)',
                transition: 'all 0.3s ease'
              }}>
                <span>📷</span>
              </a>
            </div>
            <p className="text-muted mb-2">Stay updated with our newsletter</p>
            <div className="newsletter-form">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Email address"
                suppressHydrationWarning={true}
              />
              <button
                className="newsletter-button"
                suppressHydrationWarning={true}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <hr className="my-4" style={{ opacity: 0.1 }} />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-muted mb-2 mb-md-0">&copy; {year} Task Management System. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted hover-lift">Privacy Policy</a>
            <a href="#" className="text-muted hover-lift">Terms of Service</a>
            <a href="#" className="text-muted hover-lift">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 