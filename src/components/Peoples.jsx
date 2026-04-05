import { useState, useEffect } from "react";
import { getUsers } from "../services/api";
import AddUserModal from "./AddUserModal";
import { Plus, User, Trash2 } from "lucide-react";

const Peoples = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsersList = async () => {
    try {
      const response = await getUsers();
      if (response?.data) setUsers(response.data);
      else if (Array.isArray(response)) setUsers(response);
    } catch (error) {
      console.error("Failed to get users", error);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(
        `https://smart-expense-sharing-backened.onrender.com/users/${id}`,
        { method: "DELETE" },
      );
      fetchUsersList();
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <div className="peoples">
      <div className="header">
        <h1 className="header-title">Peoples</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add Person
        </button>
      </div>

      <div className="glass-panel" style={{ marginTop: "2rem" }}>
        <div className="list-container">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user._id || Math.random()} className="list-item">
                <div className="icon-box">
                  <User size={24} />
                </div>
                <div className="item-details">
                  <div className="title">
                    {user.name || user.email || "Unknown"}
                  </div>
                  <div className="date">
                    {user.email || "No email provided"}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <button
                    className="btn-secondary"
                    style={{ padding: "0.4rem", borderColor: "transparent" }}
                    onClick={() => handleDelete(user._id)}
                  >
                    <Trash2 size={20} color="var(--danger)" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>
              No people added yet.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddUserModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchUsersList();
          }}
        />
      )}
    </div>
  );
};

export default Peoples;
