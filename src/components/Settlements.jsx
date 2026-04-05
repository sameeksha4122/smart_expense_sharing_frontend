import { useEffect, useState } from "react";
import { getSettlements } from "../services/api";
import { CheckCircle } from "lucide-react";

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const res = await getSettlements();
        if (res?.data) setSettlements(res.data);
        else if (Array.isArray(res)) setSettlements(res);
      } catch (error) {
        console.error("Failed to fetch settlements", error);
      }
    };
    fetchSettlements();
  }, []);

  return (
    <div className="settlements">
      <div className="header">
        <h1 className="header-title">Settlements</h1>
      </div>
      <div className="glass-panel" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
          Optimized Settlements
        </h3>
        {settlements && settlements.length > 0 ? (
          <div className="list-container">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="list-item"
                style={{ borderLeft: "4px solid var(--success)" }}
              >
                <div
                  className="icon-box"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "var(--success)",
                  }}
                >
                  <CheckCircle size={24} />
                </div>
                <div className="item-details">
                  <div className="title">{s}</div>
                  <div className="date">Optimized Transaction</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>
            No settlements needed right now.
          </p>
        )}
      </div>
    </div>
  );
};

export default Settlements;
