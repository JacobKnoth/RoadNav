import Button from 'react-bootstrap/Button';
import { useAuth } from '../contexts/AuthContext';
import googleLogo from '../assets/google.png';
import './AuthButtons.css'; // Add this file for custom animations

export default function AuthButtons() {
  const { user, googleLogin, logout } = useAuth();

  return user ? (
    <div className="d-flex align-items-center gap-2">
      <span>Hello,&nbsp;{user.displayName ?? user.email}</span>
      <Button size="sm" variant="outline-secondary" onClick={logout}>
        Sign out
      </Button>
    </div>
  ) : (
    <Button
      onClick={googleLogin}
      className="d-flex align-items-center gap-2 rounded-pill google-btn"
    >
      <img
        src={googleLogo}
        alt="Google logo"
        className="google-icon"
      />
      Sign in with Google
    </Button>
  );
}
