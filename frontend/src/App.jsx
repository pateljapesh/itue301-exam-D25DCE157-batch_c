import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import BookingPage from './pages/BookingPage';

/**
 * Task 2: React Router Configuration
 * Routes:
 *  - /        -> HomePage
 *  - /doctors -> DoctorsPage
 *  - /booking -> BookingPage
 */
function App() {
  return (
    <div className="app-container">
      {/* Navigation Component with links to all 3 routes */}
      <Navbar />

      {/* Main Page Routing Container */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </main>

      {/* Modern Footer */}
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} MedCare Plus Hospital System. ITUE301 Advanced Web Development Frameworks Practical Exam.
        </p>
      </footer>
    </div>
  );
}

export default App;
