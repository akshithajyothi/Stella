import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import '../styles/Profile.css';

const Profile = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ReStyle Profile',
        text: `Check out ${currentUser?.name || currentUser?.email}'s profile on ReStyle!`,
        url: window.location.href,
      }).catch(() => {
        alert('Profile link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleSubscribe = () => {
    alert('Subscribed! You will receive updates from this user.');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  if (loading) return <Spinner label="Loading your profile…" />;
  if (!currentUser) return null;

  const username = currentUser.email.split('@')[0];
  const joinDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="profile-overlay">
      <button className="close-btn" onClick={handleClose}>
        <i className="fa-solid fa-xmark"></i>
      </button>

      <div className="profile-card-modern">
        <div className="profile-banner">
          <div className="banner-actions">
            <button className="icon-btn" onClick={handleShare} title="Share profile">
              <i className="fa-solid fa-arrow-up-from-bracket"></i>
            </button>
            <div className="menu-container">
              <button className="icon-btn" onClick={toggleMenu} title="More options">
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </button>
              {showMenu && (
                <div className="dropdown-menu">
                  <button className="menu-item" onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-avatar-modern">
          <i className="fa-solid fa-user"></i>
        </div>

        <div className="profile-info">
          <p className="profile-username">@{username}</p>
          <h2 className="profile-name">
            {currentUser.name || username}
            <i className="fa-solid fa-circle-check verified-badge"></i>
          </h2>
          <p className="profile-bio">
            {currentUser.bio || 'Fashion enthusiast | ReStyle member'}
          </p>
          <p className="profile-meta">
            <i className="fa-solid fa-location-dot"></i> {currentUser.city || 'USA'} • Joined {joinDate}
          </p>
        </div>

        <div className="profile-actions-modern">
          <button className="subscribe-btn" onClick={handleSubscribe}>
            Subscribe
          </button>
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            Edit profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
