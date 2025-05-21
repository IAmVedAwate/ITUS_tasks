import CertificateResultCard from '../components/CertificateResultCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function CertificatePrintPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const certificate = location.state?.certificate;
  const printRef = useRef();

  useEffect(() => {
    if (!certificate) {
      navigate('/viewer');
    }
  }, [certificate, navigate]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Certificate Print</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">');
    printWindow.document.write('</head><body style="background:#fff;">');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!certificate) return null;

  return (
    <div className="bg-white" style={{ minHeight: '100vh', padding: 0 }}>
      <div className="d-print-none text-center py-3">
        <button className="btn btn-success" onClick={handlePrint}>
          Print Certificate
        </button>
      </div>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
        <div style={{ width: '100%', maxWidth: 900, boxShadow: '0 0 24px #bbb', background: '#fff', borderRadius: 16, padding: 0 }}>
          <div ref={printRef}>
            <CertificateResultCard certificate={certificate} />
          </div>
        </div>
      </div>
    </div>
  );
}
