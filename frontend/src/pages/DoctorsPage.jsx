import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Task 4: DoctorsPage Component - REST API Consumption in React
 * - Consumes GET /api/v1/doctors using asynchronous fetch
 * - Fires API request on mount with useEffect()
 * - Maintains 3 distinct states: data, loading, error
 * - Displays loading indicator, error handling with retry, and doctor details (name, specialisation, availability)
 */
const DoctorsPage = () => {
  // Task 4: Maintain three states: data, loading and error
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Asynchronous fetch function to retrieve doctors from Express API
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/doctors');

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status} (${response.statusText})`);
      }

      const result = await response.json();

      // Extract array from response payload
      const doctorsList = Array.isArray(result) ? result : result.data || [];
      setData(doctorsList);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Failed to fetch doctor information. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Task 4: useEffect so API request is made when component is mounted
  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1>Our Medical Specialists</h1>
        <p>Browse our team of certified doctors and check their live availability.</p>
      </div>

      {/* 1. Display loading message/indicator while request is in progress */}
      {loading && (
        <div className="state-box">
          <div className="spinner"></div>
          <h3>Loading Specialists...</h3>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving doctor data from REST API endpoint...</p>
        </div>
      )}

      {/* 2. Display error message if the request fails */}
      {!loading && error && (
        <div className="error-banner">
          <div>
            <strong>Error Loading Data:</strong> {error}
          </div>
          <button onClick={fetchDoctors} className="btn btn-secondary btn-sm">
            Try Again
          </button>
        </div>
      )}

      {/* 3. Display doctor data after a successful request */}
      {!loading && !error && data.length === 0 && (
        <div className="state-box">
          <h3>No doctors found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No specialist records were returned by the API.</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid-cards">
          {data.map((doctor) => {
            const isAvailable = doctor.available === true || doctor.available === 'true';
            return (
              <div key={doctor.id || doctor._id} className="doctor-card">
                <div>
                  <div className="doctor-card-top">
                    <div className="doctor-avatar">
                      {doctor.name ? doctor.name.replace('Dr. ', '').charAt(0) : 'D'}
                    </div>
                    <div className="doctor-title">
                      {/* Doctor Name */}
                      <h3>{doctor.name}</h3>
                      {/* Specialisation */}
                      <span className="specialty-tag">{doctor.specialisation}</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                    <span className="availability-dot"></span>
                    <span>{isAvailable ? 'Available Today' : 'Unavailable'}</span>
                  </div>

                  {doctor.email && (
                    <div className="doctor-email">
                      <span>✉ {doctor.email}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <Link
                    to={`/booking?doctor=${encodeURIComponent(doctor.name)}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Book with {doctor.name ? doctor.name.split(' ')[1] || doctor.name : 'Doctor'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
