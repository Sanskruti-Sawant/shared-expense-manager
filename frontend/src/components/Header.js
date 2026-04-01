import React, { useState } from 'react';
import { FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import ProfileMenu from './ProfileMenu';

function Header({ scrollY, userCount, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="header">
      <div className="header-top">
        <FaMoneyBillWave style={{ marginRight: '0.5rem', display: 'inline' }} />
        SHARED HOUSEHOLD BUDGET PLANNER
        <FaMoneyBillWave style={{ marginLeft: '0.5rem', display: 'inline' }} />
      </div>
      <div className="header-main">
        <div className="logo">
          <h1>Budget</h1>
          <p>Planner</p>
        </div>
        <nav className="nav">
          <span className="members-count">
            <FaUsers style={{ marginRight: '0.3rem', display: 'inline' }} />
            {userCount} Members
          </span>
        </nav>
        <div className="nav-icons">
          <div 
            className={`nav-icon refresh-icon ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh} 
            title="Refresh data" 
            style={{ cursor: 'pointer' }}
          >
            <MdRefresh size={20} />
          </div>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
