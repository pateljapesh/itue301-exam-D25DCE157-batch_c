import React from 'react';

/**
 * Task 1: AppointmentCard Component
 * Accepts 5 required props: patientName, doctorName, date, timeSlot, status
 * Dynamically changes appearance based on status: 'confirmed', 'pending', 'cancelled'
 */
const AppointmentCard = ({ patientName, doctorName, date, timeSlot, status = 'pending', reason }) => {
  // Normalize status string for safe class lookup
  const normalizedStatus = (status || 'pending').toLowerCase();

  // Status icon/symbol map
  const getStatusIcon = (st) => {
    switch (st) {
      case 'confirmed':
        return '✓';
      case 'cancelled':
        return '✕';
      case 'pending':
      default:
        return '⏳';
    }
  };

  return (
    <div className="appointment-card">
      <div className="card-header">
        <div className="patient-info">
          <span className="label">Patient</span>
          <h3>{patientName || 'Anonymous Patient'}</h3>
        </div>
        {/* Dynamic status badge using status-specific CSS class */}
        <span className={`status-badge ${normalizedStatus}`}>
          <span>{getStatusIcon(normalizedStatus)}</span>
          <span>{status || 'pending'}</span>
        </span>
      </div>

      <div className="card-body-details">
        <div className="detail-row">
          <span className="detail-label">Doctor:</span>
          <span className="detail-value">{doctorName || 'Not Assigned'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{date || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Time Slot:</span>
          <span className="detail-value">{timeSlot || 'N/A'}</span>
        </div>
      </div>

      {reason && (
        <div className="card-footer-reason">
          <strong>Note:</strong> <span>{reason}</span>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
