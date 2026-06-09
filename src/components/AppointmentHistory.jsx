import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AppointmentHistory.css';

const AppointmentHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, [page]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('Token');
            const response = await axios.get(
                `http://localhost:5000/appointment/history?page=${page}&limit=5`,
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            setAppointments(response.data.appointments || []);
            setTotalPages(response.data.totalPage || 1);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (appointmentId) => {
        navigate(`/appointment/${appointmentId}`);
    };

    const getStatusBadgeClass = (attended) => {
        return attended ? 'status-attended' : 'status-missed';
    };

    const getStatusIcon = (attended) => {
        return attended ? '✅' : '❌';
    };

    const getStatusText = (attended) => {
        return attended ? 'ATTENDED' : 'MISSED';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredAppointments = appointments.filter(appointment => 
        filterStatus === 'all' 
            ? true 
            : filterStatus === 'attended' 
                ? appointment.appointmentAttended 
                : !appointment.appointmentAttended
    );

    const stats = {
        total: appointments.length,
        attended: appointments.filter(a => a.appointmentAttended).length,
        missed: appointments.filter(a => !a.appointmentAttended).length
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading appointment history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Error Loading Appointments</h3>
                <p>{error.message}</p>
                <button onClick={fetchAppointments} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="appointment-history">
            <button className='back-btn' onClick={() => navigate(-1)}>← Back</button>
            
            <div className="header">
                <h1>📅 Appointment History</h1>
                <p>View and manage all your past appointments</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Appointments</div>
                </div>
                <div className="stat-card attended">
                    <div className="stat-value">{stats.attended}</div>
                    <div className="stat-label">Attended</div>
                </div>
                <div className="stat-card missed">
                    <div className="stat-value">{stats.missed}</div>
                    <div className="stat-label">Missed</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <button 
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    All ({stats.total})
                </button>
                <button 
                    className={`filter-btn ${filterStatus === 'attended' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('attended')}
                >
                    ✅ Attended ({stats.attended})
                </button>
                <button 
                    className={`filter-btn ${filterStatus === 'missed' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('missed')}
                >
                    ❌ Missed ({stats.missed})
                </button>
            </div>

            {/* Appointments List - TABLE VIEW */}
            {filteredAppointments.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No Appointments Found</h3>
                    <p>You don't have any {filterStatus !== 'all' ? filterStatus : ''} appointments.</p>
                    <button onClick={() => navigate('/book-appointment')} className="book-btn">
                        Book New Appointment →
                    </button>
                </div>
            ) : (
                <>
                    <div className="appointments-table-container">
                        <table className="appointments-table">
                            <thead>
                                <tr>
                                    <th>Patient Name</th>
                                    <th>Date & Time</th>
                                    <th>Gender</th>
                                    <th>Age</th>
                                    <th>Phone</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment._id} >
                                        <td className="patient-name">
                                            <p style={{color: 'black'}}>{appointment.patientName}</p>
                                        </td>
                                        <td >
                                            <div>{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                                            <div className="time-slot">{appointment.timeSlot}</div>
                                        </td>
                                        <td>
                                            <span className="gender-badge">
                                                {appointment.patientGender === 'male' ? '👨 Male' : '👩 Female'}
                                            </span>
                                        </td>
                                        <td>{appointment.patientAge} yrs</td>
                                        <td>{appointment.patientPhone}</td>
                                        <td className="fee">₹{appointment.fee}</td>
                                        <td>
                                            <div className={`status-badge ${getStatusBadgeClass(appointment.appointmentAttended)}`}>
                                                {getStatusIcon(appointment.appointmentAttended)} {getStatusText(appointment.appointmentAttended)}
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleViewDetails(appointment._id)}
                                                className="view-btn"
                                            >
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button 
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="pagination-btn"
                            >
                                ◀ Previous
                            </button>
                            
                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="pagination-btn"
                            >
                                Next ▶
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AppointmentHistory;