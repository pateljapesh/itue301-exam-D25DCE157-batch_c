import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Task 2: Navigation Component
 * Contains React Router Links/NavLinks to all three routes without full-page reloads.
 */
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand-logo">
          <div className="brand-icon">+</div>
          <span>MedCare Plus</span>
        </NavLink>

        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/doctors"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Doctors
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/booking"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Book Appointment
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
