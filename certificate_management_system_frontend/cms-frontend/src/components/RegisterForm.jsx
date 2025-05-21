import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../store/authSlice';

export default function RegisterForm() {
  const dispatch = useDispatch();
  const { loading, error, registerSuccess } = useSelector(state => state.auth);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error || registerSuccess) dispatch(clearAuthError());
  };

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <form className="p-4 border rounded bg-light" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
      <h3 className="mb-3">Sign Up</h3>
      <div className="mb-3">
        <label className="form-label">Username</label>
        <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {registerSuccess && <div className="alert alert-success">{registerSuccess}</div>}
      <button type="submit" className="btn btn-success w-100" disabled={loading}>
        {loading ? 'Registering...' : 'Sign Up'}
      </button>
    </form>
  );
}
