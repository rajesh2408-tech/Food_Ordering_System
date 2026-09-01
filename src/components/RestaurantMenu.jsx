import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaClock, FaIndianRupeeSign, FaLocationDot, FaStar, FaXmark, FaFire, FaLeaf, FaTriangleExclamation } from "react-icons/fa6";
import { BASE_URL } from "../utils/api";
import { useCart } from "../context/CartContext";
import "../styles/RestaurantMenu.css";

const RestaurantMenu = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  /* STATES */
  const [restaurant, setRestaurant] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFood, setSelectedFood] = useState(null);
  /* CART */
  const { cart, addToCart, decreaseQuantity, getItemQuantity, totalCartItems, subtotal } = useCart();

  /* FETCH RESTAURANT + ALL RESTAURANTS */
  useEffect(() => {

    const getRestaurantData = async () => {
      try {
        setLoading(true);
        setError("");
        const [restaurantResponse, allRestaurantsResponse] = await Promise.all([axios.get(`${BASE_URL}/restaurants/${id}`), axios.get(`${BASE_URL}/restaurants`)]);

        const currentRestaurant = restaurantResponse.data;
        const restaurantsData = Array.isArray(allRestaurantsResponse.data) ? allRestaurantsResponse.data : allRestaurantsResponse.data?.restaurants || [];

        setRestaurant(currentRestaurant);

        /* REMOVE CURRENT + INACTIVE RESTAURANTS */
        const otherRestaurants = restaurantsData.filter((item) => {
          const isDifferentRestaurant = String(item.id) !== String(currentRestaurant.id);
          const isActive = !item.Status || item.Status.toLowerCase() === "active";

          return isDifferentRestaurant && isActive;
        });

        /* HIGHER RATED RESTAURANTS FIRST */
        otherRestaurants.sort((a, b) => Number(b.Rating || 0) - Number(a.Rating || 0));
        setAllRestaurants(otherRestaurants);
      } catch (err) {
        console.error(err);
        setRestaurant(null);
        setAllRestaurants([]);
        setError("Unable to load restaurant details.");
      } finally {
        setLoading(false);
      }
    };
    getRestaurantData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  /* BODY CLEANUP */
  useEffect(() => {
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  /* OPEN FOOD DETAILS */
  const openFoodDetails = (item) => {
    setSelectedFood(item);
    document.body.style.overflow = "hidden";
  };

  /* CLOSE FOOD DETAILS */
  const closeFoodDetails = () => {
    setSelectedFood(null);
    document.body.style.overflow = "auto";
  };

  /* ESCAPE CLOSE MODAL */
  useEffect(() => {

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && selectedFood) {
        setSelectedFood(null);
        document.body.style.overflow = "auto";
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); };

  }, [selectedFood]);
  /* RESTAURANT CATEGORIES */
  const categories = restaurant ? ["All", ...new Set(restaurant.Items?.map((item) => item.Category) || [])] : [];

  /* FILTER FOOD ITEMS */
  const filteredItems = selectedCategory === "All" ? restaurant?.Items || [] : restaurant?.Items?.filter((item) => item.Category === selectedCategory) || [];

  /* OPEN ANOTHER RESTAURANT */
  const openRestaurant = (restaurantId) => {
    setSelectedCategory("All");
    setSelectedFood(null);
    document.body.style.overflow = "auto";
    navigate(`/restaurant/${restaurantId}`);
  };

  /* LOADING */
  if (loading) {
    return (
      <main className="menu-status-page">
        <div className="menu-loader"></div>
        <h2>Loading menu...</h2>
      </main>
    );
  }

  /* ERROR */
  if (error || !restaurant) {
    return (
      <main className="menu-status-page">
        <h2>Restaurant not found</h2>
        <p>{error || "Unable to find this restaurant."}</p>
        <button onClick={() => navigate(-1)}><FaArrowLeft />Go Back</button>
      </main>
    );
  }

  /* SELECTED FOOD VALUES */
  const selectedFoodQuantity = selectedFood ? getItemQuantity(selectedFood.id) : 0;
  const selectedFoodPrice = selectedFood ? selectedFood.Discount > 0 && selectedFood.DiscountedPrice != null ? Number(selectedFood.DiscountedPrice) : Number(selectedFood.Price || 0) : 0;

  return (
    <main className="restaurant-menu-page">

      {/* TOP */}
      <div className="restaurant-menu-top">
        <button className="menu-back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back to Restaurants
        </button>
      </div>

      {/* RESTAURANT HEADER */}
      <section className="restaurant-menu-header">

        <div className="restaurant-header-left">
          <p className="restaurant-page-label">RESTAURANT</p>
          <h1>{restaurant.Name}</h1>
          <p className="restaurant-description">{restaurant.Description}</p>
          <p className="menu-cuisines">{restaurant.Cuisine?.join(", ")}</p>

          {/* ADDRESS */}
          <div className="restaurant-address">
            <FaLocationDot />
            <span>
              {restaurant.Address?.Street}
              {restaurant.Address?.City && `, ${restaurant.Address.City}`}
            </span>
          </div>

          {/* RESTAURANT DETAILS */}
          <div className="restaurant-details-row">

            {/* RATING */}
            <div className="restaurant-detail-box">
              <div className="restaurant-detail-main rating-detail">
                <FaStar />
                <strong>{restaurant.Rating}</strong>
              </div>
              <span>{restaurant.TotalReviews || 0} ratings</span>
            </div>

            <div className="restaurant-detail-divider"></div>

            {/* DELIVERY */}
            <div className="restaurant-detail-box">
              <div className="restaurant-detail-main">
                <FaClock />
                <strong>{restaurant.DeliveryTime}</strong>
              </div>
              <span>Delivery Time</span>
            </div>

            <div className="restaurant-detail-divider"></div>

            {/* COST */}
            <div className="restaurant-detail-box">
              <div className="restaurant-detail-main">
                <FaIndianRupeeSign />
                <strong>{restaurant.AverageCostForTwo}</strong>
              </div>
              <span>Cost for two</span>
            </div>
          </div>
        </div>

        {/* RESTAURANT IMAGE */}
        <div className="restaurant-header-image">
          <img src={restaurant.CoverImage || restaurant.RestaurantImage} alt={restaurant.Name} />
          <div className="restaurant-image-overlay"></div>
          <div className="restaurant-image-rating"><FaStar />{restaurant.Rating}</div>
        </div>
      </section>

      {/* OFFERS */}
      <section className="restaurant-offers-section">

        <div className="restaurant-offer-card">
          <strong>Free Delivery</strong>
          <span>on orders above ₹499</span>
        </div>

        <div className="restaurant-offer-card">
          <strong>Minimum Order</strong>
          <span>₹{restaurant.MinimumOrder}</span>
        </div>

        <div className="restaurant-offer-card">
          <strong>Delivery Fee</strong>
          <span>{restaurant.DeliveryFee === 0 ? "FREE" : `₹${restaurant.DeliveryFee}`}</span>
        </div>
      </section>

      {/* MENU CATEGORY */}
      <section className="menu-category-section">
        <div className="menu-category-title">
          <div>
            <p>RESTAURANT MENU</p>
            <h2>Choose your favourite food</h2>
          </div>
          <span>{restaurant.Items?.length || 0} items</span>
        </div>

        <div className="menu-categories">
          {categories.map((category) => (
            <button key={category} className={selectedCategory === category ? "menu-category active" : "menu-category"} onClick={() => setSelectedCategory(category)}>{category}</button>
          ))}
        </div>
      </section>

      {/* MENU ITEMS */}
      <section className="menu-items-section">

        <div className="menu-section-heading">
          <div>
            <h2>{selectedCategory === "All" ? "Recommended Menu" : selectedCategory}</h2>
            <p>{filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}</p>
          </div>
        </div>

        {/* ITEM LIST */}
        <div className="menu-list">

          {filteredItems.length === 0 ? (
            <div className="no-menu-items">
              <h3>No items available</h3>
              <p>There are no items in this category.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              const finalPrice = item.Discount > 0 && item.DiscountedPrice != null ? item.DiscountedPrice : item.Price;

              return (
                <article className="menu-item-card" key={item.id} onClick={() => openFoodDetails(item)}>

                  {/* LEFT */}
                  <div className="menu-item-content">

                    <div className="menu-item-top-row">
                      <div className={item.FoodType === "Veg" ? "food-type veg" : "food-type non-veg"}>
                        <span></span>
                      </div>

                      <div className="item-badges">
                        {item.IsBestSeller && <span className="bestseller">★ Bestseller</span>}
                        {item.IsRecommended && <span className="recommended">Recommended</span>}
                      </div>
                    </div>

                    {/* NAME */}
                    <h3>{item.Name}</h3>

                    {/* PRICE */}
                    <div className="item-price">
                      {item.Discount > 0 && <span className="original-price">₹{item.Price}</span>}
                      <span className="discount-price">₹{finalPrice}</span>
                      {item.Discount > 0 && <span className="discount-text">{item.Discount}% OFF</span>}
                    </div>

                    {/* RATING */}
                    {item.Rating && (
                      <div className="item-rating">
                        <FaStar />
                        <strong>{item.Rating}</strong>
                        <span>({item.TotalReviews || 0})</span>
                      </div>
                    )}

                    {/* DESCRIPTION */}
                    <p className="item-description">{item.Description}</p>

                    {/* PREPARATION */}
                    {item.PreparationTime && (
                      <div className="preparation-time">
                        <FaClock />
                        <span>{item.PreparationTime}</span>
                      </div>
                    )}
                    <span className="view-food-details-text">View details</span>
                  </div>

                  {/* RIGHT */}
                  <div className="menu-item-right">

                    <div className="menu-item-image">
                      <img src={item.Image} alt={item.Name} />
                      {item.Discount > 0 && <span className="menu-image-discount">{item.Discount}% OFF</span>}

                      {!item.IsAvailable && (
                        <div className="not-available-overlay"><span>Currently unavailable</span></div>
                      )}
                    </div>

                    {/* ADD */}
                    {item.IsAvailable && quantity === 0 && (
                      <button className="add-food-button" onClick={(event) => {
                        event.stopPropagation();
                        addToCart(item, restaurant);
                      }}
                      >
                        ADD
                      </button>
                    )}

                    {/* QUANTITY */}
                    {item.IsAvailable && quantity > 0 && (
                      <div className="quantity-control" onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => decreaseQuantity(item.id)}>−</button>
                        <span>{quantity}</span>
                        <button onClick={() => addToCart(item, restaurant)}>+</button>
                      </div>
                    )}

                    {/* UNAVAILABLE */}
                    {!item.IsAvailable && (
                      <button className="add-food-button unavailable-add-button" disabled onClick={(event) => event.stopPropagation()}>ADD</button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* ALL OTHER RESTAURANTS */}
      {allRestaurants.length > 0 && (
        <section className="more-restaurants-section">

          <div className="more-restaurants-heading">
            <div>
              <p>MORE CHOICES FOR YOU</p>
              <h2>Explore Other Restaurants</h2>
              <span>Didn't find what you like? Choose from other restaurants.</span>
            </div>
            <strong>{allRestaurants.length} restaurants</strong>
          </div>

          <div className="more-restaurants-grid">

            {allRestaurants.map((otherRestaurant) => (
              <article className="more-restaurant-card" key={otherRestaurant.id} onClick={() => openRestaurant(otherRestaurant.id)}>

                {/* IMAGE */}
                <div className="more-restaurant-image">
                  <img src={otherRestaurant.CoverImage || otherRestaurant.RestaurantImage} alt={otherRestaurant.Name} />
                  <div className="more-restaurant-image-gradient"></div>

                  {otherRestaurant.DeliveryTime && (
                    <span className="more-restaurant-time">
                      <FaClock />
                      {otherRestaurant.DeliveryTime}
                    </span>
                  )}

                  {otherRestaurant.DeliveryFee === 0 && (
                    <span className="more-restaurant-free-delivery">FREE DELIVERY</span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="more-restaurant-content">

                  <div className="more-restaurant-title-row">
                    <h3>{otherRestaurant.Name}</h3>

                    {otherRestaurant.Rating && (
                      <div className="more-restaurant-rating">
                        <FaStar />
                        <span>{otherRestaurant.Rating}</span>
                      </div>
                    )}
                  </div>

                  {/* CUISINES */}
                  <p className="more-restaurant-cuisines">{otherRestaurant.Cuisine?.slice(0, 4).join(", ")}</p>

                  {/* ADDRESS */}
                  <div className="more-restaurant-address">
                    <FaLocationDot />
                    <span>
                      {otherRestaurant.Address?.Street}
                      {otherRestaurant.Address?.City && `, ${otherRestaurant.Address.City}`}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="more-restaurant-info">
                    <div>
                      <strong>₹{otherRestaurant.AverageCostForTwo || 0}</strong>
                      <span>for two</span>
                    </div>

                    <div>
                      <strong>{otherRestaurant.Items?.length || 0}</strong>
                      <span>items</span>
                    </div>

                    <div>
                      <strong>{otherRestaurant.FoodType || "Both"}</strong>
                      <span>food</span>
                    </div>
                  </div>
                  <button className="view-restaurant-menu-button" onClick={(event) => {
                    event.stopPropagation();
                    openRestaurant(otherRestaurant.id);
                  }}
                  >
                    View Menu
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* BOTTOM CART */}
      {cart.length > 0 && (
        <div className="cart-bottom-wrapper">
          <div className="cart-bottom-bar">
            <div className="cart-bottom-info">
              <div>
                <strong>{totalCartItems} {totalCartItems === 1 ? "ITEM" : "ITEMS"}</strong>
                <span className="cart-divider">|</span>
                <strong>₹{subtotal}</strong>
              </div>
              <small>Extra charges may apply</small>
            </div>
            <button className="view-cart-button" onClick={() => navigate("/cart")}>VIEW CART</button>
          </div>
        </div>
      )}

      {/* FOOD DETAILS MODAL */}
      {selectedFood && (
        <div className="food-details-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeFoodDetails();
          }
        }}
        >

          <div className="food-details-modal">

            {/* CLOSE */}
            <button className="food-details-close" onClick={closeFoodDetails} aria-label="Close"><FaXmark /></button>

            {/* IMAGE */}
            <div className="food-details-image-section">
              <img src={selectedFood.Image} alt={selectedFood.Name} />

              {selectedFood.Discount > 0 && (
                <span className="food-details-discount">{selectedFood.Discount}% OFF</span>
              )}

              {!selectedFood.IsAvailable && (
                <div className="food-details-unavailable">Currently unavailable</div>
              )}
            </div>

            {/* FOOD CONTENT */}
            <div className="food-details-content">

              {/* TYPE */}
              <div className="food-details-top">
                <div className={selectedFood.FoodType === "Veg" ? "food-type veg" : "food-type non-veg"}>
                  <span></span>
                </div>
                <span className={selectedFood.FoodType === "Veg" ? "food-details-type-text veg-text" : "food-details-type-text nonveg-text"}>
                  {selectedFood.FoodType}
                </span>
                {selectedFood.IsBestSeller && (
                  <span className="food-details-bestseller"><FaFire />Bestseller</span>
                )}

                {selectedFood.IsRecommended && (
                  <span className="food-details-recommended"><FaLeaf />Recommended</span>
                )}
              </div>

              {/* NAME */}
              <h2>{selectedFood.Name}</h2>
              <p className="food-details-restaurant">{restaurant.Name}</p>

              {/* PRICE */}
              <div className="food-details-price">
                {selectedFood.Discount > 0 && (
                  <span className="food-details-original-price">₹{selectedFood.Price}</span>
                )}
                <strong>₹{selectedFoodPrice}</strong>
                {selectedFood.Discount > 0 && (
                  <span className="food-details-offer">{selectedFood.Discount}% OFF</span>
                )}
              </div>

              {/* RATING */}
              {selectedFood.Rating && (
                <div className="food-details-rating">
                  <FaStar />
                  <strong>{selectedFood.Rating}</strong>
                  <span>({selectedFood.TotalReviews || 0} ratings)</span>
                </div>
              )}

              {/* DESCRIPTION */}
              <p className="food-details-description">{selectedFood.Description || "No description available for this item."}</p>

              {/* BASIC INFO */}
              <div className="food-details-basic-info">
                <div>
                  <span>Category</span>
                  <strong>{selectedFood.Category || "Food"}</strong>
                </div>
                <div>
                  <span>Food Type</span>
                  <strong>{selectedFood.FoodType || "N/A"}</strong>
                </div>
                <div>
                  <span><FaClock />Preparation</span>
                  <strong>{selectedFood.PreparationTime || "N/A"}</strong>
                </div>
              </div>

              {/* NUTRITION */}
              {selectedFood.Nutrition && Object.keys(selectedFood.Nutrition).length > 0 && (
                <section className="food-details-section">
                  <div className="food-details-section-heading">
                    <div>
                      <h3>Nutrition Information</h3>
                      <p>Approximate values per serving</p>
                    </div>
                  </div>

                  <div className="food-nutrition-grid">
                    {selectedFood.Nutrition.Calories !== undefined && (
                      <div>
                        <span>Calories</span>
                        <strong>{selectedFood.Nutrition.Calories}<small> kcal</small></strong>
                      </div>
                    )}
                    {selectedFood.Nutrition.Protein && (
                      <div>
                        <span>Protein</span>
                        <strong>{selectedFood.Nutrition.Protein}</strong>
                      </div>
                    )}
                    {selectedFood.Nutrition.Carbohydrates && (
                      <div>
                        <span>Carbs</span>
                        <strong>{selectedFood.Nutrition.Carbohydrates}</strong>
                      </div>
                    )}
                    {selectedFood.Nutrition.Fat && (
                      <div>
                        <span>Fat</span>
                        <strong>{selectedFood.Nutrition.Fat}</strong>
                      </div>
                    )}
                    {selectedFood.Nutrition.Fiber && (
                      <div>
                        <span>Fiber</span>
                        <strong>{selectedFood.Nutrition.Fiber}</strong>
                      </div>
                    )}
                    {selectedFood.Nutrition.Sugar && (
                      <div>
                        <span>Sugar</span>
                        <strong>{selectedFood.Nutrition.Sugar}</strong>
                      </div>
                    )}
                    {selectedFood.Nutrition.Sodium && (
                      <div>
                        <span>Sodium</span>
                        <strong>{selectedFood.Nutrition.Sodium}</strong>
                      </div>
                    )}
                    {selectedFood.Nutrition.ServingSize && (
                      <div>
                        <span>Serving</span>
                        <strong>{selectedFood.Nutrition.ServingSize}</strong>
                      </div>
                    )}
                  </div>

                </section>
              )}

              {/* ALLERGENS */}
              {selectedFood.Allergens?.length > 0 && (
                <section className="food-details-section">
                  <div className="food-details-section-heading">
                    <div>
                      <h3>Allergen Information</h3>
                      <p>Please check before ordering</p>
                    </div>
                    <FaTriangleExclamation />
                  </div>

                  <div className="food-allergens">
                    {selectedFood.Allergens.map((allergen, index) => (
                      <span key={`${allergen}-${index}`}>{allergen}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* CART */}
              <div className="food-details-cart-section">
                <div className="food-details-total">
                  <span>Item Total</span>
                  <strong>₹{selectedFoodPrice * Math.max(selectedFoodQuantity, 1)}</strong>
                </div>
                {selectedFood.IsAvailable ? (
                  selectedFoodQuantity === 0 ? (
                    <button className="food-details-add" onClick={() => addToCart(selectedFood, restaurant)}>
                      ADD
                    </button>
                  ) : (
                    <div className="food-details-quantity">
                      <button onClick={() => decreaseQuantity(selectedFood.id)}>−</button>
                      <span>{selectedFoodQuantity}</span>
                      <button onClick={() => addToCart(selectedFood, restaurant)}>+</button>
                    </div>
                  )
                ) : (
                  <button className="food-details-add disabled" disabled>UNAVAILABLE</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default RestaurantMenu;