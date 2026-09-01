import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import "../styles/restaurants.css";
import {BASE_URL} from "../utils/api";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("default");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // GET RESTAURANTS
  const getRestaurants = () => {
    // setLoading(true);

    axios.get(`${BASE_URL}/restaurants`).then((res) => {
      // console.log(res.data);
      setRestaurants(res.data);
    })
      .catch((err) => {
        console.error(err);
        alert("Unable to load restaurants");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getRestaurants();
  }, []);

  // OPEN RESTAURANT
  const openRestaurant = (restaurant) => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  // SORT
  const handleSort = (type) => {
    setSortType(type);
    setSortOpen(false);
  };

  const getSortedRestaurants = () => {
    const data = [...restaurants];

    switch (sortType) {
      case "rating":
        return data.sort((a, b) => b.Rating - a.Rating);

      case "delivery":
        return data.sort(
          (a, b) =>
            parseInt(a.DeliveryTime) - parseInt(b.DeliveryTime)
        );

      case "lowToHigh":
        return data.sort(
          (a, b) => a.AverageCostForTwo - b.AverageCostForTwo
        );

      case "highToLow":
        return data.sort(
          (a, b) => b.AverageCostForTwo - a.AverageCostForTwo
        );

      default:
        return data;
    }
  };

  const sortedRestaurants = getSortedRestaurants();

  return (
    <section className="restaurants-section">

      {/* ================= HEADER ================= */}

      <div className="restaurants-header">
        <h2>Restaurants with online food delivery in Hyderabad</h2>

        <div className="sort-container">
          <button className="sort-button" onClick={() => setSortOpen(!sortOpen)}>
            Sort By
            <IoChevronDown className={sortOpen ? "sort-arrow rotate" : "sort-arrow"} /></button>

          {sortOpen && (
            <div className="sort-dropdown">
              <button onClick={() => handleSort("default")}>Relevance</button>
              <button onClick={() => handleSort("rating")}>Rating</button>
              <button onClick={() => handleSort("delivery")}>Delivery Time</button>
              <button onClick={() => handleSort("lowToHigh")}>Cost: Low to High</button>
              <button onClick={() => handleSort("highToLow")}>Cost: High to Low</button>
            </div>
          )}
        </div>
      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="restaurants-message">
          Loading restaurants...
        </div>
      )}
      {!loading && (
        <div className="restaurants-grid">
          {sortedRestaurants.map((restaurant) => (

            <div className="restaurant-card" key={restaurant.id} onClick={() => openRestaurant(restaurant)}>
              <div className="restaurant-image-container">
                <img src={restaurant.RestaurantImage} alt={restaurant.Name} className="restaurant-image" />
                <div className="image-dark-gradient"></div>
                <div className="restaurant-offer">
                  ITEMS AT ₹{restaurant.MinimumOrder}
                </div>
              </div>
              <div className="restaurant-info">
                <h3>{restaurant.Name}</h3>
                <div className="restaurant-rating-row">
                  <span className="rating-icon"><FaStar /></span>
                  <span className="rating">{restaurant.Rating}</span>
                  <span className="dot">•</span>
                  <span className="delivery-time">{restaurant.DeliveryTime}</span>
                </div>
                <p className="restaurant-cuisine">{restaurant.Cuisine?.join(", ")}</p>
                <p className="restaurant-location">{restaurant.Address?.Street}</p>
              </div>
            </div>

          ))}
        </div>
      )}

      {!loading && restaurants.length === 0 && (
        <div className="restaurants-message">
          No restaurants found.
        </div>
      )}

    </section>
  );
};

export default Restaurants;