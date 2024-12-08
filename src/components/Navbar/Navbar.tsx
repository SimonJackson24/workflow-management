import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Workflow Management</Link>
      {/* Add navigation items */}
    </nav>
  );
};

export default Navbar;
