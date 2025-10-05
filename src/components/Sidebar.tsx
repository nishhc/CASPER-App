import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

        <nav className="side-nav">
          <div className="side-group">
            <span className="side-heading">Designs</span>
          </div>
          <div className="side-divider" />
          <div className="side-group">
            <span className="side-heading">Rankings</span>
          </div>
        </nav>

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