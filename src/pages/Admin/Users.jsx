import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {FaUsers, FaUserCheck, FaUserXmark, FaMagnifyingGlass, FaEye, FaTrash, FaXmark, FaPhone, FaEnvelope, FaLocationDot, FaCalendarDays, FaRotate, FaCheck, FaUser, } from "react-icons/fa6";
import "../../styles/Layout.css";
import { BASE_URL } from "../../utils/api";
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/users`);
      setUsers(response.data || []);
    } catch (error) {
      console.error("User fetch error:", error);
      setMessage("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // MESSAGE
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  // STATISTICS
  const statistics = useMemo(() => {
    const active = users.filter((user) => user.Status !== "Inactive").length;
    const inactive = users.filter((user) => user.Status === "Inactive").length;
    return {total: users.length, active, inactive, };
  }, [users]);

  // FILTER
  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim();

    return users.filter((user) => {
      const name = user.Name || user.name || user.FullName || user.fullName || "";
      const email = user.Email || user.email || "";
      const mobile = user.Mobile || user.mobile || user.Phone || user.phone || "";
      const searchMatch = !value || String(name).toLowerCase().includes(value) || String(email).toLowerCase().includes(value) || String(mobile).includes(value) || String(user.id || "").toLowerCase().includes(value);
      const userStatus = user.Status || "Active";
      const statusMatch = statusFilter === "All" || userStatus === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [users, search, statusFilter]);

  // HELPERS
  const getName = (user) => {
    return ( user.Name || user.name || user.FullName || user.fullName || "User");
  };
  const getEmail = (user) => {
    return user.Email || user.email || "N/A";
  };
  const getPhone = (user) => {
    return (user.Mobile || user.mobile || user.Phone || user.phone || "N/A");
  };
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(
      "en-IN", {day: "2-digit", month: "short", year: "numeric",}
    );
  };

  // VIEW USER
  const openUser = (user) => {
    setSelectedUser(user);
    document.body.style.overflow = "hidden";
  };

  const closeUser = () => {
    setSelectedUser(null);
    document.body.style.overflow = "auto"; 
  };

  // STATUS
  const toggleUserStatus = async (user) => {
    try {
      const currentStatus = user.Status || "Active";
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      const response = await axios.patch(`${BASE_URL}/users/${user.id}`, {Status: newStatus, });
      setUsers((previous) => previous.map((item) => item.id === user.id ? {...item, ...response.data, }: item));

      if (selectedUser?.id === user.id) {
        setSelectedUser((previous) => ({...previous, ...response.data, }));
      }
      setMessage(`User ${newStatus.toLowerCase()} successfully.`);
    } catch (error) {
      console.error(error);
      setMessage("Unable to update user.");
    }
  };

  // DELETE
  const deleteUser = async (id) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this user?");

    if (!confirmed) return;

    try {
      await axios.delete(`${BASE_URL}/users/${id}`);
      setUsers((previous) => previous.filter((user) => user.id !== id));
      if (selectedUser?.id === id) {
        closeUser();
      }
      setMessage("User deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete user.");
    }
  };

  if (loading) {
    return (
      <div className="admin-users-loading">Loading users...</div>
    );
  }

  return (
    <main className="admin-users-page">
      {message && (
        <div className="admin-users-message"><FaCheck />{message}</div>
      )}

      {/* HEADER */}
      <header className="admin-users-header">
        <div>
          <p>USER MANAGEMENT</p>
          <h1>Customers</h1>
          <span>View and manage registered customers.</span>
        </div>
        <button onClick={fetchUsers}><FaRotate />Refresh</button>
      </header>

      {/* STATISTICS */}
      <section className="admin-users-statistics">
        <div>
          <span className="user-stat-icon total"><FaUsers /></span>
          <section>
            <small>Total Users</small>
            <strong>{statistics.total}</strong>
          </section>
        </div>

        <div>
          <span className="user-stat-icon active"><FaUserCheck /></span>
          <section>
            <small>Active Users</small>
            <strong>{statistics.active}</strong>
          </section>
        </div>

        <div>
          <span className="user-stat-icon inactive"><FaUserXmark /></span>
          <section>
            <small>Inactive Users</small>
            <strong>{statistics.inactive}</strong>
          </section>
        </div>
      </section>

      {/* FILTERS */}
      <section className="admin-users-filters">
        <div>
          <FaMagnifyingGlass />
          <input type="text" placeholder="Search name, email, phone or user ID..." value={search} onChange={(event) => setSearch(event.target.value)}/>
        </div>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All Users</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </section>

      {/* TABLE */}
      <section className="admin-users-table-card">
        <header>
          <div>
            <h2>Registered Customers</h2>
            <p>Showing {filteredUsers.length} of{" "} {users.length} users</p>
          </div>
        </header>
        {filteredUsers.length === 0 ? (
          <div className="admin-users-empty">
            <FaUsers />
            <h3>No users found</h3>
            <p>Try changing the search or filter.</p>
          </div>
        ) : (
          <div className="admin-users-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const status = user.Status || "Active";
                  return (
                    <tr key={user.id}>  
                      <td>
                        <div className="admin-user-profile">
                          <span>{getName(user).charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{getName(user)}</strong>
                            <small>#{user.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>{getEmail(user)}</td>
                      <td>{getPhone(user)}</td>
                      <td><span className={status === "Active" ? "user-status active" : "user-status inactive"}>{status}</span></td>
                      <td>{formatDate(user.CreatedAt || user.createdAt)}</td>
                      <td>
                        <div className="admin-user-actions">
                          <button className="user-view" onClick={() => openUser(user)}><FaEye /></button>
                          <button className="user-delete" onClick={() => deleteUser(user.id)}><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* USER DETAILS */}
      {selectedUser && (
        <div className="admin-user-modal-overlay" onMouseDown={(event) => {if (event.target === event.currentTarget) {
              closeUser();
              }}}>

          <div className="admin-user-modal">
            <header>
              <div>
                <span>USER DETAILS</span>
                <h2>{getName(selectedUser)}</h2>
              </div>
              <button onClick={closeUser}><FaXmark /></button>
            </header>

            <div className="admin-user-modal-content">
              <div className="admin-user-avatar">
                <FaUser />
                <h2>{getName(selectedUser)}</h2>
                <span>#{selectedUser.id}</span>
              </div>
              <section className="admin-user-info-card">
                <h3>Contact Information</h3>
                <div>
                  <span><FaEnvelope />Email</span>
                  <strong>{getEmail(selectedUser)}</strong>
                </div>

                <div>
                  <span><FaPhone />Mobile</span>
                  <strong>{getPhone(selectedUser)}</strong>
                </div>
              </section>

              {selectedUser.Address && (
                <section className="admin-user-info-card">
                  <h3>Address</h3>
                  <p>
                    <FaLocationDot />
                    {typeof selectedUser.Address === "string" ? selectedUser.Address
                      : [
                          selectedUser.Address ?.Street,
                          selectedUser.Address ?.City,
                          selectedUser.Address ?.State,
                          selectedUser.Address ?.Pincode,
                        ].filter(Boolean).join(", ")}
                  </p>
                </section>)}
              <section className="admin-user-info-card">
                <h3>Account Information</h3>
                <div>
                  <span><FaCalendarDays />Joined</span>
                  <strong>{formatDate(selectedUser.CreatedAt || selectedUser.createdAt)}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong className={(selectedUser.Status || "Active") === "Active" ? "modal-user-active" : "modal-user-inactive"}>{selectedUser.Status || "Active"}</strong>
                </div>
              </section>
              <div className="admin-user-modal-actions">
                <button className="user-status-button" onClick={() => toggleUserStatus(selectedUser)}>{(selectedUser.Status || "Active") === "Active" ? "Deactivate User" : "Activate User"}</button>
                <button className="user-modal-delete" onClick={() =>deleteUser(selectedUser.id)}><FaTrash />Delete User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminUsers;