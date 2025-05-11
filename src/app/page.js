'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const sections = [heroRef.current, featuresRef.current, ctaRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <main>
      <section className={styles.hero} ref={heroRef}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className={styles.heroTitle}>Task Management Made Simple</h1>
              <p className={styles.heroSubtitle}>
                A powerful, collaborative platform for teams to create, assign, track, and manage tasks efficiently.
              </p>
              {user ? (
                <Link href="/dashboard" className="btn mb-4 btn-primary btn-lg hover-lift">
                  Go to Dashboard
                </Link>
              ) : (
                <div className="mt-4 mb-4 d-flex flex-wrap gap-3">
                  <Link href="/register" className="btn btn-primary btn-lg hover-lift">
                    Get Started
                  </Link>
                  <Link href="/login" className="btn btn-outline-primary btn-lg hover-lift">
                    Login
                  </Link>
                </div>
              )}
            </div>
            <div className="col-lg-6">
              <div className={styles.heroImageContainer}>
                <img
                  src="/images/task-management-hero.svg"
                  alt="Task Management"
                  className={styles.heroImage}
                />
              </div>
            </div>
          </div>
        </div>


      </section>

      <section className={styles.features} ref={featuresRef}>
        <div className="container">
          <div className="text-center mb-5">
            <h5 className="text-primary mb-3" style={{
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontSize: '2.9rem',
              fontWeight: 600
            }}>Key Features</h5>
            <h2 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 700 }}>Everything You Need</h2>
            <p className="text-muted mb-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Our task management system provides all the tools you need to organize, track, and complete your projects.
            </p>
          </div>

          <div className="row g-4 card-cont">
            <div className="col-md-4 mb-4 feature-item">
              <div className={`card ${styles.featureCard} h-100`}>
                <div className="card-body text-center p-4">
                  <div className={styles.featureIcon}>📋</div>
                  <h3 className="card-title mb-3" style={{ fontWeight: 600 }}>Task Management</h3>
                  <p className="card-text">
                    Create, assign, and track tasks with priorities, due dates, and statuses.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4 feature-item">
              <div className={`card ${styles.featureCard} h-100`}>
                <div className="card-body text-center p-4">
                  <div className={styles.featureIcon}>👥</div>
                  <h3 className="card-title mb-3" style={{ fontWeight: 600 }}>Team Collaboration</h3>
                  <p className="card-text">
                    Easily assign tasks to team members and collaborate in real-time.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4 feature-item">
              <div className={`card ${styles.featureCard} h-100`}>
                <div className="card-body text-center p-4">
                  <div className={styles.featureIcon}>🔔</div>
                  <h3 className="card-title mb-3" style={{ fontWeight: 600 }}>Notifications</h3>
                  <p className="card-text">
                    Get notified about task assignments, updates, and approaching deadlines.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-2 card-cont">
            <div className="col-md-4 mb-4 feature-item">
              <div className={`card ${styles.featureCard} h-100`}>
                <div className="card-body text-center p-4">
                  <div className={styles.featureIcon}>🔍</div>
                  <h3 className="card-title mb-3" style={{ fontWeight: 600 }}>Search & Filter</h3>
                  <p className="card-text">
                    Easily find tasks with powerful search and filtering capabilities.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4 feature-item">
              <div className={`card ${styles.featureCard} h-100`}>
                <div className="card-body text-center p-4">
                  <div className={styles.featureIcon}>📊</div>
                  <h3 className="card-title mb-3" style={{ fontWeight: 600 }}>Dashboard & Reports</h3>
                  <p className="card-text">
                    View at-a-glance summaries and track progress with intuitive dashboards.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4 feature-item">
              <div className={`card ${styles.featureCard} h-100`}>
                <div className="card-body text-center p-4">
                  <div className={styles.featureIcon}>🔄</div>
                  <h3 className="card-title mb-3" style={{ fontWeight: 600 }}>Recurring Tasks</h3>
                  <p className="card-text">
                    Set up recurring tasks for regular activities and never miss a deadline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta} ref={ctaRef}>
        <div className={`container text-center ${styles.ctaContent}`}>
          <h2 className={styles.ctaTitle}>Ready to boost your team's productivity?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of teams who use our platform to manage their tasks efficiently.
          </p>
          {user ? (
            <Link href="/dashboard" className={`${styles.ctaButton} hover-lift`}>
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/register" className={`${styles.ctaButton} hover-lift`}>
              Sign Up Now - It's Free!
            </Link>
          )}
        </div>
      </section>

      <style jsx>{`
        .animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .feature-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        
        .animate-in .feature-item:nth-child(1) {
          animation: fadeInUp 0.6s 0.1s ease-out forwards;
        }
        
        .animate-in .feature-item:nth-child(2) {
          animation: fadeInUp 0.6s 0.3s ease-out forwards;
        }
        
        .animate-in .feature-item:nth-child(3) {
          animation: fadeInUp 0.6s 0.5s ease-out forwards;
        }
        
        
      `}</style>
    </main>
  );
}
