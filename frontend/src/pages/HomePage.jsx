import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';

/**
 * Task 1 & 2: HomePage Component
 * Displays system overview, quick action buttons, and sample appointment cards
 * using the reusable AppointmentCard component with props.
 */
const HomePage = () => {
  // Sample appointments demonstrating AppointmentCard props passing & status variants
  const [recentAppointments, setRecentAppointments] = useState([
    {
      id: 1,
      patientName: 'Sarah Connor',
      doctorName: 'Dr. Sarah Jenkins (Cardiology)',
      date: '2026-08-25',
      timeSlot: '10:00 AM',
      status: 'confirmed',
      reason: 'Routine cardiac health review',
    },
    {
      id: 2,
      patientName: 'Alex Morgan',
      doctorName: 'Dr. Michael Chen (Neurology)',
      date: '2026-08-26',
      timeSlot: '02:30 PM',
      status: 'pending',
      reason: 'Persistent migraines consultation',
    },
    {
      id: 3,
      patientName: 'David Miller',
      doctorName: 'Dr. James Wilson (Orthopedics)',
      date: '2026-08-27',
      timeSlot: '11:15 AM',
      status: 'cancelled',
      reason: 'Knee ligament follow-up (rescheduled)',
    },
  ]);

  // Fetch latest appointments from backend if available
  useEffect(() => {
    fetch('/api/v1/appointments')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.data && json.data.length > 0) {
          setRecentAppointments(json.data);
        }
      })
      .catch(() => {
        // Fallback to initial mock data if backend not reachable yet
      });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-card">
        <span className="hero-badge">MedCare Plus Hospital System</span>
        <h1>Modern Healthcare Appointment Management</h1>
        <p>
          Seamlessly connect patients with specialist doctors. Manage schedules, book
          consultations, and track appointment statuses in real time.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn btn-primary">
            Book an Appointment Now &rarr;
          </Link>
          <Link to="/doctors" className="btn btn-outline">
            View Specialist Doctors
          </Link>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🩺</div>
          <div className="stat-info">
            <h3>5+</h3>
            <p>Specialist Doctors</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald">📋</div>
          <div className="stat-info">
            <h3>24/7</h3>
            <p>Online Booking</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⚡</div>
          <div className="stat-info">
            <h3>Instant</h3>
            <p>Status Updates</p>
          </div>
        </div>
      </section>

      {/* Task 1 Component Architecture Showcase */}
      <section className="appointments-section">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <h2>Current Appointments</h2>
          <p>Live overview of scheduled patient appointments and their statuses</p>
        </div>

        <div className="grid-cards">
          {recentAppointments.map((app) => (
            /* Task 1: Reusable AppointmentCard accepting props: patientName, doctorName, date, timeSlot, status */
            <AppointmentCard
              key={app.id || app._id || Math.random()}
              patientName={app.patientName}
              doctorName={app.doctorName}
              date={app.date}
              timeSlot={app.timeSlot}
              status={app.status}
              reason={app.reason}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
