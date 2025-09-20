import React, { useState } from 'react';
import SunbeltIcon from '../SunbeltIcon';
import { getAllUserConfigs } from '../users';

// Get users from configuration files
const userConfigs = getAllUserConfigs();
const USERS = Object.values(userConfigs).map(config => ({
  username: config.username,
  password: config.password,
  portal: config.portal,
}));

export type User = typeof USERS[number];

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <SunbeltIcon style={{ height: 64, width: 64, marginBottom: 16 }} />
      <h2>Login to Sunbelt</h2>
      <form onSubmit={handleSubmit} style={{ minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: 8, fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 8, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: 10, fontSize: 16, background: 'var(--sunbelt-blue)', color: 'white', border: 'none', borderRadius: 4 }}>
          Login
        </button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
};

export default Login;
