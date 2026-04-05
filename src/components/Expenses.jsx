import { useState, useEffect } from "react";
import { getExpenses } from "../services/api";
import ExpenseModal from "./ExpenseModal";
import { Plus, Coffee, Trash2 } from "lucide-react";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();
      if (response?.data) setExpenses(response.data);
    } catch (error) {
      console.error("Failed to get expenses", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(
        `https://smart-expense-sharing-backened.onrender.com/expenses/${id}`,
        { method: "DELETE" },
      );
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  return (
    <div className="expenses">
      <div className="header">
        <h1 className="header-title">Expenses</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="glass-panel" style={{ marginTop: "2rem" }}>
        <div className="list-container">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense._id || Math.random()} className="list-item">
                <div className="icon-box">
                  <Coffee size={24} />
                </div>
                <div className="item-details">
                  <div className="title">{expense.description}</div>
                  <div className="date">
                    Paid by{" "}
                    {expense.payer?.email ||
                      expense.payer ||
                      expense.paidBy ||
                      "Someone"}{" "}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    className="item-amount"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ₹{expense.totalAmount || expense.amount || 0}
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ padding: "0.4rem", borderColor: "transparent" }}
                    onClick={() => handleDelete(expense._id)}
                  >
                    <Trash2 size={20} color="var(--danger)" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>
              No expenses recorded yet.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ExpenseModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchExpenses();
          }}
        />
      )}
    </div>
  );
};

export default Expenses;
