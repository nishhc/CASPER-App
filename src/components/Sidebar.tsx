import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Trophy, Hammer } from "lucide-react";
import "./sidebar.css";
import { NavLink } from "react-router-dom";

type SidebarProps = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
};

function Sidebar({ isVisible, setIsVisible }: SidebarProps) {
  return (
    <div className="sidebar-container">
      <motion.aside
        className="assay-sidebar"
        initial={{ x: -350 }}
        animate={{ x: isVisible ? 0 : -350 }}
        transition={{ duration: 0.1, ease: "easeInOut" }}
        style={{ position: isVisible ? "fixed" : "absolute" }}
      >
        <div className="brand">
          <div className="brand-row">
            <span className="brand-letter">C A S P E R</span>
          </div>
          <small className="brand-sub">
            Integrated RPA + CRISPR-Cas12 Assay Designer
          </small>
        </div>

        {SidebarIcons()}
        {isVisible && (
          <div className="hide-sidebar-btn-container">
            <button className="sidebar-btn" onClick={() => setIsVisible(false)}>
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </motion.aside>

      {!isVisible && (
        <div className="show-sidebar-btn-container">
          <button className="sidebar-btn" onClick={() => setIsVisible(true)}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;

function SidebarIcons() {
  return (
    <div className="pg-icons">
      <NavLink to="/" className="pageLink">
        <Home className="pageIcon" size={20} />
        <span className="nav-text">Home</span>
      </NavLink>
      <NavLink to="/assay" className="pageLink">
        <Hammer className="pageIcon" size={20} />
        <span className="nav-text">Generate Sets</span>
      </NavLink>
      <NavLink to="/rank" className="pageLink">
        <Trophy className="pageIcon" size={20} />
        <span className="nav-text">Evaluate Sets</span>
      </NavLink>
    </div>
  );
}
