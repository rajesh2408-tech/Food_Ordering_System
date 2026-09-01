import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {FaStore, FaMagnifyingGlass, FaEye, FaPen, FaTrash, FaPlus, FaXmark, FaStar, FaLocationDot, FaClock, FaIndianRupeeSign, FaUtensils, FaPhone, FaEnvelope, FaRotate, FaCheck, } from "react-icons/fa6";
import "../../styles/Layout.css";
import { BASE_URL } from "../../utils/api";

const emptyRestaurant = {
  Name: "",
  OwnerId: "",
  Description: "",
  RestaurantImage: "",
  CoverImage: "",
  Cuisine: [],
  FoodType: "Both",
  Rating: 0,
  TotalReviews: 0,
  AverageCostForTwo: 0,
  DeliveryTime: "",
  DeliveryFee: 0,
  MinimumOrder: 0,
  Address: {Street: "", City: "", State: "", Pincode: "", Country: "India", },
  Contact: {Phone: "", Email: "", },
  OpeningTime: "",
  ClosingTime: "",
  IsOpen: true,
  Status: "Active",
  Items: [],
};
const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [foodTypeFilter, setFoodTypeFilter] = useState("All");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [formRestaurant, setFormRestaurant] = useState(emptyRestaurant);
  const [modalType, setModalType] = useState(null);
  const [cuisineInput, setCuisineInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // FETCH
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/restaurants`);
      setRestaurants(response.data || []);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // MESSAGE
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {setMessage("");}, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // STATISTICS
  const statistics = useMemo(() => {
    const active = restaurants.filter((restaurant) => restaurant.Status === "Active").length;
    const open = restaurants.filter((restaurant) => restaurant.IsOpen).length;
    const totalItems = restaurants.reduce((total, restaurant) => total + (restaurant.Items?.length || 0), 0);
    const averageRating = restaurants.length > 0 ? restaurants.reduce((total, restaurant) => total + Number(restaurant.Rating || 0), 0) / restaurants.length : 0;
    return {total: restaurants.length, active, open, totalItems, averageRating, };
  }, [restaurants]);

  // FILTER
  const filteredRestaurants = useMemo(() => {
    const value = search.toLowerCase().trim();

    return restaurants.filter((restaurant) => {
      const searchMatch = !value || String(restaurant.Name || "").toLowerCase().includes(value) || String(restaurant.Address?.City || "").toLowerCase().includes(value) ||
        restaurant.Cuisine?.some((cuisine) => cuisine.toLowerCase().includes(value));
      const statusMatch = statusFilter === "All" || restaurant.Status === statusFilter;
      const foodTypeMatch = foodTypeFilter === "All" || restaurant.FoodType === foodTypeFilter;
      return searchMatch && statusMatch && foodTypeMatch;
    });
  }, [restaurants, search, statusFilter, foodTypeFilter,
  ]);

  // OPEN MODALS
  const openView = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalType("view");
    document.body.style.overflow = "hidden";
  };
  const openAdd = () => {
    setFormRestaurant(emptyRestaurant);
    setCuisineInput("");
    setModalType("add");
    document.body.style.overflow = "hidden";
  };
  const openEdit = (restaurant) => {
    setFormRestaurant({
      ...restaurant,
      Address: {...emptyRestaurant.Address, ...(restaurant.Address || {}), },
      Contact: {...emptyRestaurant.Contact, ...(restaurant.Contact || {}), },
      Cuisine: restaurant.Cuisine || [],
      Items: restaurant.Items || [],
    });
    setCuisineInput((restaurant.Cuisine || []).join(", "));
    setModalType("edit");
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedRestaurant(null);
    document.body.style.overflow = "auto";
  };

  // FORM CHANGE
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormRestaurant((previous) => ({...previous, [name]: type === "checkbox" ? checked : value,}));
  };
  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setFormRestaurant((previous) => ({...previous, Address: {...previous.Address, [name]: value, }, }));
  };
  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setFormRestaurant((previous) => ({...previous, Contact: {...previous.Contact, [name]: value,}, }));
  };

  // SAVE RESTAURANT
  const saveRestaurant = async (event) => {
    event.preventDefault();

    if (!formRestaurant.Name.trim()) {
      alert("Restaurant name is required.");
      return;
    }

    try {
      setSaving(true);
      const cuisine = cuisineInput.split(",").map((item) => item.trim()).filter(Boolean);

      const restaurantData = {
        ...formRestaurant,
        Cuisine: cuisine,
        Rating: Number(formRestaurant.Rating) || 0,
        TotalReviews: Number(formRestaurant.TotalReviews) || 0,
        AverageCostForTwo: Number(formRestaurant.AverageCostForTwo) || 0,
        DeliveryFee: Number(formRestaurant.DeliveryFee) || 0,
        MinimumOrder: Number(formRestaurant.MinimumOrder) || 0,
      };
      if (modalType === "add") {
        const newRestaurant = {...restaurantData, id: `RES${Date.now()}`,};
        const response = await axios.post(`${BASE_URL}/restaurants`, newRestaurant);
        setRestaurants((previous) => [...previous, response.data,]);
        setMessage("Restaurant added successfully.");
      }

      if (modalType === "edit") {
        const response = await axios.patch(`${BASE_URL}/restaurants/${formRestaurant.id}`, restaurantData);
        setRestaurants((previous) => previous.map((restaurant) => restaurant.id === formRestaurant.id ? response.data : restaurant));
        setMessage("Restaurant updated successfully.");
      }
      closeModal();
    } catch (error) {
      console.error(error);

      setMessage("Unable to save restaurant.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const deleteRestaurant = async (id) => {
    const confirmed = window.confirm("Delete this restaurant permanently?");

    if (!confirmed) return;
    try {
      await axios.delete(`${BASE_URL}/restaurants/${id}`);
      setRestaurants((previous) => previous.filter((restaurant) => restaurant.id !== id));
      closeModal();

      setMessage("Restaurant deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete restaurant.");
    }
  };

  // TOGGLE STATUS
  const toggleRestaurant = async (restaurant) => {
    try {
      const response = await axios.patch(`${BASE_URL}/restaurants/${restaurant.id}`, {IsOpen: !restaurant.IsOpen,});
      setRestaurants((previous) => previous.map((item) => item.id === restaurant.id ? {...item, ...response.data, } : item));
    } catch (error) {
      console.error(error);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="admin-restaurants-loading">Loading restaurants...</div>
    );
  }

  return (
    <main className="admin-restaurants-page">
      {message && (
        <div className="admin-restaurant-message"><FaCheck />{message}</div>
      )}

      {/* HEADER */}
      <header className="admin-restaurants-header">
        <div>
          <p>RESTAURANT MANAGEMENT</p>
          <h1>Restaurants</h1>
          <span>Manage restaurants, availability, cuisines and restaurant information.</span>
        </div>
        <div className="admin-restaurant-header-actions">
          <button className="restaurant-refresh" onClick={fetchRestaurants}><FaRotate />Refresh</button>
          <button className="restaurant-add-button" onClick={openAdd}><FaPlus />Add Restaurant</button>
        </div>
      </header>

      {/* STATISTICS */}
      <section className="admin-restaurant-stats">
        <div>
          <span className="restaurant-stat-icon total"><FaStore /></span>
          <section>
            <small>Total Restaurants</small>
            <strong>{statistics.total}</strong>
          </section>
        </div>

        <div>
          <span className="restaurant-stat-icon active"><FaCheck /></span>
          <section>
            <small>Active</small>
            <strong>{statistics.active}</strong>
          </section>
        </div>

        <div>
          <span className="restaurant-stat-icon open"><FaClock /></span>
          <section>
            <small>Currently Open</small>
            <strong>{statistics.open}</strong>
          </section>
        </div>

        <div>
          <span className="restaurant-stat-icon foods"><FaUtensils /></span>
          <section>
            <small>Food Items</small>
            <strong>{statistics.totalItems}</strong>
          </section>
        </div>

        <div>
          <span className="restaurant-stat-icon rating"><FaStar /></span>
          <section>
            <small>Average Rating</small>
            <strong>{statistics.averageRating.toFixed(1)}</strong>
          </section>
        </div>
      </section>

      {/* FILTER */}
      <section className="admin-restaurant-filters">
        <div className="admin-restaurant-search">
          <FaMagnifyingGlass />
          <input type="text" placeholder="Search restaurant, city or cuisine..." value={search} onChange={(event) => setSearch(event.target.value)}/>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select value={foodTypeFilter} onChange={(event) => setFoodTypeFilter(event.target.value)}>
          <option value="All">All Food Types</option>
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
          <option value="Both">Both</option>
        </select>
      </section>

      {/* RESTAURANTS GRID */}
      <section className="admin-restaurant-card-container">
        {filteredRestaurants.map((restaurant) => (
          <article className="admin-restaurant-card" key={restaurant.id}>

            <div className="admin-restaurant-image">
              <img src={restaurant.RestaurantImage || restaurant.CoverImage} alt={restaurant.Name}/>
              <span className={restaurant.IsOpen ? "restaurant-open-badge" : "restaurant-closed-badge"}>{restaurant.IsOpen ? "OPEN" : "CLOSED"}</span>
              <span className="restaurant-rating"><FaStar />{restaurant.Rating || 0}</span>
            </div>

            <div className="admin-restaurant-card-content">
              <div className="restaurant-name-row">
                <div>
                  <h3>{restaurant.Name}</h3>
                  <p><FaLocationDot />{restaurant.Address?.City || "N/A"}</p>
                </div>
                <span className={restaurant.Status === "Active" ? "restaurant-active-status" : "restaurant-inactive-status"}>{restaurant.Status}</span>
              </div>

              <p className="restaurant-description">{restaurant.Description}</p>

              <div className="restaurant-cuisines">
                {restaurant.Cuisine?.slice(0, 4)
                  .map((cuisine) => (
                    <span key={cuisine}>{cuisine}</span>
                  ))}
              </div>

              <div className="restaurant-card-details">
                <div>
                  <FaClock />
                  <span>{restaurant.DeliveryTime || "N/A"}</span>
                </div>
                <div>
                  <FaIndianRupeeSign />
                  <span>₹{restaurant.AverageCostForTwo || 0} {" "}for two</span>
                </div>

                <div>
                  <FaUtensils />
                  <span>{restaurant.Items?.length || 0} Items</span>
                </div>
              </div>

              <div className="restaurant-card-actions">
                <button className="restaurant-view" onClick={() => openView(restaurant)}><FaEye />View</button>
                <button className="restaurant-edit" onClick={() => openEdit(restaurant)}><FaPen /></button>
                <button className="restaurant-delete" onClick={() => deleteRestaurant(restaurant.id)}><FaTrash /></button>
              </div>

              <label className="restaurant-availability">
                <span>Accepting Orders</span>
                <input type="checkbox" checked={Boolean(restaurant.IsOpen)} onChange={() => toggleRestaurant(restaurant)}/>
              </label>
            </div>
          </article>
        ))}
      </section>

      {filteredRestaurants.length === 0 && (
        <div className="admin-restaurants-empty">
          <FaStore />
          <h3>No restaurants found</h3>
        </div>
      )}

      {/* VIEW MODAL */}
      {modalType === "view" && selectedRestaurant && (
        <div className="restaurant-modal-overlay">
          <div className="restaurant-view-modal">
            <header>
              <div>
                <span>RESTAURANT DETAILS</span>
                <h2>{selectedRestaurant.Name}</h2>
              </div>
              <button onClick={closeModal}><FaXmark /></button>
            </header>

            <div className="restaurant-view-content">
              <img className="restaurant-view-cover" src={selectedRestaurant.CoverImage || selectedRestaurant.RestaurantImage} alt={selectedRestaurant.Name}/>
              <div className="restaurant-view-information">
                <section>
                  <h3>Restaurant Information</h3>
                  <p>{selectedRestaurant.Description}</p>
                  <div>
                    <span><FaStar />{selectedRestaurant.Rating}</span>
                    <span><FaClock />{selectedRestaurant.DeliveryTime}</span>
                    <span>₹{selectedRestaurant.AverageCostForTwo}{" "}for two</span>
                  </div>
                </section>

                <section>
                  <h3>Address</h3>
                  <p>
                    <FaLocationDot />
                    {[
                      selectedRestaurant.Address?.Street,
                      selectedRestaurant.Address?.City,
                      selectedRestaurant.Address?.State,
                      selectedRestaurant.Address?.Pincode,
                    ].filter(Boolean).join(", ")}
                  </p>
                </section>

                <section>
                  <h3>Contact</h3>
                  <p><FaPhone />{selectedRestaurant.Contact?.Phone}</p>
                  <p><FaEnvelope />{selectedRestaurant.Contact?.Email}</p>
                </section>

                <section>
                  <h3>Cuisines</h3>
                  <div className="restaurant-view-cuisines">
                    {selectedRestaurant.Cuisine?.map(
                      (cuisine) => (<span key={cuisine}>{cuisine}</span>)
                    )}
                  </div>
                </section>
              </div>
            </div>

            <footer>
              <button onClick={() => openEdit(selectedRestaurant)}><FaPen />Edit Restaurant</button>
            </footer>
          </div>
        </div>
      )}


      {/* ADD / EDIT MODAL */}
      {(modalType === "add" ||
        modalType === "edit") && (
        <div className="restaurant-modal-overlay">
          <form className="restaurant-form-modal" onSubmit={saveRestaurant}>
            <header>
              <div>
                <span>{modalType === "add" ? "NEW RESTAURANT" : "EDIT RESTAURANT"}</span>
                <h2>{modalType === "add" ? "Add Restaurant" : formRestaurant.Name}</h2>
              </div>
              <button type="button" onClick={closeModal}><FaXmark /></button>
            </header>

            <div className="restaurant-form-content">
              <h3>Basic Information</h3>
              <div className="restaurant-form-grid">
                <label>
                  Restaurant Name
                  <input name="Name" value={formRestaurant.Name} onChange={handleChange} required/>
                </label>

                <label>
                  Owner ID
                  <input name="OwnerId" value={formRestaurant.OwnerId} onChange={handleChange}/>
                </label>

                <label className="restaurant-full-field">
                  Description
                  <textarea name="Description" value={formRestaurant.Description} onChange={handleChange}/>
                </label>

                <label className="restaurant-full-field">
                  Restaurant Image URL
                  <input name="RestaurantImage" value={formRestaurant.RestaurantImage} onChange={handleChange}/>
                </label>

                <label className="restaurant-full-field">
                  Cover Image URL
                  <input name="CoverImage" value={formRestaurant.CoverImage} onChange={handleChange}/>
                </label>

                <label className="restaurant-full-field">
                  Cuisines
                  <input value={cuisineInput} onChange={(event) => setCuisineInput(event.target.value)} placeholder="Biryani, South Indian, Dosa"/>
                  <small>Separate cuisines using commas</small>
                </label>
              </div>

              <h3>Restaurant Details</h3>
              <div className="restaurant-form-grid">
                <label>
                  Food Type
                  <select name="FoodType" value={formRestaurant.FoodType} onChange={handleChange}>
                    <option value="Both">Both</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </label>

                <label>
                  Rating
                  <input type="number" step="0.1" min="0" max="5" name="Rating" value={formRestaurant.Rating} onChange={handleChange} />
                </label>

                <label>
                  Average Cost For Two
                  <input type="number" name="AverageCostForTwo" value={formRestaurant.AverageCostForTwo} onChange={handleChange}/>
                </label>

                <label>
                  Delivery Time
                  <input name="DeliveryTime" value={formRestaurant.DeliveryTime} onChange={handleChange} placeholder="20-30 mins"/>
                </label>

                <label>
                  Delivery Fee
                  <input type="number" name="DeliveryFee" value={formRestaurant.DeliveryFee} onChange={handleChange}/>
                </label>

                <label>
                  Minimum Order
                  <input type="number" name="MinimumOrder" value={formRestaurant.MinimumOrder} onChange={handleChange}/>
                </label>

                <label>
                  Opening Time
                  <input name="OpeningTime" value={formRestaurant.OpeningTime} onChange={handleChange} placeholder="11:00 AM"/>
                </label>

                <label>
                  Closing Time
                  <input name="ClosingTime" value={formRestaurant.ClosingTime} onChange={handleChange} placeholder="10:30 PM"/>
                </label>

                <label>
                  Status
                  <select name="Status" value={formRestaurant.Status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <h3>Address</h3>
              <div className="restaurant-form-grid">
                <label className="restaurant-full-field">
                  Street
                  <input name="Street" value={formRestaurant.Address.Street} onChange={handleAddressChange}/>
                </label>

                <label>
                  City
                  <input name="City" value={formRestaurant.Address.City} onChange={handleAddressChange}/>
                </label>

                <label>
                  State
                  <input name="State" value={formRestaurant.Address.State} onChange={handleAddressChange}/>
                </label>

                <label>
                  Pincode
                  <input name="Pincode" value={formRestaurant.Address.Pincode} onChange={handleAddressChange}/>
                </label>

                <label>
                  Country
                  <input name="Country" value={formRestaurant.Address.Country} onChange={handleAddressChange}/>
                </label>
              </div>

              <h3>Contact</h3>
              <div className="restaurant-form-grid">
                <label>
                  Phone
                  <input name="Phone" value={formRestaurant.Contact.Phone} onChange={handleContactChange}/>
                </label>

                <label>
                  Email
                  <input name="Email" value={formRestaurant.Contact.Email} onChange={handleContactChange}/>
                </label>
              </div>
            </div>

            <footer>
              <button type="button" className="restaurant-form-cancel" onClick={closeModal}>Cancel</button>
              <button type="submit" className="restaurant-form-save" disabled={saving}>
                {saving ? "SAVING..." : modalType === "add" ? "ADD RESTAURANT" : "SAVE CHANGES"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
};

export default AdminRestaurants;