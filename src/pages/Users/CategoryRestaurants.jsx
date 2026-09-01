import React, {useEffect, useState, } from "react";
import axios from "axios";
import {useNavigate, useParams, } from "react-router-dom";
import {FaArrowLeft, FaStar, } from "react-icons/fa6";
import "../../styles/CategoryRestaurants.css";
import { BASE_URL } from "../../utils/api";

const CategoryRestaurants = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("default");
  const selectedCategory = decodeURIComponent(category || "");

  // FETCH RESTAURANTS
  useEffect(() => {
    const getRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/restaurants`);
        setRestaurants(response.data || []);
      } catch (error) {
        console.error("Unable to load restaurants:",error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    getRestaurants();
  }, []);

  // CHECK RESTAURANT CATEGORY
  const categoryRestaurants =
    restaurants.filter((restaurant) => {
      const categoryName = selectedCategory.toLowerCase().trim();

      // Check restaurant Cuisine[]
      const cuisineMatch = restaurant.Cuisine?.some((cuisine) => cuisine.toLowerCase().trim() === categoryName);

      /*
       * Also check item Category.
       *
       * This is useful if the restaurant
       * has an item belonging to the selected
       * category but Cuisine[] doesn't contain it.
       */
      const itemCategoryMatch = restaurant.Items?.some((item) => item.Category ?.toLowerCase().trim() === categoryName);
      return (cuisineMatch || itemCategoryMatch);
    });

  // SORT
  const sortedRestaurants = [...categoryRestaurants, ];

  if (sortType === "rating") {
    sortedRestaurants.sort((a, b) => Number(b.Rating) - Number(a.Rating));
  }

  if (sortType === "delivery") {
    sortedRestaurants.sort((a, b) => parseInt(a.DeliveryTime) - parseInt(b.DeliveryTime));
  }

  if (sortType === "low") {
    sortedRestaurants.sort((a, b) =>Number(a.AverageCostForTwo) - Number(b.AverageCostForTwo));
  }

  if (loading) {
    return (
      <div className="category-loading">Loading restaurants...</div>
    );
  }

  return (
    <main className="category-restaurants-page">

      {/* BACK */}
      <button className="category-back-button" onClick={() => navigate(-1)}><FaArrowLeft />Back</button>

      {/* HEADER */}
      <section className="category-page-header">
        <div>
          <p>FOOD CATEGORY</p>
          <h1>{selectedCategory}</h1>
          <span>Restaurants serving{" "}{selectedCategory} near you</span>
        </div>
        <div className="category-count">
          <strong>{categoryRestaurants.length}</strong>
          <span>{categoryRestaurants.length === 1 ? "Restaurant" : "Restaurants"}</span>
        </div>
      </section>

      {/* FILTER / SORT */}
      {categoryRestaurants.length > 0 && (
        <section className="category-filter-section">
          <button className={sortType === "default" ? "category-filter active" : "category-filter"} onClick={() => setSortType("default")}>Relevance</button>
          <button className={sortType === "rating" ? "category-filter active" : "category-filter"} onClick={() => setSortType("rating")}>Rating</button>
          <button className={sortType === "delivery" ? "category-filter active" : "category-filter"} onClick={() => setSortType("delivery")}>Fast Delivery</button>
          <button className={sortType === "low" ? "category-filter active" : "category-filter"} onClick={() => setSortType("low")}>Cost: Low to High</button>
        </section>
      )}

          {/* RESTAURANTS */}
      {sortedRestaurants.length > 0 ? (
        <section className="category-restaurants-grid">
          {sortedRestaurants.map(
            (restaurant) => (
              <article className="category-restaurant-card" key={restaurant.id} onClick={() => navigate(`/restaurant/${restaurant.id}`)}>

                {/* IMAGE */}
                <div className="category-restaurant-image">
                  <img src={restaurant.RestaurantImage} alt={restaurant.Name}/>
                  <div className="category-image-gradient"></div>
                  {restaurant.MinimumOrder && (
                    <strong className="category-offer">ITEMS AT ₹{restaurant.MinimumOrder}</strong>
                  )}
                </div>

                {/* INFO */}
                <div className="category-restaurant-info">
                  <h2>{restaurant.Name}</h2>

                  <div className="category-rating">
                    <span><FaStar /></span>
                    <strong>{restaurant.Rating}</strong>
                    <b>•</b>
                    <strong>{restaurant.DeliveryTime}</strong>
                  </div>
                  <p>{restaurant.Cuisine?.join(", ")}</p>
                  <p>{restaurant.Address ?.Street}</p>
                </div>
              </article>
            )
          )}

        </section>

      ) : (
        <section className="no-category-restaurants">
          <div>🍽️</div>
          <h2>No restaurants found</h2>
          <p>We couldn't find any restaurants serving {selectedCategory}.</p>
          <button onClick={() => navigate("/")}>VIEW ALL RESTAURANTS</button>
        </section>
      )}

    </main>
  );
};

export default CategoryRestaurants;