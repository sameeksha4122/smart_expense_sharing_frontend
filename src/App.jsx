import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Expenses from "./components/Expenses";
import Peoples from "./components/Peoples";
import Balances from "./components/Balances";
import Settlements from "./components/Settlements";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/peoples" element={<Peoples />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
