import { useEffect, useState } from "react";
import { getBalances, getSettlements, getExpenses } from "../services/api";
import { DollarSign, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balRes = await getBalances();
        // Depending on backend, data could be in balRes or balRes.data
        if (balRes?.data) setBalances(balRes.data);
        else if (Array.isArray(balRes)) setBalances(balRes);

        const setRes = await getSettlements();
        if (setRes?.data) setSettlements(setRes.data);
        else if (Array.isArray(setRes)) setSettlements(setRes);

        // Additionally fetch raw expenses and compute clean, aggregated balances & settlements client-side
        // This provides readable results like: "A owes B ₹500"
        try {
          const expensesRes = await getExpenses();
          const expenses =
            expensesRes?.data ||
            (Array.isArray(expensesRes) ? expensesRes : []);

          // Map of userId -> { amount: netAmount, name: displayName }
          const nets = {};

          const ensureUser = (idOrObj, fallback) => {
            if (!idOrObj) return fallback || "Unknown";
            if (typeof idOrObj === "string") return idOrObj;
            // object with email or _id
            return idOrObj.email || idOrObj._id || fallback || "Unknown";
          };

          expenses.forEach((exp) => {
            // Edge case: skip if no participants or payer
            if (
              !exp ||
              !exp.payer ||
              !Array.isArray(exp.participants) ||
              exp.participants.length === 0
            ) {
              console.warn(
                "Skipping expense with invalid participants or payer",
                exp,
              );
              return;
            }
            const totalAmount = Number(exp.totalAmount || exp.amount || 0);
            if (isNaN(totalAmount) || totalAmount <= 0) {
              console.warn("Skipping expense with invalid or zero amount", exp);
              return;
            }
            const participants = exp.participants;
            const payer = exp.payer || exp.paidBy;

            // Edge case: ensure payer is in participants
            const payerId =
              typeof payer === "string"
                ? payer
                : payer?._id || payer?.email || JSON.stringify(payer);
            const payerInParticipants = participants.some((part) => {
              const user = part.user || part;
              const userId =
                typeof user === "string"
                  ? user
                  : user?._id || user?.email || JSON.stringify(user);
              return userId === payerId;
            });
            if (!payerInParticipants) {
              participants.push({ user: payer, amountOwed: 0 });
            }

            // register payer
            if (!nets[payerId])
              nets[payerId] = { amount: 0, name: ensureUser(payer, payerId) };

            const numParticipants = participants.length || 1;
            // determine shares
            let sumShares = 0;
            participants.forEach((part) => {
              const user = part.user || part;
              const userId =
                typeof user === "string"
                  ? user
                  : user?._id || user?.email || JSON.stringify(user);
              if (!nets[userId])
                nets[userId] = { amount: 0, name: ensureUser(user, userId) };

              let share = 0;
              if (part.amountOwed !== undefined && part.amountOwed !== null) {
                share = Number(part.amountOwed || 0);
                if (isNaN(share) || share < 0) share = 0;
              } else if (exp.splitType === "UNEQUAL") {
                // if UNEQUAL but participant doesn't have amount, skip or treat as 0
                share = 0;
              } else {
                share = totalAmount / numParticipants;
              }
              // Precision fix
              share = Math.round((share + Number.EPSILON) * 100) / 100;
              sumShares += share;
              // participant owes share
              nets[userId].amount -= share;
            });
            // Edge case: incorrect split totals
            if (Math.abs(sumShares - totalAmount) > 0.05 * numParticipants) {
              console.warn(
                "Split totals do not match total amount",
                exp,
                sumShares,
                totalAmount,
              );
            }
            // payer paid the whole amount
            nets[payerId].amount += totalAmount;
          });

          // Build balances array
          const computedBalances = Object.keys(nets).map((id) => ({
            user: nets[id].name,
            id,
            amount: Math.round((nets[id].amount + Number.EPSILON) * 100) / 100,
          }));

          // Create settlements (greedy algorithm)
          const creditors = computedBalances
            .filter((b) => b.amount > 0)
            .map((b) => ({ ...b }));
          const debtors = computedBalances
            .filter((b) => b.amount < 0)
            .map((b) => ({ ...b }));

          creditors.sort((a, b) => b.amount - a.amount);
          debtors.sort((a, b) => a.amount - b.amount); // most negative first

          const computedSettlements = [];

          let cIdx = 0;
          let dIdx = 0;

          while (dIdx < debtors.length && cIdx < creditors.length) {
            const debtor = debtors[dIdx];
            const creditor = creditors[cIdx];

            const owe = Math.min(creditor.amount, -debtor.amount);
            if (owe <= 0) break;

            computedSettlements.push({
              from: debtor.name,
              to: creditor.name,
              amount: Math.round((owe + Number.EPSILON) * 100) / 100,
            });

            debtor.amount += owe;
            creditor.amount -= owe;

            if (Math.abs(debtor.amount) < 0.01) dIdx++;
            if (Math.abs(creditor.amount) < 0.01) cIdx++;
          }

          // Prefer the computed client-side results if available
          if (computedBalances.length > 0) setBalances(computedBalances);
          if (computedSettlements.length > 0)
            setSettlements(computedSettlements);
        } catch (err) {
          console.warn(
            "Failed to compute client-side balances/settlements",
            err,
          );
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <div className="header">
        <h1 className="header-title">Dashboard</h1>
      </div>

      <div className="glass-panel" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
          Net Balances
        </h3>
        {balances && balances.length > 0 ? (
          <div className="list-container">
            {balances.map((b, i) => (
              <div key={i} className="list-item">
                <div className="icon-box">
                  <DollarSign size={24} />
                </div>
                <div className="item-details">
                  <div className="title">
                    {typeof b === "string"
                      ? b
                      : b.user?.email || b.user || "User balance"}
                  </div>
                  {b.amount !== undefined && (
                    <div className="date">Balance Amount</div>
                  )}
                </div>
                {b.amount !== undefined && (
                  <div
                    className={`item-amount ${b.amount >= 0 ? "positive" : "negative"}`}
                  >
                    {b.amount >= 0 ? "+" : ""}₹{b.amount}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>
            No active balances found.
          </p>
        )}
      </div>

      <div className="glass-panel" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
          Optimized Settlements
        </h3>
        {settlements && settlements.length > 0 ? (
          <div className="list-container">
            {settlements.map((s, i) => {
              // Support both string and object formats for settlements
              if (typeof s === "string") {
                // Try to parse string like "A owes B ₹500" to extract names and amount
                const match = s.match(/^(.*?) owes (.*?) ₹([\d,.]+)/);
                if (match) {
                  return (
                    <div key={i} className="list-item">
                      <div className="icon-box">
                        <CheckCircle size={24} />
                      </div>
                      <div className="item-details">
                        <div className="title">
                          <span style={{ fontWeight: 600 }}>{match[1]}</span>{" "}
                          owes{" "}
                          <span style={{ fontWeight: 600 }}>{match[2]}</span>
                        </div>
                        <div className="date">Settlement Amount</div>
                      </div>
                      <div className="item-amount negative">₹{match[3]}</div>
                    </div>
                  );
                }
                // fallback
                return (
                  <div key={i} className="list-item">
                    <div className="icon-box">
                      <CheckCircle size={24} />
                    </div>
                    <div className="item-details">
                      <div className="title">{s}</div>
                      <div className="date">Settlement Amount</div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="list-item">
                  <div className="icon-box">
                    <CheckCircle size={24} />
                  </div>
                  <div className="item-details">
                    <div className="title">
                      {s.from && s.to ? (
                        <>
                          <span style={{ fontWeight: 600 }}>{s.from}</span> owes{" "}
                          <span style={{ fontWeight: 600 }}>{s.to}</span>
                        </>
                      ) : (
                        "Settlement"
                      )}
                    </div>
                    {s.amount !== undefined && (
                      <div className="date">Settlement Amount</div>
                    )}
                  </div>
                  {s.amount !== undefined && (
                    <div className="item-amount negative">₹{s.amount}</div>
                  )}
                </div>
              );
            })}
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

export default Dashboard;
