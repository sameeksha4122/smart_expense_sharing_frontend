import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Users, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Wallet size={32} color="#a855f7" />
        SplitSmart
      </div>
      <nav className="nav-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={20} />
          Expenses
        </NavLink>
        <NavLink to="/peoples" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          Peoples
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
