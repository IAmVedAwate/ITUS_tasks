import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import CertificateFormPage from './pages/CertificateFormPage';
import CertificateViewerPage from './pages/CertificateViewerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CertificatePrintPage from './pages/CertificatePrintPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/form">Rescue Certificate CMS</Link>
          <div>
            <Link className="nav-link d-inline-block text-white" to="/form">Add Certificate</Link>
            <Link className="nav-link d-inline-block text-white ms-3" to="/viewer">View Certificate</Link>
            <Link className="nav-link d-inline-block text-white ms-3" to="/login">Login</Link>
            <Link className="nav-link d-inline-block text-white ms-3" to="/register">Sign Up</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/form" element={<CertificateFormPage />} />
        <Route path="/viewer" element={<CertificateViewerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/print" element={<CertificatePrintPage />} />
        <Route path="*" element={<Navigate to="/form" />} />
      </Routes>
    </BrowserRouter>
  );
}
