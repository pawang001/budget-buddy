import React from "react";
import "./Modal.css";

export default function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      {/* backdrop click only */}
      <div className="modal-backdrop" onClick={onCancel} />

      {/* modal content */}
      <div
        className="modal-container small"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Confirm Action</h3>

        <p className="confirm-message">{message}</p>

        <div className="modal-actions">
          <button className="modal-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn danger-btn" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
