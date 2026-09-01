import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/navbar.css";
import {FiShoppingCart,FiUser,FiLogOut,FiChevronDown,FiSearch,FiX} from "react-icons/fi";
import { BASE_URL } from "../utils/api";

const Navbar = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  /* FETCH RESTAURANTS */
  useEffect(() => {
    const getRestaurants = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/restaurants`);
        setRestaurants(Array.isArray(response.data) ? response.data : response.data.restaurants || []);
      } catch (error) {
        console.error("Unable to fetch restaurants:", error);
      }
    };

    getRestaurants();
  }, []);

  /* LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setShowProfileMenu(false);
    navigate("/login");
  };

  /* SEARCH FILTER */
  const filteredRestaurants =
    search.trim() === "" ? [] : restaurants.filter((restaurant) => {
      const searchText = search.toLowerCase().trim();
      const restaurantName = restaurant.Name?.toLowerCase() || "";
      const city = restaurant.Address?.City?.toLowerCase() || "";
      const cuisines = restaurant.Cuisine?.join(" ").toLowerCase() || "";
      const foodItems = restaurant.Items?.map((item) => item.Name).join(" ").toLowerCase() || "";

      return (
        restaurantName.includes(searchText) ||
        city.includes(searchText) ||
        cuisines.includes(searchText) ||
        foodItems.includes(searchText)
      );
    });

  /* SELECT RESTAURANT */
  const handleRestaurantClick = (restaurant) => {
    setSearch("");
    setShowSearchResults(false);
    navigate(`/restaurant/${restaurant.id}`);
  };

  /* SEARCH INPUT */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowSearchResults(value.trim().length > 0);
  };

  /* CLEAR SEARCH */
  const clearSearch = () => {
    setSearch("");
    setShowSearchResults(false);
  };

  /* CLOSE SEARCH WHEN CLICKING OUTSIDE */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {/* LOGO */}
        <Link to="/" className="nav-logo"></Link>
        {/* SEARCH */}
        <div className="navbar-search-container" ref={searchRef}>
          <div className="navbar-search-box">
            <FiSearch className="navbar-search-icon" />
            <input type="text" placeholder="Search restaurants or food..." value={search} onChange={handleSearchChange} onFocus={() => {
              if (search.trim()) {
                setShowSearchResults(true);
              }
            }} />

            {search && (
              <button className="navbar-search-clear" onClick={clearSearch}>
                <FiX />
              </button>
            )}
          </div>

          {/* SEARCH RESULTS */}
          {showSearchResults && (
            <div className="navbar-search-results">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.slice(0, 8).map((restaurant) => (
                  <button key={restaurant.id} className="navbar-search-result-item" onClick={() => handleRestaurantClick(restaurant)}>
                    <div className="navbar-search-result-image">
                      <img src={restaurant.RestaurantImage || restaurant.CoverImage} alt={restaurant.Name} />
                    </div>
                    <div className="navbar-search-result-details">
                      <strong>{restaurant.Name}</strong>
                      <span>{restaurant.Cuisine?.slice(0, 3).join(", ")}</span>
                      <small>{restaurant.Address?.City} {restaurant.Rating && ` • ★ ${restaurant.Rating}`}</small>
                    </div>
                  </button>
                ))
              ) : (
                <div className="navbar-no-results">
                  <FiSearch />
                  <strong>No results found</strong>
                  <span>
                    No restaurant or food matches "{search}"
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-profile">
        {/* CART */}
        <Link to="/cart" className="navbar-cart-link">
          <FiShoppingCart />
        </Link>

        {/* NOT LOGGED IN */}
        {!user && (
          <Link to="/login" className="navbar-login-link">
            <FiUser />
          </Link>
        )}

        {/* LOGGED IN */}
        {user && (
          <div className="profile-container">
            <button className="profile-button" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <FiUser />
              <span>{user.Name || user.Email}</span>
              <FiChevronDown />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-details">
                  <strong>{user.Name || "User"}</strong>
                  <small>{user.Email}</small>
                </div>

                {user.Role?.toLowerCase() === "admin" ? (
                  <Link to="/admin/admindashboard" onClick={() => setShowProfileMenu(false)}>
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                    My Profile
                  </Link>
                )}

                <button className="logout-button" onClick={handleLogout}>
                  <FiLogOut />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;