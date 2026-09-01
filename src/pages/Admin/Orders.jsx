import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {FaBagShopping,FaMagnifyingGlass,FaEye,FaTrash,FaXmark,FaLocationDot,FaPhone,FaStore,FaClock,FaIndianRupeeSign,FaUser,FaCreditCard,FaUtensils,FaRotate,FaCheck,FaTruck,FaFire,} from "react-icons/fa6";
import "../../styles/Layout.css";
import {BASE_URL} from "../../utils/api";
const AdminOrders = () => {
  
  // STATE
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/orders`);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMessage("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // AUTO REMOVE MESSAGE
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // ORDER STATISTICS
  const statistics = useMemo(() => {
    const total = orders.length;
    const placed = orders.filter((order) => order.orderStatus === "Order Placed").length;
    const preparing = orders.filter((order) => order.orderStatus === "Preparing").length;
    const delivery = orders.filter((order) => order.orderStatus === "Out for Delivery").length;
    const delivered = orders.filter((order) => order.orderStatus === "Delivered").length;
    const cancelled = orders.filter((order) => order.orderStatus === "Cancelled").length;
    return { total, placed, preparing, delivery, delivered, cancelled, };
  }, [orders]);

  // FILTER ORDERS
  const filteredOrders = useMemo(() => {
    const searchValue = search.toLowerCase().trim();
    return [...orders]
      .filter((order) => {
        const orderId = String(order.id || "").toLowerCase();
        const customerName = String(order.customer?.fullName || "" ).toLowerCase();
        const phone = String(order.customer?.phone || "").toLowerCase();
        const restaurantName = String(order.restaurant?.name || "" ).toLowerCase();
        const searchMatch = !searchValue || orderId.includes(searchValue) || customerName.includes(searchValue) || phone.includes(searchValue) || restaurantName.includes(searchValue);
        const statusMatch = statusFilter === "All" || order.orderStatus === statusFilter;
        const paymentMethod = order.payment?.method || "";
        const paymentMatch = paymentFilter === "All" || paymentMethod === paymentFilter;
        return searchMatch && statusMatch && paymentMatch;
      })
      .sort((a, b) => {return new Date(b.orderedAt) - new Date(a.orderedAt);});
  }, [orders, search, statusFilter, paymentFilter]);

  // OPEN ORDER DETAILS
  const openOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus || "Order Placed");
    document.body.style.overflow = "hidden";
  };

  // CLOSE ORDER DETAILS
  const closeOrder = () => {
    setSelectedOrder(null);
    setNewStatus("");
    document.body.style.overflow = "auto";
  };

  // UPDATE ORDER STATUS
  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      setUpdating(true);
      const updatedData = {orderStatus: newStatus, deliveryStatus: getDeliveryStatus(newStatus), updatedAt: new Date().toISOString(),};
      const response = await axios.patch(`${BASE_URL}/orders/${selectedOrder.id}`, updatedData);
      setOrders((previousOrders) => previousOrders.map((order) => order.id === selectedOrder.id ? {...order, ...response.data, } : order));
      setSelectedOrder((previous) => ({...previous, ...response.data, }));
      setMessage(`Order status updated to "${newStatus}".`);
    } catch (error) {
      console.error("Error updating order:", error);
      setMessage("Unable to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  // DELIVERY STATUS
  const getDeliveryStatus = (status) => {
    switch (status) {
      case "Order Placed":
        return "Waiting for restaurant confirmation";
      case "Preparing":
        return "Restaurant is preparing your order";
      case "Ready for Pickup":
        return "Order is ready for pickup";
      case "Out for Delivery":
        return "Delivery partner is on the way";
      case "Delivered":
        return "Order delivered successfully";
      case "Cancelled":
        return "Order has been cancelled";
      default:
        return "";
    }
  };

  // DELETE ORDER
  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this order?");
    if (!confirmed) return;
    try {
      await axios.delete(`${BASE_URL}/orders/${orderId}`);
      setOrders((previousOrders) => previousOrders.filter((order) => order.id !== orderId));
      if (selectedOrder?.id === orderId) {
        closeOrder();
      }
      setMessage("Order deleted successfully.");
    } catch (error) {
      console.error("Error deleting order:", error);
      setMessage("Unable to delete order.");
    }
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // PAYMENT NAME
  const getPaymentName = (payment) => {
    if (payment?.displayMethod) {
      return payment.displayMethod;
    }

    switch (payment?.method) {
      case "cod":
        return "Cash on Delivery";
      case "upi":
        return "UPI";
      case "card":
        return "Card";
      default:
        return "N/A";
    }
  };

  // STATUS CLASS
  const getStatusClass = (status) => {
    switch (status) {
      case "Order Placed":
        return "admin-order-status placed";
      case "Preparing":
        return "admin-order-status preparing";
      case "Ready for Pickup":
        return "admin-order-status ready";
      case "Out for Delivery":
        return "admin-order-status delivery";
      case "Delivered":
        return "admin-order-status delivered";
      case "Cancelled":
        return "admin-order-status cancelled";
      default:
        return "admin-order-status";
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="admin-orders-loading">
        <div className="admin-orders-loader"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <main className="admin-orders-page">
          {/* MESSAGE */}
      {message && (
        <div className="admin-orders-message">
          <FaCheck />
          <span>{message}</span>
        </div>
      )}

          {/* HEADER */}
      <header className="admin-orders-header">
        <div>
          <p className="admin-orders-small-title">ORDER MANAGEMENT</p>
          <h1>Orders</h1>
          <p className="admin-orders-description">Manage customer orders, payments and delivery status.</p>
        </div>
        <button className="admin-orders-refresh" onClick={fetchOrders}><FaRotate />Refresh</button>
      </header>

          {/* STATISTICS */}
      <section className="admin-order-statistics">
        <div className="admin-order-stat-card">
          <div className="admin-order-stat-icon total"><FaBagShopping /></div>
          <div>
            <span>Total Orders</span>
            <strong>{statistics.total}</strong>
          </div>
        </div>

        <div className="admin-order-stat-card">
          <div className="admin-order-stat-icon placed"><FaClock /></div>
          <div>
            <span>New Orders</span>
            <strong>{statistics.placed}</strong>
          </div>
        </div>

        <div className="admin-order-stat-card">
          <div className="admin-order-stat-icon preparing"><FaUtensils /></div>
          <div>
            <span>Preparing</span>
            <strong>{statistics.preparing}</strong>
          </div>
        </div>

        <div className="admin-order-stat-card">
          <div className="admin-order-stat-icon delivery"><FaTruck /></div>
          <div>
            <span>Out for Delivery</span>
            <strong>{statistics.delivery}</strong>
          </div>
        </div>

        <div className="admin-order-stat-card">
          <div className="admin-order-stat-icon delivered"><FaCheck /></div>
          <div>
            <span>Delivered</span>
            <strong>{statistics.delivered}</strong>
          </div>
        </div>
      </section>

          {/* FILTER SECTION */}
      <section className="admin-orders-filter-card">
        <div className="admin-orders-search">
          <FaMagnifyingGlass />
          <input type="text" placeholder="Search order ID, customer, phone or restaurant..." value={search} onChange={(event) => setSearch(event.target.value)}/>
        </div>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All Status</option>
          <option value="Order Placed">Order Placed</option>
          <option value="Preparing">Preparing</option>
          <option value="Ready for Pickup">Ready for Pickup</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
          <option value="All">All Payments</option>
          <option value="cod">Cash on Delivery</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
        </select>
      </section>

          {/* TABLE CARD */}
      <section className="admin-orders-table-card">
        <div className="admin-orders-table-header">
          <div>
            <h2>All Orders</h2>
            <p>Showing {filteredOrders.length} of {orders.length} orders</p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="admin-orders-empty">
            <FaBagShopping />
            <h3>No orders found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-main-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    {/* ORDER ID */}
                    <td><span className="admin-table-order-id">#{order.id}</span></td>

                    {/* CUSTOMER */}
                    <td>
                      <div className="admin-table-customer">
                        <div>{order.customer?.fullName ?.charAt(0) ?.toUpperCase() || "C"}</div>
                        <section>
                          <strong>{order.customer?.fullName || "Customer"}</strong>
                          <span>{order.customer?.phone || "N/A"}</span>
                        </section>
                      </div>
                    </td>

                    {/* RESTAURANT */}
                    <td>
                      <div className="admin-table-restaurant">
                        {order.restaurant?.image && (
                          <img src={order.restaurant.image} alt={order.restaurant.name}/>
                        )}
                        <span>{order.restaurant?.name || "N/A"}</span>
                      </div>
                    </td>

                    {/* ITEMS */}
                    <td><strong>{order.totalItems || order.items?.reduce((total, item) => total + Number(item.quantity || 0), 0 ) || 0}</strong></td>

                    {/* TOTAL */}
                    <td><strong className="admin-order-amount">₹{order.bill?.totalAmount || 0}</strong></td>

                    {/* PAYMENT */}
                    <td>
                      <div className="admin-payment-table">
                        <span>{getPaymentName(order.payment)}</span>
                        <small className={order.payment?.status === "Paid" ? "paid" : "pending"}>{order.payment?.status || "Pending"}</small>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td><span className={getStatusClass(order.orderStatus)}>{order.orderStatus || "Order Placed"}</span></td>

                    {/* DATE */}
                    <td><span className="admin-order-date">{formatDate(order.orderedAt)}</span></td>

                    {/* ACTION */}
                    <td>
                      <div className="admin-order-actions">
                        <button className="admin-view-order" onClick={() => openOrder(order)} title="View order"><FaEye /></button>
                        <button className="admin-delete-order" onClick={() => deleteOrder(order.id)} title="Delete order"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

          {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="admin-order-modal-overlay" onMouseDown={(event) => {if (event.target === event.currentTarget) {
          closeOrder();
          }}}>
          <div className="admin-order-modal">
            {/* MODAL HEADER */}
            <header className="admin-order-modal-header">
              <div>
                <span>ORDER DETAILS</span>
                <h2>#{selectedOrder.id}</h2>
                <p>Placed on {formatDate(selectedOrder.orderedAt)}</p>
              </div>
              <button onClick={closeOrder}><FaXmark /></button>
            </header>

            <div className="admin-order-modal-content">
                  {/* STATUS MANAGEMENT */}
              <section className="admin-order-detail-card admin-status-management">
                <div className="admin-detail-title">
                  <div className="admin-detail-icon"><FaBagShopping /></div>
                  <div>
                    <h3>Order Status</h3>
                    <p>Update the current progress of this order</p>
                  </div>
                </div>

                <div className="admin-current-status">
                  <span>Current Status</span>
                  <strong className={getStatusClass(selectedOrder.orderStatus)}>{selectedOrder.orderStatus}</strong>
                </div>

                <div className="admin-update-status">
                  <select value={newStatus} onChange={(event) => setNewStatus(event.target.value)}>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button onClick={updateOrderStatus} disabled={updating || newStatus === selectedOrder.orderStatus}>{updating ? "UPDATING..." : "UPDATE STATUS"}</button>
                </div>
                {selectedOrder.deliveryStatus && (
                  <p className="admin-delivery-status-text"><FaTruck />{selectedOrder.deliveryStatus}</p>
                )}
              </section>

                  {/* CUSTOMER + RESTAURANT */}
              <div className="admin-order-two-columns">
                {/* CUSTOMER */}
                <section className="admin-order-detail-card">
                  <div className="admin-detail-title">
                    <div className="admin-detail-icon customer"><FaUser /></div>
                    <div>
                      <h3>Customer</h3>
                      <p>Customer information</p>
                    </div>
                  </div>

                  <div className="admin-detail-information">
                    <div>
                      <span>Name</span>
                      <strong>{selectedOrder.customer?.fullName || "N/A"}</strong>
                    </div>
                    <div>
                      <span><FaPhone />Phone</span>
                      <strong>{selectedOrder.customer?.phone || "N/A"}</strong>
                    </div>
                  </div>
                </section>

                {/* RESTAURANT */}
                <section className="admin-order-detail-card">
                  <div className="admin-detail-title">
                    <div className="admin-detail-icon restaurant"><FaStore /></div>
                    <div>
                      <h3>Restaurant</h3>
                      <p>Restaurant information</p>
                    </div>
                  </div>

                  <div className="admin-modal-restaurant">
                    {selectedOrder.restaurant?.image && (
                      <img src={selectedOrder.restaurant.image} alt={selectedOrder.restaurant.name}/>
                    )}

                    <div>
                      <strong>{selectedOrder.restaurant?.name || "N/A"}</strong>
                      <span>{selectedOrder.restaurant?.address || ""}</span>
                      <span>{selectedOrder.restaurant?.city || ""}</span>
                    </div>
                  </div>
                </section>
              </div>

                  {/* DELIVERY ADDRESS */}
              <section className="admin-order-detail-card">
                <div className="admin-detail-title">
                  <div className="admin-detail-icon location"><FaLocationDot /></div>
                  <div>
                    <h3>Delivery Address</h3>
                    <p>Order delivery destination</p>
                  </div>
                </div>

                <div className="admin-address-box">
                  <FaLocationDot />
                  <div>
                    <strong>
                      {selectedOrder.deliveryAddress?.fullAddress ||
                        [
                          selectedOrder.deliveryAddress?.house,
                          selectedOrder.deliveryAddress?.area,
                          selectedOrder.deliveryAddress?.landmark,
                          selectedOrder.deliveryAddress?.city,
                          selectedOrder.deliveryAddress?.state,
                          selectedOrder.deliveryAddress?.pincode,
                        ].filter(Boolean).join(", ")}
                    </strong>
                  </div>
                </div>
              </section>

                  {/* ORDERED ITEMS */}
              <section className="admin-order-detail-card">
                <div className="admin-detail-title">
                  <div className="admin-detail-icon food"><FaUtensils /></div>
                  <div>
                    <h3>Ordered Items</h3>
                    <p>{selectedOrder.totalItems || selectedOrder.items?.length || 0}{" "} items</p>
                  </div>
                </div>

                <div className="admin-modal-items">
                  {selectedOrder.items?.map((item, index) => (
                    <article className="admin-modal-food-item" key={`${item.id}-${index}`}>
                      <div className="admin-modal-food-main">
                        {item.Image && (
                          <img src={item.Image} alt={item.Name}/>
                        )}

                        <div className="admin-modal-food-info">
                          <div className={item.FoodType === "Veg" ? "admin-food-type veg" : "admin-food-type nonveg"}>
                            <span></span>
                          </div>
                          <h4>{item.Name}</h4>
                          <p>{item.Category}</p>
                          <span>₹{item.finalPrice || item.DiscountedPrice || item.Price}{" "} × {item.quantity}</span>
                        </div>
                        <strong className="admin-modal-item-total">₹{item.totalPrice || (item.finalPrice || item.DiscountedPrice || item.Price) * item.quantity}</strong>
                      </div>

                      {/* NUTRITION */}
                      {item.Nutrition &&
                        Object.keys(item.Nutrition).length > 0 && (
                          <div className="admin-item-nutrition">
                            <div className="admin-item-nutrition-title">
                              <span><FaFire />Nutrition</span>
                              <strong>{item.Nutrition.Calories || 0} kcal</strong>
                            </div>
                            <div className="admin-item-nutrition-grid">
                              <div>
                                <span>Protein</span>
                                <strong>{item.Nutrition.Protein || "N/A"}</strong>
                              </div>
                              <div>
                                <span>Carbs</span>
                                <strong>{item.Nutrition.Carbohydrates || "N/A"}</strong>
                              </div>
                              <div>
                                <span>Fat</span>
                                <strong>{item.Nutrition.Fat || "N/A"}</strong>
                              </div>
                              <div>
                                <span>Fiber</span>
                                <strong>{item.Nutrition.Fiber || "N/A"}</strong>
                              </div>
                              <div>
                                <span>Sugar</span>
                                <strong>{item.Nutrition.Sugar || "N/A"}</strong>
                              </div>
                              <div>
                                <span>Sodium</span>
                                <strong>{item.Nutrition.Sodium || "N/A"}</strong>
                              </div>
                            </div>
                          </div>
                        )}
                    </article>
                  ))}
                </div>
              </section>

                  {/* TOTAL ORDER NUTRITION */}
              {selectedOrder.nutrition && (
                <section className="admin-order-detail-card">
                  <div className="admin-detail-title">
                    <div className="admin-detail-icon nutrition"><FaFire /></div>
                    <div>
                      <h3>Total Order Nutrition</h3>
                      <p>Combined nutrition based on item quantities</p>
                    </div>
                  </div>

                  <div className="admin-total-nutrition">
                    <div>
                      <span>Calories</span>
                      <strong>{Math.round(selectedOrder.nutrition.calories || 0)}{" "}kcal</strong>
                    </div>

                    <div>
                      <span>Protein</span>
                      <strong>{selectedOrder.nutrition.protein || 0}g</strong>
                    </div>

                    <div>
                      <span>Carbohydrates</span>
                      <strong>{selectedOrder.nutrition.carbohydrates || 0}g</strong>
                    </div>

                    <div>
                      <span>Fat</span>
                      <strong>{selectedOrder.nutrition.fat || 0}g</strong>
                    </div>

                    <div>
                      <span>Fiber</span>
                      <strong>{selectedOrder.nutrition.fiber || 0}g</strong>
                    </div>

                    <div>
                      <span>Sugar</span>
                      <strong>{selectedOrder.nutrition.sugar || 0}g</strong>
                    </div>

                    <div>
                      <span>Sodium</span>
                      <strong>{selectedOrder.nutrition.sodium || 0}mg</strong>
                    </div>
                  </div>

                  {selectedOrder.allergens?.length > 0 && (
                    <div className="admin-order-allergens">
                      <strong>⚠ Allergens</strong>
                      <div>
                        {selectedOrder.allergens.map((allergen) => (
                          <span key={allergen}>{allergen}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

                  {/* PAYMENT + BILL */}
              <div className="admin-order-two-columns">
                {/* PAYMENT */}
                <section className="admin-order-detail-card">
                  <div className="admin-detail-title">
                    <div className="admin-detail-icon payment"><FaCreditCard /></div>
                    <div>
                      <h3>Payment</h3>
                      <p>Payment information</p>
                    </div>
                  </div>

                  <div className="admin-detail-information">
                    <div>
                      <span>Method</span>
                      <strong>{getPaymentName(selectedOrder.payment)}</strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong className={selectedOrder.payment?.status === "Paid" ? "admin-payment-paid" : "admin-payment-pending"}>
                        {selectedOrder.payment?.status || "Pending"}
                      </strong>
                    </div>
                  </div>
                </section>

                {/* BILL */}
                <section className="admin-order-detail-card">
                  <div className="admin-detail-title">
                    <div className="admin-detail-icon bill">
                      <FaIndianRupeeSign />
                    </div>

                    <div>
                      <h3>Bill Details</h3>
                      <p>Order payment summary</p>
                    </div>
                  </div>

                  <div className="admin-modal-bill">
                    <div>
                      <span>Item Total</span>
                      <strong>₹{selectedOrder.bill?.itemTotal || 0}</strong>
                    </div>

                    <div>
                      <span>Delivery Fee</span>
                      <strong>{selectedOrder.bill?.deliveryFee === 0 ? "FREE" : `₹${selectedOrder.bill?.deliveryFee || 0}`}</strong>
                    </div>

                    <div>
                      <span>Platform Fee</span>
                      <strong>₹{selectedOrder.bill?.platformFee || 0}</strong>
                    </div>

                    <div>
                      <span>GST</span>
                      <strong>₹{selectedOrder.bill?.gst || 0}</strong>
                    </div>

                    <div className="admin-modal-total">
                      <span>Total</span>
                      <strong>₹{selectedOrder.bill?.totalAmount || 0}</strong>
                    </div>
                  </div>
                </section>
              </div>

              {/* DELETE */}
              <section className="admin-order-danger-zone">
                <div>
                  <strong>Delete Order</strong>
                  <p>Permanently remove this order from the database.</p>
                </div>
                <button onClick={() => deleteOrder(selectedOrder.id)}><FaTrash />Delete Order</button>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;