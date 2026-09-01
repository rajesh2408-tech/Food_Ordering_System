import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {FaChartPie,FaBagShopping,FaStore,FaUtensils, FaUsers, FaChartLine, FaGear, FaRightFromBracket} from "react-icons/fa6";
import "../styles/Layout.css";

const AdminLayout = () => {
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem("loggedInUser"));

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        alert("Logout Successful");
        navigate("/login");
    };

    return (
        <main className="admin-layout">

            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                {/* LOGO */}
                <div className="admin-logo">
                    <div className="admin-logo-icon">🍽️</div>
                    <div>
                        <h2>FoodAdmin</h2>
                        <span>Management Panel</span>
                    </div>
                </div>
                {/* ADMIN PROFILE */}
                <div className="admin-profile-info">
                    <div className="admin-profile-icon">{admin?.Name?.charAt(0)?.toUpperCase() || "A"}</div>
                    <div className="admin-profile-text">
                        <strong>{admin?.Name || "Admin"}</strong>
                        <span>{admin?.Email || "Administrator"}</span>
                    </div>
                </div>
                {/* MENU */}
                <nav className="admin-sidebar-menu">
                    <NavLink to="admindashboard" className={({ isActive }) => isActive ? "admin-menu-link active" : "admin-menu-link"}>
                        <FaChartPie />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="orders" className={({ isActive }) => isActive ? "admin-menu-link active" : "admin-menu-link"}>
                        <FaBagShopping />
                        <span>Orders</span>
                    </NavLink>
                    <NavLink to="restaurants" className={({ isActive }) => isActive ? "admin-menu-link active" : "admin-menu-link"}>
                        <FaStore />
                        <span>Restaurants</span>
                    </NavLink>
                    <NavLink to="foods" className={({ isActive }) => isActive ? "admin-menu-link active" : "admin-menu-link"}>
                        <FaUtensils />
                        <span>Food Items</span>
                    </NavLink>
                    <NavLink to="users" className={({ isActive }) => isActive ? "admin-menu-link active" : "admin-menu-link"}>
                        <FaUsers />
                        <span>Customers</span>
                    </NavLink>
                    <NavLink to="analytics" className={({ isActive }) => isActive ? "admin-menu-link active" : "admin-menu-link"}>
                        <FaChartLine />
                        <span>Analytics</span>
                    </NavLink>
                    <NavLink to="settings" className={({ isActive }) => isActive ? "admin-menu-link active" : "admin-menu-link"}>
                        <FaGear />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                {/* LOGOUT */}
                <div className="admin-sidebar-bottom">
                    <button className="admin-logout-button" onClick={handleLogout}>
                        <FaRightFromBracket />
                        <span>Logout</span>
                    </button>
                </div>
                
            </aside>

            {/* RIGHT SIDE */}
            <section className="admin-main-content">
                <Outlet />
            </section>

        </main>
    );
};

export default AdminLayout;