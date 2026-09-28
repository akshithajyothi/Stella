import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLogin = async () => {
    if (email === '' || password === '') {
      setError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again or create an account.');
    }
  };

  const handleCreateAccount = async () => {
    if (name === '' || email === '' || password === '' || confirmPassword === '') {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    if (email === '') {
      alert('Please enter your email address first.');
      return;
    }
    alert('Password reset link will be sent to ' + email);
  };

  const toggleMode = () => {
    setIsCreatingAccount(!isCreatingAccount);
    setError('');
    setConfirmPassword('');
  };

  return (
    <>
      <Header />

      <section className="login-section">
        <h1>{isCreatingAccount ? 'CREATE ACCOUNT' : 'LOGIN'}</h1>
        <p>
          {isCreatingAccount
            ? 'Create your ReStyle account to start shopping and managing your wardrobe.'
            : 'Login to your ReStyle account to see your orders, manage your items, and spend your credits.'}
        </p>

        <div className="login-box">
          {error && <div className="error">{error}</div>}

          {isCreatingAccount && (
            <>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />

          {isCreatingAccount && (
            <>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
              />
            </>
          )}

          {!isCreatingAccount && (
            <a href="#" className="forgot" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
          )}

          <button
            className="login-btn"
            onClick={isCreatingAccount ? handleCreateAccount : handleLogin}
          >
            {isCreatingAccount ? 'CREATE ACCOUNT' : 'LOGIN'}
          </button>

          <a href="#" className="create-account" onClick={toggleMode}>
            {isCreatingAccount
              ? 'Already have an account? Login'
              : 'Create an Account'} <span>→</span>
          </a>
        </div>
      </section>

      <div className="spacer"></div>
    </>
  );
};

export default Login;
