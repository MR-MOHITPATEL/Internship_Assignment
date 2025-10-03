import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import defaultAvatar from '../assets/default-avatar-profile.webp'; // Import the default avatar

const Profile = ({ user, stats }) => {
  const navigate = useNavigate();

  if (!user) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar" onClick={() => navigate('/profile')}>
          <img
            src={user.avatar ? user.avatar : defaultAvatar}
            alt="Profile"
            className="avatar-image"
          />
        </div>
        <div className="profile-basic-info">
          <h3>{user.name}</h3>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-stats">
        {stats && (
          <>
            <div className="stat-item">
              <span className="stat-number">{stats.totalTasks || 0}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.statusCounts?.completed || 0}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.statusCounts?.pending || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
          </>
        )}
      </div>

      <div className="profile-info">
        <div className="profile-field">
          <label>Member since:</label>
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        {user.mobileNumber && (
          <div className="profile-field">
            <label>Mobile:</label>
            <span>{user.mobileNumber}</span>
          </div>
        )}
      </div>

      <button 
        className="edit-profile-button"
        onClick={() => navigate('/profile')}
      >
        Edit Profile
      </button>
    </div>
  );
};

export default Profile;
