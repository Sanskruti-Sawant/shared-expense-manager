import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import '../styles/ProfileMenu.css';

function ProfileMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    return user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="profile-menu">
      <button
        className="profile-button"
        onClick={handleProfileClick}
        title={user?.name || 'My Profile'}
      >
        <div className="profile-avatar">
          {getInitials()}
        </div>
      </button>
    </div>
  );
}

export default ProfileMenu;
