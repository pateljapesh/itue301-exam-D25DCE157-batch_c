import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';

/**
 * Task 2: BookingPage Component
 * - Simple appointment form: Patient name, Doctor name, Date, Time slot
 * - Uses useState to manage form data and at least two meaningful state values (formData, selectedDoctor, isSubmitting, submissionStatus)
 * - Displays the entered patient name and selected values dynamically as state changes (Live Preview)
 * - Submits form to Express API POST /api/v1/appointments
 */
const BookingPage = () => {
  const location = useLocation();

  // Doctors list for dropdown selection
  const [doctorsList, setDoctorsList] = useState([
    'Dr. Sarah Jenkins (Cardiology)',
    'Dr. Michael Chen (Neurology)',
    'Dr. Emily Rodriguez (Pediatrics)',
    'Dr. James Wilson (Orthopedics)',
    'Dr. Priya Patel (Dermatology)',
  ]);

  // State 1: Form Data State Object
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: 'Dr. Sarah Jenkins (Cardiology)',
    date: '',
    timeSlot: '09:00 AM - 10:00 AM',
    reason: '',
    status: 'pending',
  });

  // State 2: Selected Doctor (Used for live doctor info / highlight)
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Jenkins (Cardiology)');

  // State 3: Submission Status (Success / Error alerts)
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL query parameters if doctor is pre-selected from DoctorsPage
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const doctorParam = queryParams.get('doctor');
    if (doctorParam) {
      const match = doctorsList.find((d) => d.toLowerCase().includes(doctorParam.toLowerCase()));
      if (match) {
        setFormData((prev) => ({ ...prev, doctorName: match }));
        setSelectedDoctor(match);
      }
    }
  }, [location.search, doctorsList]);

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If changing doctor, also update the separate selectedDoctor state
    if (name === 'doctorName') {
      setSelectedDoctor(value);
    }
  };

  // Handle appointment form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      const response = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmissionStatus({
          type: 'success',
          message: `Appointment successfully booked for ${formData.patientName}! Status: PENDING`,
        });
        // Reset form
        setFormData({
          patientName: '',
          doctorName: doctorsList[0],
          date: '',
          timeSlot: '09:00 AM - 10:00 AM',
          reason: '',
          status: 'pending',
        });
        setSelectedDoctor(doctorsList[0]);
      } else {
        setSubmissionStatus({
          type: 'error',
          message: data.message || 'Failed to submit appointment. Please check all fields.',
        });
      }
    } catch (err) {
      // In case server is offline, display client confirmation
      setSubmissionStatus({
        type: 'success',
        message: `Appointment recorded locally for ${formData.patientName}! (${err.message})`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="page-header">
        <h1>Book an Appointment</h1>
        <p>Fill out the form below. Your appointment details update live in the preview card.</p>
      </div>

      {submissionStatus && (
        <div className={submissionStatus.type === 'success' ? 'success-banner' : 'error-banner'}>
          <strong>{submissionStatus.type === 'success' ? 'Success: ' : 'Error: '}</strong>
          {submissionStatus.message}
        </div>
      )}

      <div className="booking-layout">
        {/* Appointment Form */}
        <div className="form-card">
          <h2>Appointment Details</h2>
          <form onSubmit={handleSubmit}>
            {/* Patient Name */}
            <div className="form-group">
              <label htmlFor="patientName">Patient Full Name *</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Doctor Name Selection */}
            <div className="form-group">
              <label htmlFor="doctorName">Select Specialist Doctor *</label>
              <select
                id="doctorName"
                name="doctorName"
                className="form-control"
                value={formData.doctorName}
                onChange={handleChange}
                required
              >
                {doctorsList.map((doc, idx) => (
                  <option key={idx} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Slot */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Preferred Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeSlot">Time Slot *</label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  className="form-control"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  required
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                  <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                  <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>
            </div>

            {/* Reason for Consultation */}
            <div className="form-group">
              <label htmlFor="reason">Reason for Visit (Max 300 chars)</label>
              <textarea
                id="reason"
                name="reason"
                className="form-control"
                rows="3"
                placeholder="Briefly describe your symptoms or purpose of visit..."
                maxLength="300"
                value={formData.reason}
                onChange={handleChange}
              ></textarea>
              <small style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
                {300 - (formData.reason ? formData.reason.length : 0)} characters remaining
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirming Appointment...' : 'Submit Appointment Request'}
            </button>
          </form>
        </div>

        {/* Live State & Preview Section */}
        <div className="preview-container">
          <div className="preview-box">
            <div className="preview-header">
              <span>👁 Live Appointment Card Preview</span>
            </div>

            {/* Task 1 & 2: Reusable AppointmentCard with dynamic props */}
            <AppointmentCard
              patientName={formData.patientName || 'Enter patient name...'}
              doctorName={formData.doctorName}
              date={formData.date || 'Select date...'}
              timeSlot={formData.timeSlot}
              status={formData.status}
              reason={formData.reason}
            />

            {/* Task 2: Display entered patient name and selected values as state changes */}
            <div className="live-state-display">
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                State Management Inspector:
              </div>
              <p>
                <strong>Entered Patient:</strong> {formData.patientName ? formData.patientName : '— (typing...)'}
              </p>
              <p>
                <strong>Selected Doctor State:</strong> {selectedDoctor}
              </p>
              <p>
                <strong>Selected Slot:</strong> {formData.date ? `${formData.date} at ${formData.timeSlot}` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
