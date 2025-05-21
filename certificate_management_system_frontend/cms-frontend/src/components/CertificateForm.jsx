import { useState } from 'react';
import { useSelector } from 'react-redux';

const initialState = {
  traineeName: '',
  traineeId: '',
  trainingType: '',
  trainerName: '',
  issueDate: '',
  batchNumber: '',
  remarks: '',
};

export default function CertificateForm({ onResult }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = useSelector(state => state.auth.token);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const { traineeName, traineeId, trainingType, trainerName, issueDate, batchNumber, remarks } = form;

  const validate = () => {
    if (!traineeName || !trainingType || !trainerName || !issueDate || !traineeId || !batchNumber) {
      setError('All fields except remarks are required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:3000/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add certificate');
      setSuccess('Certificate added successfully!');
      setForm(initialState);
      if (onResult) onResult(data.certificate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="p-4 border rounded bg-light" onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
      <h3 className="mb-3">Add Rescue Trainee Certificate</h3>
      <div className="mb-3">
        <label className="form-label">Trainee Name</label>
        <input type="text" className="form-control" name="traineeName" value={traineeName} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Trainee ID</label>
        <input type="text" className="form-control" name="traineeId" value={traineeId} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Training Type</label>
        <input type="text" className="form-control" name="trainingType" value={trainingType} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Trainer Name</label>
        <input type="text" className="form-control" name="trainerName" value={trainerName} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Issue Date</label>
        <input type="date" className="form-control" name="issueDate" value={issueDate} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Batch Number</label>
        <input type="text" className="form-control" name="batchNumber" value={batchNumber} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Remarks</label>
        <textarea className="form-control" name="remarks" value={remarks} onChange={handleChange} />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
