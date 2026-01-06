import React, { useState, useEffect } from "react";
import "./Modal.css";

const TransactionModal = ({ onClose, onSave, transaction }) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "EXPENSE",
    category: "",
    dateTime: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        dateTime: new Date(transaction.dateTime).toISOString().slice(0, 10),
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      amount: parseFloat(form.amount),
      dateTime: new Date(form.dateTime).toISOString(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h3>{transaction ? "Edit Transaction" : "Add Transaction"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              placeholder="e.g. Coffee"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="e.g. 150.00"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              name="category"
              placeholder="e.g. Food"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              name="dateTime"
              type="date"
              value={form.dateTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="modal-btn save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
