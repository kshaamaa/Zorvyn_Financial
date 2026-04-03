import { useState, useEffect, useCallback } from "react";
import { usersApi } from "../lib/api";
import type { User } from "../types";
import { formatDateTime, getInitials } from "../lib/utils";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  AlertCircle,
  CheckCircle,
  UserX,
  Ban,
  UserPlus,
  X,
} from "lucide-react";

// ─── Role Badge ─────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: "badge-red",
    ANALYST: "badge-blue",
    VIEWER: "badge-gray",
  };
  const icons: Record<string, React.ReactNode> = {
    ADMIN: <ShieldCheck className="w-3 h-3" />,
    ANALYST: <Shield className="w-3 h-3" />,
    VIEWER: <Eye className="w-3 h-3" />,
  };
  return (
    <span className={cn("badge gap-1", map[role] || "badge-gray")}>
      {icons[role]}
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Status Badge ───────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("badge", status === "ACTIVE" ? "badge-green" : "badge-yellow")}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1", status ===  "ACTIVE" ? "bg-emerald-500" : "bg-yellow-500")} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Role Edit Modal ────────────────────────────────────

function RoleModal({
  user: targetUser,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: () => void;
}) {
  const [role, setRole] = useState(targetUser.role);
  const [status, setStatus] = useState(targetUser.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      if (role !== targetUser.role) {
        await usersApi.updateRole(targetUser.id, role);
      }
      if (status !== targetUser.status) {
        await usersApi.update(targetUser.id, { status });
      }
      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
            {getInitials(targetUser.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{targetUser.name}</h3>
            <p className="text-xs text-gray-500">{targetUser.email}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="label">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(["VIEWER", "ANALYST", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all",
                    role === r
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {r === "ADMIN" ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : r === "ANALYST" ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {role === "ADMIN" && "Full access: create/edit/delete records and manage users"}
              {role === "ANALYST" && "Read access + dashboard analytics"}
              {role === "VIEWER" && "Read-only access to records"}
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(["ACTIVE", "INACTIVE"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    status === s
                      ? s === "ACTIVE"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-yellow-400 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {s === "ACTIVE" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ───────────────────────────────────────

function DeleteModal({
  user: targetUser,
  onClose,
  onConfirm,
}: {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}) {
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
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Remove User</h3>
            <p className="text-xs text-gray-500">Soft delete — can be restored</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Remove <strong>{targetUser.name}</strong> ({targetUser.email}) from the system?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="btn-danger flex-1">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create User Modal ──────────────────────────────────

function CreateUserModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await usersApi.create(form);
      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Create New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
              className="input"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@example.com"
              className="input"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 chars, upper + lower + digit"
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(["VIEWER", "ANALYST", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-sm font-medium transition-colors",
                    form.role === r
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Users Page ─────────────────────────────────────────

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list(page, 10, search || undefined);
      setUsers(res.data);
      setPagination(res.pagination);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    try {
      await usersApi.delete(deleteUser.id);
      setDeleteUser(null);
      showSuccess("User removed successfully");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditSave = () => {
    setEditUser(null);
    showSuccess("User updated successfully");
    fetchUsers();
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
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} users registered</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name or email…"
              className="input pl-9"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
          {search && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
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
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <UserX className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          u.id === currentUser?.id
                            ? "bg-primary-100 text-primary-700"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="text-[10px] font-semibold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">YOU</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {u.id !== currentUser?.id && (
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenu === u.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1 text-sm">
                                <button
                                  onClick={() => { setEditUser(u); setOpenMenu(null); }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Shield className="w-4 h-4 text-gray-400" />
                                  Edit Role & Status
                                </button>
                                <div className="my-1 border-t border-gray-100" />
                                <button
                                  onClick={() => { setDeleteUser(u); setOpenMenu(null); }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove User
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
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
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editUser && (
        <RoleModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleEditSave}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            showSuccess("User created successfully");
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
