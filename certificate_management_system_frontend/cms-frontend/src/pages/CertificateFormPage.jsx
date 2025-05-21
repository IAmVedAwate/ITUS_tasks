import { useState } from 'react';
import CertificateForm from '../components/CertificateForm';
import CertificateResultCard from '../components/CertificateResultCard';

export default function CertificateFormPage() {
  const [certificate, setCertificate] = useState(null);
  return (
    <div className="container py-5">
      <CertificateForm onResult={setCertificate} />
      <CertificateResultCard certificate={certificate} />
    </div>
  );
}
