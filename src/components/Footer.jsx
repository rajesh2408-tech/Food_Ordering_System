import React from "react";
import "../styles/footer.css";

import {FaLinkedin, FaInstagram, FaFacebookF, FaPinterestP, FaTwitter,} from "react-icons/fa";
import googleplay from "../assets/images/googleplay.png";  
import appstore from "../assets/images/appstore.png";
import { Link } from "react-router-dom";
import logo from "../assets/images/FoodieHub-logo.png";

const Footer = () => {
  return (
    <footer className="footer">

      {/* Top App Download Section */}
      <div className="footer-app-section">
        <h2>For better experience, download the Swiggy app now</h2>

        <div className="app-buttons">
          <Link to="#">
            <img
              src={googleplay}
              alt="Get it on Google Play"
            />
          </Link>

          <Link to="#">
            <img
              src={appstore}
              alt="Download on App Store"
            />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-container">

        {/* Logo Section */}
        <div className="footer-brand">
          <div className="footer-logo">
              <img src={logo} alt="" height={50} width={160} />
          </div>

          <p>© 2026 QuickBite Limited</p>
        </div>

        {/* Company */}
        <div className="footer-column">
          <h3>Company</h3>

          <Link to="#">About Us</Link>
          <Link to="#">Swiggy Corporate</Link>
          <Link to="#">Careers</Link>
          <Link to="#">Team</Link>
          <Link to="#">Swiggy One</Link>
          <Link to="#">Swiggy Instamart</Link>
          <Link to="#">Swiggy Dineout</Link>
        </div>

        {/* Contact + Legal */}
        <div className="footer-column footer-double">
          <div>
            <h3>Contact us</h3>

            <Link to="#">Help & Support</Link>
            <Link to="#">Partner with us</Link>
            <Link to="#">Ride with us</Link>
          </div>

          <div className="legal">
            <h3>Legal</h3>

            <Link to="#">Terms & Conditions</Link>
            <Link to="#">Cookie Policy</Link>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Investor Relations</Link>
          </div>
        </div>

        {/* Available Cities */}
        <div className="footer-column">
          <h3>Available in:</h3>

          <Link to="#">Bangalore</Link>
          <Link to="#">Gurgaon</Link>
          <Link to="#">Hyderabad</Link>
          <Link to="#">Delhi</Link>
          <Link to="#">Mumbai</Link>
          <Link to="#">Pune</Link>

          <select className="city-select">
            <option>679 cities</option>
            <option>Chennai</option>
            <option>Kolkata</option>
            <option>Jaipur</option>
            <option>Ahmedabad</option>
          </select>
        </div>

        {/* Life at Swiggy + Social */}
        <div className="footer-column footer-life">
          <div>
            <h3>Life at Swiggy</h3>

            <Link to="#">Explore with Swiggy</Link>
            <Link to="#">Swiggy News</Link>
            <Link to="#">Snackables</Link>
          </div>

          <div className="social-section">
            <h3>Social Links</h3>
            <div className="social-icons">
              <Link to="#"><FaLinkedin /></Link>
              <Link to="#"><FaInstagram /></Link>
              <Link to="#"><FaFacebookF /></Link>
              <Link to="#"><FaPinterestP /></Link>
              <Link to="#"><FaTwitter /></Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;