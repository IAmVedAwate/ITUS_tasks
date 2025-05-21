import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../store/authSlice';

export default function LoginForm() {
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector(state => state.auth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    dispatch(loginUser(form));
  };

  return (
    <form className="p-4 border rounded bg-light" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
      <h3 className="mb-3">Login</h3>
      <div className="mb-3">
        <label className="form-label">Username</label>
        <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
      </div>
      {error && submitted && <div className="alert alert-danger">{error}</div>}
      {token && submitted && !loading && <div className="alert alert-success">Login successful!</div>}
      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
