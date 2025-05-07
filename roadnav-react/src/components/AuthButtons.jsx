// src/components/AuthButtons.jsx
import Button from 'react-bootstrap/Button';
import { useAuth } from '../contexts/AuthContext';

export default function AuthButtons() {     // ← default export
  const { user, googleLogin, logout } = useAuth();

  return user ? (
    <div className="d-flex align-items-center gap-2">
      <span>Hello,&nbsp;{user.displayName ?? user.email}</span>
      <Button size="sm" variant="outline-secondary" onClick={logout}>
        Sign out
      </Button>
    </div>
  ) : (
    <Button onClick={googleLogin}>Sign in with Google</Button>
  );
}
