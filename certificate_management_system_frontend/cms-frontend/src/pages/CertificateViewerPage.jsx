import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CertificateResultCard from '../components/CertificateResultCard';

export default function CertificateViewerPage() {
  const [id, setId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useSelector(state => state.auth.token);
  const navigate = useNavigate();

  const handleFetch = async (e) => {
    e.preventDefault();
    setError('');
    setCertificate(null);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/certificates/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Not found');
      setCertificate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <form className="p-4 border rounded bg-light" style={{ maxWidth: 500, margin: '0 auto' }} onSubmit={handleFetch}>
        <h3 className="mb-3">View Certificate</h3>
        <div className="mb-3">
          <label className="form-label">Certificate ID</label>
          <input type="text" className="form-control" value={id} onChange={e => setId(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'View'}
        </button>
      </form>
      <CertificateResultCard certificate={certificate} />
      {certificate && (
        <div className="text-center mt-3">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/print', { state: { certificate } })}>
            Print Preview
          </button>
        </div>
      )}
    </div>
  );
}
