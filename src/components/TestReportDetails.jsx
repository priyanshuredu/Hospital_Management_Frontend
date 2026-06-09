// TestReportDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  FileText,
  Download,
  Calendar,
  User,
  Phone,
  Activity,
  Microscope,
  Hospital,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Printer,
  Eye,
  Loader,
  FileCheck,
  MapPin,
  CreditCard,
  Stethoscope,
  FileImage,
  DollarSign,
  FlaskConical,
  UserCheck,
  Award,
  Briefcase
} from 'lucide-react';
import '../styles/TestReportDetails.css';

const API_URL = 'https://hospital-management-backend-9u93.onrender.com';

const TestReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('Token');
      
      const response = await axios.get(`${API_URL}/test-report/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReport(response.data.testReport);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'in-progress':
        return 'status-progress';
      default:
        return '';
    }
  };

  const generatePDF = async () => {
    setGeneratingPDF(true);
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header with gradient effect
    doc.setFillColor(67, 97, 238);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Logo/Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSTIC REPORT', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Laboratory Test Results', pageWidth / 2, 32, { align: 'center' });
    
    // Report ID
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(9);
    doc.text(`Report ID: ${report._id}`, pageWidth - 20, 55, { align: 'right' });
    
    // Status Badge
    const statusColors = {
      completed: [16, 185, 129],
      pending: [245, 158, 11],
      'in-progress': [59, 130, 246]
    };
    const statusColor = statusColors[report.reportStatus] || [100, 100, 120];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(pageWidth - 35, 60, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(report.reportStatus.toUpperCase(), pageWidth - 20, 66, { align: 'center' });
    
    // Patient Information Section
    doc.setTextColor(67, 97, 238);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 20, 85);
    
    doc.setDrawColor(67, 97, 238);
    doc.setLineWidth(0.5);
    doc.line(20, 90, pageWidth - 20, 90);
    
    doc.setTextColor(60, 60, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const patientInfo = [
      [`Patient Name:`, report.appointment?.patientName || 'N/A'],
      [`Age / Gender:`, `${report.appointment?.patientAge || 'N/A'} yrs / ${report.appointment?.patientGender || 'N/A'}`],
      [`Phone Number:`, report.appointment?.patientPhone || 'N/A'],
      [`Doctor:`, report.appointment?.doctor?.doctor_name || 'N/A'],
      [`Appointment Date:`, formatDateTime(report.appointment?.appointmentDate)],
      [`Time Slot:`, report.appointment?.timeSlot || 'N/A']
    ];
    
    let yOffset = 100;
    patientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yOffset);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yOffset);
      yOffset += 8;
    });
    
    // Test Information Section
    yOffset += 10;
    doc.setTextColor(67, 97, 238);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TEST INFORMATION', 20, yOffset);
    
    yOffset += 5;
    doc.setDrawColor(67, 97, 238);
    doc.line(20, yOffset, pageWidth - 20, yOffset);
    
    yOffset += 8;
    doc.setTextColor(60, 60, 80);
    doc.setFontSize(10);
    
    const testInfo = [
      [`Test Name:`, report.test?.testName || 'N/A'],
      [`Test Fee:`, `₹${report.test?.fee || 'N/A'}`],
      [`Precautions:`, report.test?.precautions || 'None'],
      [`Status:`, report.test?.status || 'N/A']
    ];
    
    testInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yOffset);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yOffset);
      yOffset += 8;
    });
    
    // Report Details Section
    yOffset += 10;
    doc.setTextColor(67, 97, 238);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT DETAILS', 20, yOffset);
    
    yOffset += 5;
    doc.line(20, yOffset, pageWidth - 20, yOffset);
    
    yOffset += 8;
    doc.setTextColor(60, 60, 80);
    doc.setFontSize(10);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Generated:`, 20, yOffset);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDateTime(report.createdAt), 65, yOffset);
    
    yOffset += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`Last Updated:`, 20, yOffset);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDateTime(report.updatedAt), 65, yOffset);
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    doc.setTextColor(150, 150, 170);
    doc.setFontSize(8);
    doc.text('This is a computer-generated report and does not require a signature.', pageWidth / 2, footerY, { align: 'center' });
    doc.text('For any discrepancies, please contact the laboratory within 48 hours.', pageWidth / 2, footerY + 6, { align: 'center' });
    
    // Page number
    doc.text(`Page 1 of 1`, pageWidth / 2, footerY + 15, { align: 'center' });
    
    // Save PDF
    doc.save(`Test_Report_${report._id}.pdf`);
    setGeneratingPDF(false);
  };

  const handleDownloadReport = () => {
    if (report?.report) {
      window.open(report.report, '_blank');
    } else {
      alert('No report file available');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="test-report-details-container">
        <div className="loading-state">
          {/* <div className="loading-spinner"> */}
            <Loader size={48} className="spinner" />
          {/* </div> */}
          <p>Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-report-details-container">
        <div className="error-state">
          <AlertCircle size={64} className="error-icon" />
          <h2>Unable to Load Report</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="test-report-details-container">
        <div className="not-found-state">
          <FileText size={64} />
          <h2>Report Not Found</h2>
          <p>The requested test report could not be found.</p>
          <button onClick={() => navigate('/lab-tests')} className="btn-back">
            View All Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-report-details-container">
      {/* Header Actions */}
      <div className="report-actions">
        <button onClick={() => navigate(-1)} className="action-btn back-btn">
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="action-group">
          <button onClick={generatePDF} className="action-btn primary" disabled={generatingPDF}>
            {generatingPDF ? <Loader size={18} className="spinner" /> : <Download size={18} />}
            {generatingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Main Report Content */}
      <div id="report-content" className="report-content">
        {/* Header Section */}
        <div className="report-header">
          <div className="header-logo">
            <div className="logo-icon">
              <Microscope size={32} />
            </div>
            <div className="logo-text">
              <h1>Diagnostic Report</h1>
              <p>Laboratory Test Results</p>
            </div>
          </div>
          <div className="header-status">
            <div className={`status-badge ${getStatusClass(report.reportStatus)}`}>
              <CheckCircle size={16} />
              <span>{report.reportStatus?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Report ID */}
        <div className="report-id">
          <span>Report ID:</span>
          <strong>{report._id}</strong>
          <span className="report-date">| Generated: {formatDateTime(report.createdAt)}</span>
        </div>

        {/* Patient Information Card */}
        <div className="info-card patient-card">
          <div className="card-header">
            <User size={20} />
            <h3>Patient Information</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <div className="info-value">{report.appointment?.patientName || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Age / Gender</label>
                <div className="info-value">
                  {report.appointment?.patientAge || 'N/A'} yrs / {report.appointment?.patientGender || 'N/A'}
                </div>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <div className="info-value">{report.appointment?.patientPhone || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Consulting Doctor</label>
                <div className="info-value">
                  <Stethoscope size={14} />
                  {report.appointment?.doctor?.doctor_name || 'N/A'}
                </div>
              </div>
              <div className="info-item">
                <label>Appointment Date</label>
                <div className="info-value">
                  <Calendar size={14} />
                  {formatDate(report.appointment?.appointmentDate)}
                </div>
              </div>
              <div className="info-item">
                <label>Time Slot</label>
                <div className="info-value">
                  <Clock size={14} />
                  {report.appointment?.timeSlot || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Information Card */}
        <div className="info-card test-card">
          <div className="card-header">
            <FlaskConical size={20} />
            <h3>Test Information</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <label>Test Name</label>
                <div className="info-value highlight">{report.test?.testName || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Test Fee</label>
                <div className="info-value">
                  <DollarSign size={14} />
                  ₹{report.test?.fee || 'N/A'}
                </div>
              </div>
              <div className="info-item full-width">
                <label>Precautions</label>
                <div className="info-value precautions">
                  <AlertCircle size={14} />
                  {report.test?.precautions || 'No specific precautions'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Details Card */}
        <div className="info-card report-card">
          <div className="card-header">
            <FileCheck size={20} />
            <h3>Report Details</h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <label>Report Status</label>
                <div className={`status-value ${getStatusClass(report.reportStatus)}`}>
                  {report.reportStatus}
                </div>
              </div>
              <div className="info-item">
                <label>Report Generated</label>
                <div className="info-value">{formatDateTime(report.createdAt)}</div>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <div className="info-value">{formatDateTime(report.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Report File Preview */}
        {report.report && (
          <div className="report-file-section">
            <div className="card-header">
              <FileImage size={20} />
              <h3>Test Report Document</h3>
            </div>
            <div className="file-preview-card">
              {report.report.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <>
                  <div className="image-preview">
                    <img 
                      src={report.report} 
                      alt="Test Report" 
                      onClick={() => setShowImageModal(true)}
                    />
                    <button 
                      className="expand-btn"
                      onClick={() => setShowImageModal(true)}
                    >
                      <Eye size={16} />
                      View Full Image
                    </button>
                  </div>
                </>
              ) : (
                <div className="file-info">
                  <FileText size={48} />
                  <p>Report document available for download</p>
                  <button onClick={handleDownloadReport} className="download-file-btn">
                    <Download size={16} />
                    Download Report File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="report-footer">
          <div className="footer-note">
            <p>This is a computer-generated report and does not require a signature.</p>
            <p className="footer-small">For any discrepancies, please contact the laboratory within 48 hours.</p>
          </div>
          <div className="footer-stamp">
            <div className="stamp">APPROVED</div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>Test Report Image</h3>
              <button className="close-modal" onClick={() => setShowImageModal(false)}>
                ✕
              </button>
            </div>
            <div className="image-modal-body">
              <img src={report.report} alt="Full Report" />
            </div>
            <div className="image-modal-footer">
              <button onClick={handleDownloadReport} className="btn-primary">
                <Download size={16} />
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestReportDetails;