import { useState, useEffect } from 'react';
import { createExpense, getUsers } from '../services/api';
import { X } from 'lucide-react';

const ExpenseModal = ({ onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [users, setUsers] = useState([]);
  const [participantsData, setParticipantsData] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        if (response?.data) {
          setUsers(response.data);
          const initialParticipants = {};
          response.data.forEach(u => {
            initialParticipants[u._id] = { participating: true, amountOwed: '' };
          });
          setParticipantsData(initialParticipants);
        }
      } catch (error) {
        console.error('Failed to get users', error);
      }
    };
    fetchUsers();
  }, []);

  const handleParticipantToggle = (userId) => {
    setParticipantsData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], participating: !prev[userId].participating }
    }));
  };

  const handleParticipantAmountChange = (userId, amt) => {
    setParticipantsData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], amountOwed: amt }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const participants = [];
      let calculatedTotal = 0;

      users.forEach(u => {
        const pd = participantsData[u._id];
        if (pd?.participating) {
          if (splitType === 'UNEQUAL') {
            const owed = Number(pd.amountOwed);
            calculatedTotal += owed;
            participants.push({ user: u._id, amountOwed: owed });
          } else {
            participants.push({ user: u._id });
          }
        }
      });

      if (participants.length === 0) {
        alert("Please select at least one participant");
        return;
      }

      const totalAmount = Number(amount);

      if (splitType === 'UNEQUAL') {
        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
          alert(`Participant amounts sum (${calculatedTotal}) does not match total amount (${totalAmount})`);
          return;
        }
      }

      await createExpense({
        description,
        totalAmount,
        payer: paidBy || (users[0]?._id),
        splitType,
        participants,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create expense', error);
      alert('Error creating expense. Check console.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add an expense</h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dinner, movies, etc."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                className="form-control"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Paid by</label>
              <select
                className="form-control"
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                required
              >
                <option value="">Select User...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.email || user._id}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Split Type</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="splitType"
                    value="EQUAL"
                    checked={splitType === 'EQUAL'}
                    onChange={() => setSplitType('EQUAL')}
                  />
                  Equally
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="splitType"
                    value="UNEQUAL"
                    checked={splitType === 'UNEQUAL'}
                    onChange={() => setSplitType('UNEQUAL')}
                  />
                  Unequally
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label>Participants</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {users.map(user => (
                  <div key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={participantsData[user._id]?.participating || false}
                        onChange={() => handleParticipantToggle(user._id)}
                      />
                      {user.email || user._id}
                    </label>
                    {splitType === 'UNEQUAL' && participantsData[user._id]?.participating && (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '120px', padding: '0.25rem 0.5rem' }}
                        placeholder="Amount"
                        value={participantsData[user._id]?.amountOwed || ''}
                        onChange={(e) => handleParticipantAmountChange(user._id, e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
