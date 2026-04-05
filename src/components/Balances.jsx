import { useEffect, useState } from "react";
import { getBalances } from "../services/api";
import { DollarSign, IndianRupee } from "lucide-react";

const Balances = () => {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const res = await getBalances();
        if (res?.data) setBalances(res.data);
        else if (Array.isArray(res)) setBalances(res);
      } catch (error) {
        console.error("Failed to fetch balances", error);
      }
    };
    fetchBalances();
  }, []);
  return (
    <div className="balances">
      <div className="header">
        <h1 className="header-title">Balances</h1>
      </div>
      <div className="glass-panel" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
          Net Balances
        </h3>
        {Array.isArray(balances) && balances.length > 0 ? (
          <div className="list-container">
            {balances.map((b, i) => (
              <div key={i} className="list-item">
                <div className="icon-box">
                  <IndianRupee size={24} />
                </div>
                <div className="item-details">
                  <div className="title">{b}</div>
                </div>
              </div>
            ))}
          </div>
        ) : Array.isArray(balances?.balances) &&
          balances.balances.length > 0 ? (
          <div className="list-container">
            {balances.balances.map((b, i) => (
              <div key={i} className="list-item">
                <div className="icon-box">
                  <IndianRupee size={24} />
                </div>
                <div className="item-details">
                  <div className="title">{b}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>
            No active balances found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Balances;
