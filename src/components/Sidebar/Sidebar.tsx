import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/workflows">Workflows</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
