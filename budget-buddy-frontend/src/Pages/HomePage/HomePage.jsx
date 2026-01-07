import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home">
      {/* ================= NAVBAR ================= */}
      <nav className="home-nav">
        <div className="nav-brand">Budget Buddy</div>
        <div className="nav-actions">
          <Link to="/login" className="nav-cta">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            A Smarter Way to <br />
            <span>Track Your Money</span>
          </h1>

          <p>
            Budget Buddy is a modern personal finance dashboard that helps you
            track transactions, analyze spending, and stay financially organized
            — all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="primary-btn">
              Start Tracking Free
            </Link>
            <a href="#features" className="secondary-btn">
              Explore Features
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img src="public/images/dashboard.png" alt="Dashboard Preview" />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="section" id="features">
        <h2 className="section-title">
          Everything You Need to Manage Finances
        </h2>

        <div className="features-wrapper">
          <div className="features-slider">
            <div className="feature-card">
              <div className="feature-icon">🌙</div>
              <h3>Dark Mode Support</h3>
              <p>
                Switch seamlessly between light and dark themes for comfortable
                usage at any time of day.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Smart Filtering</h3>
              <p>
                Filter transactions by custom date ranges to analyze spending
                patterns with clarity.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔽</div>
              <h3>Sorting & Search</h3>
              <p>
                Quickly sort and search transactions by date or amount for
                faster insights.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏷️</div>
              <h3>Clear Categorization</h3>
              <p>
                Categorize income and expenses to understand where your money
                actually goes.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure Authentication</h3>
              <p>
                JWT-based authentication ensures your financial data remains
                private and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRANSACTIONS PREVIEW ================= */}
      <section className="section preview-section">
        <div className="preview-content">
          <h2>Track Every Transaction</h2>
          <p>
            View, manage, filter, and analyze all your transactions in a clean,
            distraction-free interface designed for real-world usage.
          </p>
        </div>

        <div className="preview-image">
          <img src="public/images/transaction.png" alt="Transactions Preview" />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="home-footer">
        <p>© 2026 Budget Buddy. All rights reserved.</p>
        <p>
          Built by{" "}
          <a
            href="https://pawang001.github.io"
            target="_blank"
            rel="noreferrer"
          >
            <strong>Pawan Gupta</strong>
          </a>{" "}
          |{" "}
          <a
            href="https://github.com/pawang001"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
