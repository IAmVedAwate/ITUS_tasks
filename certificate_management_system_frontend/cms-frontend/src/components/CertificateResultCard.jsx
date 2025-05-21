export default function CertificateResultCard({ certificate }) {
  if (!certificate) return null;
  return (
    <div className="container-fluid p-5" style={{ background: '#f8f9fa', borderRadius: 16, maxWidth: 900, margin: '2rem auto' }}>
      <div className="text-center mb-4">
        <img src={'../cms_logo.jpg'} alt="Rescue Team Logo" width="120" style={{ borderRadius: 12, boxShadow: '0 2px 8px #bbb' }} />
      </div>
      <p className="text-uppercase text-muted fw-semibold mb-2" style={{ letterSpacing: 2 }}>Certificate of Completion</p>
      <div className="certificate-title text-dark mb-2" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.4, textAlign: 'left' }}>
        {certificate.trainingType} Training<br />
        <span style={{ fontSize: '1.5rem', fontWeight: 400 }}>for Disaster Management Rescue Team</span>
      </div>
      <div className="certificate-subtitle mt-3 mb-4" style={{ fontSize: '1.2rem', color: '#555' }}>
        Trainer: <strong>{certificate.trainerName}</strong> &nbsp;|&nbsp; Batch: <strong>{certificate.batchNumber}</strong>
      </div>
      <div className="row justify-content-center mb-3">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">Awarded to</h5>
              <h3 className="fw-bold text-primary mb-1">{certificate.traineeName}</h3>
              <p className="mb-2"><b>Trainee ID:</b> {certificate.traineeId}</p>
              <p className="mb-2"><b>Issue Date:</b> {certificate.issueDate?.slice(0,10)}</p>
              <p className="mb-2"><b>Remarks:</b> {certificate.remarks || <span className="text-muted">None</span>}</p>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Certificate ID: {certificate._id}</span>
                <span className="text-muted small">v{certificate.__v}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
