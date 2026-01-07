import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTrash,
  FaEdit,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import api from "../../API/API";
import TransactionModal from "../../Components/Modals/TransactionModal";
import ConfirmationModal from "../../Components/Modals/ConfirmationModal";
import "./Transactions.css";

const DEFAULT_PAGE_SIZE = 10;

export default function Transactions() {
  const { dateRange } = useOutletContext() || {};

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "dateTime",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions/getAll");
      setTransactions(
        (res.data || []).sort(
          (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* DATE FILTER */
  const dateFiltered = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return transactions;

    const from = new Date(dateRange.from).setHours(0, 0, 0, 0);
    const to = new Date(dateRange.to).setHours(23, 59, 59, 999);

    return transactions.filter((t) => {
      const d = new Date(t.dateTime).getTime();
      return d >= from && d <= to;
    });
  }, [transactions, dateRange]);

  /* SEARCH + TYPE FILTER + SORT */
  const processed = useMemo(() => {
    let out = [...dateFiltered];

    if (filterType !== "all") {
      out = out.filter((t) => t.type?.toLowerCase() === filterType);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }

    if (sortConfig.key) {
      out.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return out;
  }, [dateFiltered, search, filterType, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    setSortConfig((s) =>
      s.key === key
        ? { key, direction: s.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    const ids = paginated.map((t) => t.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : ids);
  };

  const onSave = async (form) => {
    if (editing) await api.put(`/transactions/update/${editing.id}`, form);
    else await api.post("/transactions/add", form);

    setEditing(null);
    setIsModalOpen(false);
    fetchAll();
  };

  const onConfirmDelete = async () => {
    try {
      if (deleteTargetId !== null) {
        await api.delete(`/transactions/delete/${deleteTargetId}`);
      } else if (selectedIds.length > 0) {
        await api.post("/transactions/deleteSelected", selectedIds);
        setSelectedIds([]);
      }
    } finally {
      setDeleteTargetId(null);
      setIsConfirmOpen(false);
      fetchAll();
    }
  };

  return (
    <div className="transactions-page">
      <header className="transactions-header">
        <h1>Transactions</h1>

        <div className="actions">
          <button className="btn primary" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Add
          </button>

          <button
            className="btn danger"
            disabled={!selectedIds.length}
            onClick={() => setIsConfirmOpen(true)}
          >
            <FaTrash /> Delete ({selectedIds.length})
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <div className="search">
          <FaSearch />
          <input
            placeholder="Search title or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="controls">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(+e.target.value);
              setPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="no-data">Loading...</div>
        ) : (
          <>
            <table className="tx-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        paginated.length &&
                        paginated.every((t) => selectedIds.includes(t.id))
                      }
                    />
                  </th>
                  <th onClick={() => toggleSort("title")}>
                    Title{" "}
                    {sortConfig.key === "title" &&
                      (sortConfig.direction === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      ))}
                  </th>
                  <th onClick={() => toggleSort("amount")}>
                    Amount{" "}
                    {sortConfig.key === "amount" &&
                      (sortConfig.direction === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      ))}
                  </th>
                  <th>Category</th>
                  <th onClick={() => toggleSort("dateTime")}>
                    Date{" "}
                    {sortConfig.key === "dateTime" &&
                      (sortConfig.direction === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      ))}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  paginated.map((tx) => (
                    <tr
                      key={tx.id}
                      className={selectedIds.includes(tx.id) ? "selected" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(tx.id)}
                          onChange={() => toggleSelect(tx.id)}
                        />
                      </td>
                      <td>{tx.title}</td>
                      <td
                        className={tx.type === "INCOME" ? "income" : "expense"}
                      >
                        {tx.type === "INCOME" ? "+" : "-"} ₹
                        {tx.amount.toLocaleString()}
                      </td>
                      <td>{tx.category}</td>
                      <td>{new Date(tx.dateTime).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          className="icon"
                          onClick={() => {
                            setEditing(tx);
                            setIsModalOpen(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon danger"
                          onClick={() => {
                            setDeleteTargetId(tx.id);
                            setIsConfirmOpen(true);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pagination">
              <span>
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, processed.length)} of{" "}
                {processed.length}
              </span>

              <div className="page-controls">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={page === i + 1 ? "active" : ""}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <TransactionModal
          transaction={editing}
          onSave={onSave}
          onClose={() => {
            setEditing(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {isConfirmOpen && (
        <ConfirmationModal
          message={
            deleteTargetId
              ? "Delete this transaction?"
              : `Delete ${selectedIds.length} transaction(s)?`
          }
          onConfirm={onConfirmDelete}
          onCancel={() => {
            setDeleteTargetId(null);
            setIsConfirmOpen(false);
          }}
        />
      )}
    </div>
  );
}
