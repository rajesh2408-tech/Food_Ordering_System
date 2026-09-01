import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {FaUtensils, FaMagnifyingGlass, FaPlus, FaPen, FaTrash, FaStar, FaIndianRupeeSign, FaStore, FaCheck, FaXmark, FaRotate, FaFire, } from "react-icons/fa6";
import "../../styles/Layout.css";
import { BASE_URL } from "../../utils/api";

const emptyFood = {
  Name: "",
  Description: "",
  Category: "",
  FoodType: "Veg",
  Price: 0,
  Discount: 0,
  DiscountedPrice: 0,
  Image: "",
  Rating: 0,
  TotalReviews: 0,
  IsAvailable: true,
  IsBestSeller: false,
  IsRecommended: false,
  PreparationTime: "",
  Nutrition: {
    ServingSize: "1 serving",
    Calories: 0,
    Protein: "0g",
    Carbohydrates: "0g",
    Fat: "0g",
    Fiber: "0g",
    Sugar: "0g",
    Sodium: "0mg",
  },
  Allergens: [],
};

const AdminFoodItems = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [foodTypeFilter, setFoodTypeFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [modalType, setModalType] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [formFood, setFormFood] = useState(emptyFood);
  const [allergenInput, setAllergenInput] = useState("");
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
      setMessage("Unable to load food items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  // FLATTEN ITEMS
  const foodItems = useMemo(() => {
    return restaurants.flatMap((restaurant) =>
      (restaurant.Items || []).map((item) => ({
        ...item,
        restaurantId: restaurant.id,
        restaurantName: restaurant.Name,
        restaurantImage: restaurant.RestaurantImage,
      }
    ))
    );
  }, [restaurants]);

  // CATEGORIES
  const categories = useMemo(() => {
    return [...new Set(foodItems.map((item) => item.Category).filter(Boolean)),].sort();
  }, [foodItems]);

  // STATISTICS
  const statistics = useMemo(() => {
    return {
      total: foodItems.length,
      available: foodItems.filter((item) => item.IsAvailable).length,
      veg: foodItems.filter((item) => item.FoodType === "Veg").length,
      nonVeg: foodItems.filter((item) => item.FoodType === "Non-Veg").length,
      bestSeller: foodItems.filter((item) => item.IsBestSeller).length,
    };
  }, [foodItems]);

  // FILTER
  const filteredFoods = useMemo(() => {
    const value = search.toLowerCase().trim();

    return foodItems.filter((item) => {
      const searchMatch = !value || item.Name?.toLowerCase().includes(value) || item.Category?.toLowerCase().includes(value) || item.restaurantName ?.toLowerCase().includes(value);
      const restaurantMatch = restaurantFilter === "All" || item.restaurantId === restaurantFilter;
      const categoryMatch = categoryFilter === "All" || item.Category === categoryFilter;
      const foodTypeMatch = foodTypeFilter === "All" || item.FoodType === foodTypeFilter;
      const availabilityMatch = availabilityFilter === "All" || (availabilityFilter === "Available" && item.IsAvailable) || (availabilityFilter === "Unavailable" && !item.IsAvailable);
      return (searchMatch && restaurantMatch && categoryMatch && foodTypeMatch && availabilityMatch);
    });
  }, [foodItems, search, restaurantFilter, categoryFilter, foodTypeFilter, availabilityFilter, ]);

  // MODAL
  const openAdd = () => {
    setFormFood(emptyFood);
    setSelectedRestaurantId(restaurants[0]?.id || "");
    setAllergenInput("");
    setModalType("add");
    document.body.style.overflow = "hidden";
  };

  const openEdit = (item) => {
    setSelectedRestaurantId(item.restaurantId);
    setFormFood({...emptyFood, ...item, Nutrition: {...emptyFood.Nutrition, ...(item.Nutrition || {}), }, });
    setAllergenInput((item.Allergens || []).join(", "));
    setModalType("edit");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalType(null);
    document.body.style.overflow = "auto";
  };

  // FORM
  const handleChange = (event) => {
    const {name, value, type, checked, } = event.target;
    setFormFood((previous) => ({...previous, [name]: type === "checkbox" ? checked : value, }));
  };

  const handleNutrition = (event) => {
    const { name, value } = event.target;
    setFormFood((previous) => ({...previous, Nutrition: {...previous.Nutrition, [name]: value, }, }));
  };

  // SAVE
  const saveFood = async (event) => {
    event.preventDefault();
    if (!selectedRestaurantId) {
      alert("Select a restaurant.");
      return;
    }

    if (!formFood.Name.trim()) {
      alert("Food name is required.");
      return;
    }

    try {
      setSaving(true);
      const restaurant = restaurants.find((item) =>item.id === selectedRestaurantId);
      if (!restaurant) return;
      const allergens = allergenInput.split(",").map((item) => item.trim()).filter(Boolean);
      const price = Number(formFood.Price) || 0;
      const discount = Number(formFood.Discount) || 0;
      const calculatedDiscountPrice = discount > 0 ? Math.round(price - (price * discount) / 100) : price;

      const cleanFood = {
        ...formFood,
        Price: price,
        Discount: discount,
        DiscountedPrice: calculatedDiscountPrice,
        Rating: Number(formFood.Rating) || 0,
        TotalReviews: Number(formFood.TotalReviews) || 0,
        Nutrition: {...formFood.Nutrition, Calories: Number(formFood.Nutrition?.Calories) || 0, },
        Allergens: allergens,
      };
      delete cleanFood.restaurantId;
      delete cleanFood.restaurantName;
      delete cleanFood.restaurantImage;

      let updatedItems;

      // ADD
      if (modalType === "add") {
        const newFood = {...cleanFood, id: `ITEM${Date.now()}`, };
        updatedItems = [...(restaurant.Items || []), newFood, ];
      }

      // EDIT
      if (modalType === "edit") {
        updatedItems = (restaurant.Items || []).map((item) => item.id === formFood.id ? cleanFood : item);
      }

      const response = await axios.patch(`${BASE_URL}/restaurants/${selectedRestaurantId}`, {Items: updatedItems, });
      setRestaurants((previous) => previous.map((item) => item.id === selectedRestaurantId ? response.data : item));
      setMessage(modalType === "add" ? "Food item added successfully." : "Food item updated successfully.");
      closeModal();
    } catch (error) {
      console.error(error);
      setMessage("Unable to save food item.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const deleteFood = async (food) => {
    const confirmed = window.confirm(`Delete "${food.Name}"?`);
    if (!confirmed) return;
    try {
      const restaurant = restaurants.find((item) => item.id === food.restaurantId);
      if (!restaurant) return;
      const updatedItems = (restaurant.Items || []).filter((item) => item.id !== food.id);
      const response = await axios.patch(`${BASE_URL}/restaurants}/${food.restaurantId}`, {Items: updatedItems, });
      setRestaurants((previous) => previous.map((item) => item.id === food.restaurantId ? response.data : item));

      setMessage("Food item deleted.");
    } catch (error) {
      console.error(error);
    }
  };

  // TOGGLE AVAILABLE
  const toggleAvailability = async (food) => {
    try {
      const restaurant = restaurants.find((item) => item.id === food.restaurantId);
      const updatedItems = restaurant.Items.map((item) => item.id === food.id ? {...item, IsAvailable: !item.IsAvailable, } : item);
      const response = await axios.patch(`${BASE_URL}/restaurants/${food.restaurantId}`, {Items: updatedItems, });
      setRestaurants((previous) => previous.map((item) => item.id === food.restaurantId ? response.data : item));

    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="admin-food-loading">Loading food items...</div>
    );
  }
  return (
    <main className="admin-food-page">
      {message && (
        <div className="admin-food-message"><FaCheck />{message}</div>
      )}

      {/* HEADER */}
      <header className="admin-food-header">
        <div>
          <p>MENU MANAGEMENT</p>
          <h1>Food Items</h1>
          <span>Manage food items from every restaurant.</span>
        </div>

        <div>
          <button onClick={fetchRestaurants}><FaRotate />Refresh</button>
          <button className="admin-add-food" onClick={openAdd}><FaPlus />Add Food Item</button>
        </div>
      </header>

      {/* STATS */}
      <section className="admin-food-stats">
        <div>
          <span><FaUtensils /></span>
          <section>
            <small>Total Food Items</small>
            <strong>{statistics.total}</strong>
          </section>
        </div>

        <div>
          <span><FaCheck /></span>
          <section>
            <small>Available</small>
            <strong>{statistics.available}</strong>
          </section>
        </div>

        <div>
          <span>🟢</span>
          <section>
            <small>Veg Items</small>
            <strong>{statistics.veg}</strong>
          </section>
        </div>

        <div>
          <span>🔴</span>
          <section>
            <small>Non-Veg Items</small>
            <strong>{statistics.nonVeg}</strong>
          </section>
        </div>

        <div>
          <span><FaStar /></span>
          <section>
            <small>Best Sellers</small>
            <strong>{statistics.bestSeller}</strong>
          </section>
        </div>
      </section>

      {/* FILTERS */}
      <section className="admin-food-filters">
        <div>
          <FaMagnifyingGlass />
          <input value={search} onChange={(event) => setSearch(event.target.value) } placeholder="Search food, category or restaurant..."/>
        </div>

        <select value={restaurantFilter} onChange={(event) => setRestaurantFilter(event.target.value)}>
          <option value="All">All Restaurants</option>
          {restaurants.map((restaurant) => (
            <option value={restaurant.id} key={restaurant.id}>{restaurant.Name}</option>
          ))}
        </select>

        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option value={category} key={category}>{category}</option>
          ))}
        </select>

        <select value={foodTypeFilter} onChange={(event) => setFoodTypeFilter(event.target.value)}>
          <option value="All">All Types</option>
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
        </select>

        <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
          <option value="All">All Availability</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </section>

      {/* FOOD GRID */}
      <section className="admin-food-grid">
        {filteredFoods.map((food) => (

          <article className="admin-food-card" key={`${food.restaurantId}-${food.id}`}>
            <div className="admin-food-image">
              <img src={food.Image} alt={food.Name}/>
              <div className={food.FoodType === "Veg" ? "food-type-indicator veg" : "food-type-indicator nonveg"}>
                <span></span>
              </div>

              {food.IsBestSeller && (
                <span className="food-best-seller">BEST SELLER</span>
              )}
            </div>

            <div className="admin-food-content">
              <div className="admin-food-name">
                <div>
                  <h3>{food.Name}</h3>
                  <p>{food.Category}</p>
                </div>
                <span><FaStar />{food.Rating || 0}</span>
              </div>

              <p className="admin-food-description">{food.Description}</p>

              <div className="admin-food-restaurant">
                <FaStore />
                <span>{food.restaurantName}</span>
              </div>

              <div className="admin-food-price">
                <div>
                  <FaIndianRupeeSign />
                  <strong>₹{food.Discount > 0 ? food.DiscountedPrice : food.Price}</strong>
                  {food.Discount > 0 && (
                    <del>₹{food.Price}</del>
                  )}
                </div>

                {food.Discount > 0 && (
                  <span>{food.Discount}% OFF</span>
                )}
              </div>

              <div className="admin-food-meta">
                <span>
                  <FaFire />{food.Nutrition?.Calories || 0} {" "}kcal</span>
                <span>{food.PreparationTime || "N/A"}</span>
              </div>

              <div className="admin-food-actions">
                <button className="food-edit-button" onClick={() => openEdit(food)}><FaPen />Edit</button>
                <button className="food-delete-button" onClick={() => deleteFood(food)}><FaTrash /></button>
              </div>

              <label className="admin-food-availability">
                <span>Available for Order</span>
                <input type="checkbox" checked={Boolean(food.IsAvailable)} onChange={() => toggleAvailability(food)}/>
              </label>
            </div>
          </article>
        ))}
      </section>

          {/* ADD / EDIT MODAL */}
      {modalType && (
        <div className="food-modal-overlay">
          <form className="food-form-modal" onSubmit={saveFood}>

            <header>
              <div>
                <span>{modalType === "add" ? "NEW FOOD ITEM" : "EDIT FOOD ITEM"}</span>
                <h2>{modalType === "add" ? "Add Food Item" : formFood.Name}</h2>
              </div>
              <button type="button" onClick={closeModal}><FaXmark /></button>
            </header>

            <div className="food-form-content">

              <h3>Restaurant</h3>
              <label className="food-full-field">
                Select Restaurant
                <select value={selectedRestaurantId} onChange={(event) => setSelectedRestaurantId(event.target.value)} disabled={modalType === "edit"}>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.Name}
                    </option>
                  ))}
                </select>
              </label>

              <h3>Food Information</h3>
              <div className="food-form-grid">
                <label>
                  Food Name
                  <input name="Name" value={formFood.Name} onChange={handleChange} required/>
                </label>

                <label>
                  Category
                  <input name="Category" value={formFood.Category} onChange={handleChange} placeholder="Biryani"/>
                </label>

                <label>
                  Food Type
                  <select name="FoodType" value={formFood.FoodType} onChange={handleChange}>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </label>

                <label>
                  Preparation Time
                  <input name="PreparationTime" value={formFood.PreparationTime} onChange={handleChange} placeholder="20-25 mins"/>
                </label>

                <label className="food-full-field">
                  Description
                  <textarea name="Description" value={formFood.Description} onChange={handleChange}/>
                </label>

                <label className="food-full-field">
                  Food Image URL
                  <input name="Image" value={formFood.Image} onChange={handleChange}/>
                </label>
              </div>

              <h3>Pricing</h3>
              <div className="food-form-grid">
                <label>
                  Price
                  <input type="number" name="Price" value={formFood.Price} onChange={handleChange}/>
                </label>

                <label>
                  Discount %
                  <input type="number" name="Discount" value={formFood.Discount} onChange={handleChange}/>
                </label>

                <label>
                  Rating
                  <input type="number" step="0.1" min="0" max="5" name="Rating" value={formFood.Rating} onChange={handleChange}/>
                </label>
              </div>

              <h3>Nutrition</h3>
              <div className="food-form-grid">
                <label>
                  Serving Size
                  <input name="ServingSize" value={formFood.Nutrition.ServingSize} onChange={handleNutrition}/>
                </label>

                <label>
                  Calories
                  <input type="number" name="Calories" value={formFood.Nutrition.Calories} onChange={handleNutrition}/>
                </label>

                <label>
                  Protein
                  <input name="Protein" value={formFood.Nutrition.Protein} onChange={handleNutrition} placeholder="28g"/>
                </label>

                <label>
                  Carbohydrates
                  <input name="Carbohydrates" value={formFood.Nutrition.Carbohydrates} onChange={handleNutrition} placeholder="75g"/>
                </label>

                <label>
                  Fat
                  <input name="Fat" value={formFood.Nutrition.Fat} onChange={handleNutrition} placeholder="22g"/>
                </label>

                <label>
                  Fiber
                  <input name="Fiber" value={formFood.Nutrition.Fiber} onChange={handleNutrition} placeholder="4g"/>
                </label>

                <label>
                  Sugar
                  <input name="Sugar" value={formFood.Nutrition.Sugar} onChange={handleNutrition} placeholder="5g"/>
                </label>

                <label>
                  Sodium
                  <input name="Sodium" value={formFood.Nutrition.Sodium} onChange={handleNutrition} placeholder="900mg"/>
                </label>

                <label className="food-full-field">
                  Allergens
                  <input value={allergenInput} onChange={(event) => setAllergenInput(event.target.value)} placeholder="Milk, Nuts, Gluten"/>
                  <small>Separate allergens with commas</small>
                </label>
              </div>

              <h3>Options</h3>
              <div className="food-options">
                <label>
                  <input type="checkbox" name="IsAvailable" checked={formFood.IsAvailable} onChange={handleChange}/>
                  Available
                </label>
                <label>
                  <input type="checkbox" name="IsBestSeller" checked={formFood.IsBestSeller} onChange={handleChange}/>
                  Best Seller
                </label>
                <label>
                  <input type="checkbox" name="IsRecommended" checked={formFood.IsRecommended} onChange={handleChange}/>
                  Recommended
                </label>
              </div>
            </div>

            <footer>
              <button type="button" onClick={closeModal}>Cancel</button>
              <button type="submit" className="food-save-button" disabled={saving}>
                {saving ? "SAVING..." : modalType === "add" ? "ADD FOOD ITEM" : "SAVE CHANGES"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
};

export default AdminFoodItems;