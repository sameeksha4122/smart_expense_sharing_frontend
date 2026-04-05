import { useEffect, useState } from "react";
import { getExpenses, getUsers } from "../services/api";
import { CheckCircle, Users, Wallet } from "lucide-react";

const Dashboard = () => {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSettlements, setTotalSettlements] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const expensesRes = await getExpenses();
        const expenses =
          expensesRes?.data || (Array.isArray(expensesRes) ? expensesRes : []);
        setTotalExpenses(expenses.length);

        const usersRes = await getUsers();
        const usersResData =
          usersRes?.data || (Array.isArray(usersRes) ? usersRes : []);
        setTotalUsers(usersResData.length);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="dashboard">
      <div className="header">
        <h1 className="header-title">Dashboard</h1>
      </div>
      <div
        className="card-grid"
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div
          className="summary-card"
          style={{
            flex: 1,
            minWidth: 220,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            padding: "2rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <div
            className="icon-box"
            style={{
              background: "rgba(168,85,247,0.1)",
              color: "#a855f7",
              borderRadius: "50%",
              padding: 16,
            }}
          >
            <Wallet size={32} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{totalExpenses}</div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Total Expenses
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>
              Number of expenses recorded
            </div>
          </div>
        </div>
        <div
          className="summary-card"
          style={{
            flex: 1,
            minWidth: 220,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            padding: "2rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <div
            className="icon-box"
            style={{
              background: "rgba(34,197,94,0.1)",
              color: "#22c55e",
              borderRadius: "50%",
              padding: 16,
            }}
          >
            <Users size={32} />
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{totalUsers}</div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Total Users
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>
              Number of people in group
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
