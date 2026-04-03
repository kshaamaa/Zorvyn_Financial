import { useState, useEffect, useCallback } from "react";
import { recordsApi } from "../lib/api";
import { formatCurrency, formatDate, CATEGORIES } from "../lib/utils";
import type { FinancialRecord, RecordFilters, CreateRecordData, UpdateRecordData } from "../types";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ─── Record Form Modal ──────────────────────────────────

interface RecordFormProps {
  record?: FinancialRecord | null;
  onClose: () => void;
  onSave: () => void;
}

function RecordForm({ record, onClose, onSave }: RecordFormProps) {
  const [form, setForm] = useState<CreateRecordData>({
    amount: record?.amount || 0,
    type: record?.type || "INCOME",
    category: record?.category || CATEGORIES[0],
    date: record?.date ? record.date.split("T")[0] : new Date().toISOString().split("T")[0],
    description: record?.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (record) {
        const patch: UpdateRecordData = {
          amount: form.amount,
          type: form.type,
          category: form.category,
          date: form.date,
          description: form.description,
        };
        await recordsApi.update(record.id, patch);
      } else {
        await recordsApi.create(form);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {record ? "Edit Record" : "New Record"}
          </h3>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["INCOME", "EXPENSE"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all",
                    form.type === t
                      ? t === "INCOME"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {t === "INCOME" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
              rows={2}
              placeholder="Brief description…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : record ? (
                "Save Changes"
              ) : (
                "Create Record"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ───────────────────────────────

function DeleteConfirm({ record, onClose, onConfirm }: { record: FinancialRecord; onClose: () => void; onConfirm: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Delete Record</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete the <strong>{record.category}</strong> record
          of <strong>{formatCurrency(record.amount)}</strong>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="btn-danger flex-1">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Records Page ───────────────────────────────────────

export default function RecordsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecordFilters>({ page: 1, limit: 12, sortBy: "date", sortOrder: "desc" });
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [formRecord, setFormRecord] = useState<FinancialRecord | "new" | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<FinancialRecord | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async (f: RecordFilters) => {
    setLoading(true);
    try {
      const res = await recordsApi.list(f);
      setRecords(res.data);
      setPagination(res.pagination);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(filters);
  }, [filters, fetchRecords]);

  const handleSearch = () => {
    const newFilters = { ...filters, page: 1, search: search || undefined };
    setFilters(newFilters);
  };

  const handleFilterChange = (key: keyof RecordFilters, value: string) => {
    setFilters((prev) => ({ ...prev, page: 1, [key]: value || undefined }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    try {
      await recordsApi.delete(deleteRecord.id);
      setDeleteRecord(null);
      showSuccess("Record deleted successfully");
      fetchRecords(filters);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = () => {
    setFormRecord(null);
    showSuccess(formRecord === "new" ? "Record created successfully" : "Record updated successfully");
    fetchRecords(filters);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Financial Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total} total records
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setFormRecord("new")} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Record
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search description or category…"
              className="input pl-9"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("btn-secondary", showFilters && "bg-primary-50 border-primary-200 text-primary-700")}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="label text-xs">Type</label>
              <select
                value={filters.type || ""}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="input text-sm"
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">Category</label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="input text-sm"
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label text-xs">End Date</label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label text-xs">Sort By</label>
              <select
                value={filters.sortBy || "date"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="input text-sm"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
                <option value="createdAt">Created</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">Order</label>
              <select
                value={filters.sortOrder || "desc"}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value as "asc" | "desc")}
                className="input text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex justify-end">
              <button
                onClick={() => {
                  setFilters({ page: 1, limit: 12, sortBy: "date", sortOrder: "desc" });
                  setSearch("");
                }}
                className="btn-ghost btn-sm text-gray-500"
              >
                <Filter className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No records found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  {isAdmin && (
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                          record.type === "INCOME"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        )}
                      >
                        {record.type === "INCOME" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {record.type.charAt(0) + record.type.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge badge-blue">{record.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[200px] truncate">
                      {record.description || "—"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 text-right font-semibold whitespace-nowrap",
                        record.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                      )}
                    >
                      {record.type === "INCOME" ? "+" : "-"}{formatCurrency(record.amount)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setFormRecord(record)}
                            className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteRecord(record)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const startPage = Math.max(1, pagination.page - 2);
              const page = startPage + i;
              if (page > pagination.totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "w-8 h-8 text-sm rounded-lg font-medium transition-all",
                    page === pagination.page
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {formRecord !== null && (
        <RecordForm
          record={formRecord === "new" ? null : formRecord}
          onClose={() => setFormRecord(null)}
          onSave={handleSave}
        />
      )}
      {deleteRecord && (
        <DeleteConfirm
          record={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
const Receipt = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
