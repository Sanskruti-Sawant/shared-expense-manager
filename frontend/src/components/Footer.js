import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Shared Household Budget Planner</h3>
        <div className="footer-bottom">
          <p>&copy; 2024 Budget Planner. All rights reserved. Manage household expenses together 💜</p>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
            <a href="/privacy" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Privacy</a>
            <a href="/terms" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Terms</a>
            <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
