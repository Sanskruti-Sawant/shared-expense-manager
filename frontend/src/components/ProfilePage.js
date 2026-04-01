import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaKey, FaSignOutAlt, FaUser } from 'react-icons/fa';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('view');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const getInitials = () => {
    return user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      setMessageType('error');
      setMessage('Name and email cannot be empty');
      return;
    }
    // Call update profile API here
    setMessageType('success');
    setMessage('Profile updated successfully!');
    setTimeout(() => {
      setMessage('');
    }, 2000);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessageType('error');
      setMessage('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessageType('error');
      setMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessageType('error');
      setMessage('Password must be at least 6 characters');
      return;
    }
    // Call change password API here
    setMessageType('success');
    setMessage('Password updated successfully!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setMessage('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <button className="back-button" onClick={handleBackClick} title="Go back">
          <FaArrowLeft size={20} />
        </button>
        <h1>My Profile</h1>
        <div className="placeholder"></div>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">{getInitials()}</div>
            <h2>{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              <FaUser size={16} />
              <span>Profile Info</span>
            </button>
            <button
              className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              <FaEdit size={16} />
              <span>Edit Profile</span>
            </button>
            <button
              className={`tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FaKey size={16} />
              <span>Security</span>
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === 'view' && (
            <div className="tab-content">
              <div className="profile-info-group">
                <label>Full Name</label>
                <p>{user?.name}</p>
              </div>
              <div className="profile-info-group">
                <label>Email Address</label>
                <p>{user?.email}</p>
              </div>
              <div className="profile-info-group">
                <label>Member Since</label>
                <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && (
            <div className="tab-content">
              {message && (
                <div className={`message ${messageType}`}>
                  {message}
                </div>
              )}
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleUpdateProfile}>
                  Save Changes
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setEditName(user?.name || '');
                    setEditEmail(user?.email || '');
                    setMessage('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="security-section">
                <h3>Password Management</h3>
                <p className="security-description">Update your password to keep your account secure.</p>
                <button
                  className="btn-change-password"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <FaKey size={14} />
                  Change Password
                </button>
              </div>
            </div>
          )}

          <div className="profile-footer">
            <button className="btn-logout" onClick={handleLogout}>
              <FaSignOutAlt size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setMessage('');
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="btn-save"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
