import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data;
};

export const getBalances = async () => {
  const response = await api.get("/expenses/balances");
  return response.data;
};

export const getSettlements = async () => {
  const response = await api.get("/expenses/settlements");
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post("/expenses", data);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};

export default api;
