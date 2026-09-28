import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/EditProfile.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    city: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { currentUser, loading, updateProfile } = useAuth();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        city: currentUser.city || '',
        email: currentUser.email || '',
      });
    }
  }, [loading, currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: formData.name, bio: formData.bio, city: formData.city });
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-card">
        <div className="edit-header">
          <button className="back-btn" onClick={handleCancel}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2>Edit Profile</h2>
          <button className="save-header-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="edit-body">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed</small>
          </div>
        </div>

        <div className="edit-actions">
          <button className="cancel-edit-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="save-edit-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
