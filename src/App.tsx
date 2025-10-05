import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import AssayDesignerPage from "./AssayDesignerPage";
import AssayRankPage from "./AssayRankPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assay" element={<AssayDesignerPage />} />
        <Route path="/rank" element={<AssayRankPage />} />
      </Routes>
    </Router>
  );
}
