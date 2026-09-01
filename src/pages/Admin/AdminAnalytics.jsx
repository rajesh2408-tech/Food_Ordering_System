import React, {useEffect, useMemo, useState,} from "react";
import axios from "axios";
import {FaChartLine, FaIndianRupeeSign, FaBagShopping, FaUsers, FaStore, FaStar, FaUtensils, FaTruck, FaCheck, FaXmark, FaRotate, FaArrowTrendUp, } from "react-icons/fa6";
import "../../styles/Layout.css";
import {BASE_URL} from "../../utils/api";
const AdminAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [ordersResponse, restaurantsResponse, usersResponse, ] = 
      await Promise.all([
        axios.get(`${BASE_URL}/orders`),
        axios.get(`${BASE_URL}/restaurants`),
        axios.get(`${BASE_URL}/users`),
      ]);
      setOrders(ordersResponse.data || []);
      setRestaurants(restaurantsResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // MAIN ANALYTICS
  const analytics = useMemo(() => {
    const deliveredOrders = orders.filter((order) => order.orderStatus === "Delivered");
    const cancelledOrders = orders.filter((order) => order.orderStatus === "Cancelled");
    const activeOrders = orders.filter( (order) => order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled");
    const revenue = deliveredOrders.reduce((total, order) => total + Number(order.bill?.totalAmount || 0), 0);
    const totalOrderValue = orders.reduce((total, order) => total + Number(order.bill?.totalAmount || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalOrderValue / orders.length : 0;
    const totalFoodItems = restaurants.reduce((total, restaurant) => total + (restaurant.Items?.length || 0), 0);
    const averageRestaurantRating = restaurants.length > 0 ? restaurants.reduce((total, restaurant) => total + Number(restaurant.Rating || 0), 0) / restaurants.length : 0;

    return {
      revenue,
      totalOrders: orders.length,
      delivered: deliveredOrders.length,
      cancelled: cancelledOrders.length,
      activeOrders: activeOrders.length,
      averageOrderValue,
      users: users.length,
      restaurants: restaurants.length,
      totalFoodItems,
      averageRestaurantRating,
    };
  }, [orders, restaurants, users, ]);

  // ORDER STATUS DISTRIBUTION
  const statusData = useMemo(() => {
    const statuses = ["Order Placed", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered", "Cancelled", ];

    return statuses.map((status) => ({status, count: orders.filter((order) => order.orderStatus === status).length,
    }));
  }, [orders]);

  // TOP RESTAURANTS
  const topRestaurants =
    useMemo(() => {
      const data = restaurants.map(
        (restaurant) => {
          const restaurantOrders = orders.filter((order) => order.restaurant?.id === restaurant.id);
          const revenue = restaurantOrders
              .filter((order) => order.orderStatus === "Delivered")
              .reduce((total, order) => total + Number(order.bill ?.totalAmount || 0 ), 0);
          return {...restaurant, orderCount: restaurantOrders.length, revenue,};
        }
      );
      return data.sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);
    }, [restaurants, orders]);

  // TOP FOOD
  const topFoods = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.id || item.Name;

        if (!map[key]) {
          map[key] = {
            id: key,
            name: item.Name,
            image: item.Image,
            quantity: 0,
            revenue: 0,
          };
        }

        map[key].quantity +=Number(item.quantity || 0);
        map[key].revenue += Number(item.totalPrice || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [orders]);

  // RECENT ORDERS
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)).slice(0, 6);
  }, [orders]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date)
      .toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric",});
  };

  if (loading) {
    return (
      <div className="analytics-loading">Loading analytics...</div>
    );
  }

  return (
    <main className="admin-analytics-page">

      {/* HEADER */}
      <header className="analytics-header">
        <div>
          <p>PERFORMANCE OVERVIEW</p>
          <h1>Analytics</h1>
          <span>Track orders, revenue, customers and restaurant performance.</span>
        </div>
        <button onClick={fetchAnalytics}><FaRotate />Refresh Data</button>
      </header>

      {/* PRIMARY STATS */}
      <section className="analytics-main-stats">
        <article>
          <span><FaIndianRupeeSign /></span>
          <div>
            <small>Total Revenue</small>
            <strong>₹{analytics.revenue.toLocaleString("en-IN")}</strong>
            <p><FaArrowTrendUp />Delivered orders</p>
          </div>
        </article>

        <article>
          <span><FaBagShopping /></span>
          <div>
            <small>Total Orders</small>
            <strong>{analytics.totalOrders}</strong>
            <p>{analytics.activeOrders} {" "}active orders</p>
          </div>
        </article>

        <article>
          <span><FaUsers /></span>
          <div>
            <small>Customers</small>
            <strong>{analytics.users}</strong>
            <p>Registered users</p>
          </div>
        </article>

        <article>
          <span><FaStore /></span>
          <div>
            <small>Restaurants</small>
            <strong>{analytics.restaurants}</strong>
            <p>Platform restaurants</p>
          </div>
        </article>
      </section>

      {/* SECONDARY */}
      <section className="analytics-secondary">
        <div>
          <FaCheck />
          <section>
            <span>Delivered</span>
            <strong>{analytics.delivered}</strong>
          </section>
        </div>

        <div>
          <FaXmark />
          <section>
            <span>Cancelled</span>
            <strong>{analytics.cancelled}</strong>
          </section>
        </div>

        <div>
          <FaIndianRupeeSign />
          <section>
            <span>Average Order</span>
            <strong>₹{Math.round(analytics.averageOrderValue)}</strong>
          </section>
        </div>

        <div>
          <FaUtensils />
          <section>
            <span>Food Items</span>
            <strong>{analytics.totalFoodItems}</strong>
          </section>
        </div>

        <div>
          <FaStar />
          <section>
            <span>Restaurant Rating</span>
            <strong>{analytics.averageRestaurantRating.toFixed(1)}</strong>
          </section>
        </div>
      </section>

      {/* STATUS + TOP RESTAURANTS */}
      <section className="analytics-two-column">
        <article className="analytics-card">
          <header>
            <div>
              <h2>Order Status</h2>
              <p>Current order distribution</p>
            </div>
            <FaChartLine />
          </header>

          <div className="analytics-status-list">
            {statusData.map(
              (item) => {
                const percentage = analytics.totalOrders > 0 ? (item.count / analytics.totalOrders) * 100 : 0;
                return (
                  <div key={item.status} className="analytics-status-row">
                    <div>
                      <span>{item.status}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <section>
                      <span style={{width:`${percentage}%`,}}></span>
                    </section>
                  </div>
                );
              }
            )}
          </div>
        </article>

        <article className="analytics-card">
          <header>
            <div>
              <h2>Top Restaurants</h2>
              <p>Based on order volume</p>
            </div>
            <FaStore />
          </header>

          <div className="analytics-top-restaurants">
            {topRestaurants.map(
              (restaurant, index) => (
                <div key={restaurant.id}>
                  <span className="analytics-rank">{index + 1}</span>
                  <img src={restaurant.RestaurantImage} alt={restaurant.Name}/>

                  <section>
                    <strong>{restaurant.Name}</strong>
                    <span>{restaurant.orderCount}{" "}orders</span>
                  </section>
                  <strong>₹{restaurant.revenue.toLocaleString("en-IN")}</strong>
                </div>
              )
            )}
          </div>
        </article>
      </section>

      {/* TOP FOOD */}
      <section className="analytics-card analytics-food-section">
        <header>
          <div>
            <h2>Top Selling Food</h2>
            <p>Most ordered items</p>
          </div>
          <FaUtensils />
        </header>

        <div className="analytics-food-grid">
          {topFoods.map(
            (food, index) => (
              <article key={food.id}>
                <span>#{index + 1}</span>
                <img src={food.image} alt={food.name}/>
                <div>
                  <strong>{food.name}</strong>
                  <p>{food.quantity} {" "}items sold</p>
                  <small>₹{food.revenue.toLocaleString("en-IN")}</small>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {/* RECENT ORDERS */}
      <section className="analytics-card">
        <header>
          <div>
            <h2>Recent Orders</h2>
            <p>Latest customer orders</p>
          </div>
          <FaTruck />
        </header>

        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(
                (order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer ?.fullName || "Customer"}</td>
                    <td>{order.restaurant ?.name || "N/A"}</td>
                    <td><strong>₹{order.bill ?.totalAmount || 0}</strong></td>
                    <td><span className="analytics-order-status">{order.orderStatus}</span></td>
                    <td>{formatDate(order.orderedAt)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default AdminAnalytics;