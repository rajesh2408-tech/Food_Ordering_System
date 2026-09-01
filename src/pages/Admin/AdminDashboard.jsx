import React, { useEffect, useState } from "react";
import axios from "axios";
import {FaIndianRupeeSign, FaBagShopping, FaStore, FaUsers, FaArrowTrendUp, FaClock} from "react-icons/fa6";
import "../../styles/Layout.css";
import { BASE_URL } from "../../utils/api";
const AdminDashboard = () => {

    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [ordersResponse, restaurantsResponse, usersResponse] = await Promise.all([
                axios.get(`${BASE_URL}/orders`),
                axios.get(`${BASE_URL}/restaurants`),
                axios.get(`${BASE_URL}/users`)
            ]);
            setOrders(ordersResponse.data || []);
            setRestaurants(restaurantsResponse.data || []);
            setUsers(usersResponse.data || []);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    /* TOTAL REVENUE */
    const totalRevenue = orders.reduce((total, order) => total + Number(order.bill?.totalAmount || 0), 0);

    /* ORDER STATUS */
    const placedOrders = orders.filter((order) => order.orderStatus === "Order Placed").length;
    const preparingOrders = orders.filter((order) => order.orderStatus === "Preparing").length;
    const deliveredOrders = orders.filter((order) => order.orderStatus === "Delivered").length;

    /* RECENT ORDERS */
    const recentOrders = [...orders].sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)).slice(0, 6);

    const getStatusClass = (status) => {
        if (status === "Delivered") return "status delivered";
        if (status === "Preparing") return "status preparing";
        if (status === "Out for Delivery") return "status delivery";
        if (status === "Cancelled") return "status cancelled";

        return "status placed";
    };

    if (loading) {
        return (<div className="admin-loading">Loading dashboard...</div>);
    }

    return (
        <main className="admin-dashboard">

            {/* HEADER */}
            <header className="admin-dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening with your food delivery business.</p>
                </div>
            </header>

            {/* STAT CARDS */}
            <section className="admin-stat-grid">
                {/* REVENUE */}
                <div className="admin-stat-card">
                    <div className="admin-stat-icon revenue"><FaIndianRupeeSign /></div>
                    <div className="admin-stat-content">
                        <span>Total Revenue</span>
                        <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
                        <p><FaArrowTrendUp />Revenue from all orders</p>
                    </div>
                </div>

                {/* ORDERS */}
                <div className="admin-stat-card">
                    <div className="admin-stat-icon orders"><FaBagShopping /></div>
                    <div className="admin-stat-content">
                        <span>Total Orders</span>
                        <h2>{orders.length}</h2>
                        <p><FaClock />{placedOrders} new orders</p>
                    </div>
                </div>
                {/* RESTAURANTS */}
                <div className="admin-stat-card">
                    <div className="admin-stat-icon restaurants"><FaStore /></div>
                    <div className="admin-stat-content">
                        <span>Restaurants</span>
                        <h2>{restaurants.length}</h2>
                        <p>Active restaurants</p>
                    </div>
                </div>
                {/* CUSTOMERS */}
                <div className="admin-stat-card">
                    <div className="admin-stat-icon customers"><FaUsers /></div>
                    <div className="admin-stat-content">
                        <span>Customers</span>
                        <h2>{users.length}</h2>
                        <p>Registered users</p>
                    </div>
                </div>
            </section>

            {/* ORDER STATUS + SUMMARY */}
            <section className="admin-dashboard-middle">
                {/* ORDER OVERVIEW */}
                <div className="admin-dashboard-card">
                    <div className="admin-card-header">
                        <div>
                            <h2>Order Overview</h2>
                            <p>Current order status breakdown</p>
                        </div>
                    </div>
                    <div className="admin-order-overview">
                        <div className="order-overview-item">
                            <div className="overview-number placed">{placedOrders}</div>
                            <div>
                                <strong>Order Placed</strong>
                                <span>Waiting for confirmation</span>
                            </div>
                        </div>
                        <div className="order-overview-item">
                            <div className="overview-number preparing">{preparingOrders}</div>
                            <div>
                                <strong>Preparing</strong>
                                <span>Being prepared</span>
                            </div>
                        </div>
                        <div className="order-overview-item">
                            <div className="overview-number delivered">{deliveredOrders}</div>
                            <div>
                                <strong>Delivered</strong>
                                <span>Successfully delivered</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BUSINESS SUMMARY */}
                <div className="admin-dashboard-card">
                    <div className="admin-card-header">
                        <div>
                            <h2>Business Summary</h2>
                            <p>Overall platform performance</p>
                        </div>
                    </div>

                    <div className="business-summary">
                        <div>
                            <span>Restaurants</span>
                            <strong>{restaurants.length}</strong>
                        </div>
                        <div>
                            <span>Customers</span>
                            <strong>{users.length}</strong>
                        </div>
                        <div>
                            <span>Orders</span>
                            <strong>{orders.length}</strong>
                        </div>
                        <div>
                            <span>Delivered</span>
                            <strong>{deliveredOrders}</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* RECENT ORDERS */}
            <section className="admin-dashboard-card recent-orders-card">
                <div className="admin-card-header">
                    <div>
                        <h2>Recent Orders</h2>
                        <p>Latest orders placed by customers</p>
                    </div>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="admin-no-orders">No orders available.</div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Restaurant</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="admin-order-id">{order.id}</td>
                                        <td>
                                            <div className="table-customer">
                                                <strong>{order.customer?.fullName || "Customer"}</strong>
                                                <span>{order.customer?.phone}</span>
                                            </div>
                                        </td>
                                        <td>{order.restaurant?.name || "Restaurant"}</td>
                                        <td>{order.totalItems || order.items?.length || 0}</td>
                                        <td><strong>₹{order.bill?.totalAmount || 0}</strong></td>
                                        <td>{order.payment?.displayMethod || order.payment?.method || "N/A"}</td>
                                        <td>
                                            <span className={getStatusClass(order.orderStatus)}>
                                                {order.orderStatus || "Order Placed"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
};

export default AdminDashboard;