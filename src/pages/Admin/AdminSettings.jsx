import React, {useEffect, useState, } from "react";
import axios from "axios";
import {FaGear, FaStore, FaTruck, FaBell, FaShieldHalved, FaPalette, FaFloppyDisk, FaRotate, FaEnvelope, FaPhone, FaIndianRupeeSign, FaClock, FaCheck, } from "react-icons/fa6";
import "../../styles/Layout.css";
import {BASE_URL} from "../../utils/api";

const defaultSettings = {
  id: "app-settings",
  applicationName: "Food Ordering System",
  applicationDescription: "Order your favourite food from restaurants near you.",
  supportEmail: "support@foodorder.com",
  supportPhone: "9876543210",
  currency: "INR",
  minimumOrder: 99,
  defaultDeliveryFee: 40,
  freeDeliveryAbove: 499,
  platformFee: 6,
  gstPercentage: 5,
  estimatedDeliveryTime: "30-45 mins",
  allowCOD: true,
  allowUPI: true,
  allowCard: true,
  allowOrderCancellation: true,
  maintenanceMode: false,
  emailNotifications: true,
  orderNotifications: true,
  restaurantNotifications: true,
  userNotifications: true,
  theme: "Light",
  primaryColor: "#ff5200",
};
const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // FETCH
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/settings`);
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      if (data) {
        setSettings({...defaultSettings, ...data, });
      }
    } catch (error) {
      console.log("No settings found yet.");
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // CHANGE
  const handleChange = (event) => {
    const {name, value, type, checked,} = event.target;
    setSettings((previous) => ({...previous, [name]: type === "checkbox" ? checked : value, }));
  };

  // SAVE
  const saveSettings = async () => {
    try {
      setSaving(true);
      const data = {
        ...settings,
        minimumOrder: Number(settings.minimumOrder ) || 0,
        defaultDeliveryFee: Number(settings.defaultDeliveryFee) || 0,
        freeDeliveryAbove: Number(settings.freeDeliveryAbove) || 0,
        platformFee: Number(settings.platformFee) || 0,
        gstPercentage: Number(settings.gstPercentage) || 0,
      };

      try {
        const response = await axios.patch(`${BASE_URL}/settings/${settings.id}`, data);
        setSettings(response.data);
      } catch {
        const response = await axios.post(`${BASE_URL}/settings`, data);
        setSettings(response.data);
      }
      setMessage("Settings saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save settings.");
    } finally {
      setSaving(false);
}
  };
  const resetSettings = () => {
    const confirmed = window.confirm("Reset settings to default values?");
    if (!confirmed) return;
    setSettings(defaultSettings);
  };

  if (loading) {
    return (
      <div className="settings-loading">Loading settings...</div>
    );
  }

  return (
    <main className="admin-settings-page">
      {message && (
        <div className="settings-message"><FaCheck />{message}</div>
      )}

      {/* HEADER */}
      <header className="settings-header">
        <div>
          <p>APPLICATION CONFIGURATION</p>
          <h1>Settings</h1>
          <span>Configure your food delivery application.</span>
        </div>

        <div>
          <button className="settings-reset" onClick={resetSettings}><FaRotate />Reset</button>
          <button className="settings-save" onClick={saveSettings} disabled={saving}>
            <FaFloppyDisk />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="settings-layout">
        {/* GENERAL */}
        <section className="settings-card">
          <header>
            <span><FaStore /></span>
            <div>
              <h2>General Settings</h2>
              <p>Application and support information</p>
            </div>
          </header>

          <div className="settings-form-grid">
            <label>
              Application Name
              <input name="applicationName" value={settings.applicationName} onChange={handleChange}/>
            </label>

            <label>
              Currency
              <select name="currency" value={settings.currency} onChange={handleChange}>
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - Dollar</option>
              </select>
            </label>

            <label className="settings-full">
              Application Description
              <textarea name="applicationDescription" value={settings.applicationDescription} onChange={handleChange}/>
            </label>

            <label>
              <span><FaEnvelope />Support Email</span>
              <input name="supportEmail" value={settings.supportEmail} onChange={handleChange}/>
            </label>

            <label>
              <span><FaPhone />Support Phone</span>
              <input name="supportPhone" value={settings.supportPhone} onChange={handleChange}/>
            </label>
          </div>
        </section>

        {/* DELIVERY */}
        <section className="settings-card">
          <header>
            <span><FaTruck /></span>
            <div>
              <h2>Delivery & Pricing</h2>
              <p>Delivery charges and platform pricing</p>
            </div>
          </header>

          <div className="settings-form-grid">
            <label>
              <span><FaIndianRupeeSign />Minimum Order</span>
              <input type="number" name="minimumOrder" value={settings.minimumOrder} onChange={handleChange}/>
            </label>

            <label>
              Delivery Fee
              <input type="number" name="defaultDeliveryFee" value={settings.defaultDeliveryFee} onChange={handleChange}/>
            </label>

            <label>
              Free Delivery Above
              <input type="number" name="freeDeliveryAbove" value={settings.freeDeliveryAbove} onChange={handleChange}/>
            </label>

            <label>
              Platform Fee
              <input type="number" name="platformFee" value={settings.platformFee} onChange={handleChange}/>
            </label>

            <label>
              GST %
              <input type="number" name="gstPercentage" value={settings.gstPercentage} onChange={handleChange}/>
            </label>

            <label>
              <span><FaClock />Estimated Delivery</span>
              <input name="estimatedDeliveryTime" value={settings.estimatedDeliveryTime} onChange={handleChange}/>
            </label>
          </div>
        </section>

        {/* PAYMENT */}
        <section className="settings-card">
          <header>
            <span><FaIndianRupeeSign /></span>
            <div>
              <h2>Payment & Orders</h2>
              <p>Configure available payment options</p>
            </div>
          </header>

          <div className="settings-toggle-list">
            <label>
              <div>
                <strong>Cash on Delivery</strong>
                <span>Allow customers to pay on delivery</span>
              </div>
              <input type="checkbox" name="allowCOD" checked={settings.allowCOD} onChange={handleChange}/>
            </label>

            <label>
              <div>
                <strong>UPI Payments</strong>
                <span>Allow UPI payment option</span>
              </div>
              <input type="checkbox" name="allowUPI" checked={settings.allowUPI} onChange={handleChange}/>
            </label>

            <label>
              <div>
                <strong>Card Payments</strong>
                <span>Allow card payment option</span>
              </div>
              <input type="checkbox" name="allowCard" checked={settings.allowCard} onChange={handleChange}/>
            </label>

            <label>
              <div>
                <strong>Order Cancellation</strong>
                <span>Allow customers to cancel eligible orders</span>
              </div>
              <input type="checkbox" name="allowOrderCancellation" checked={settings.allowOrderCancellation} onChange={handleChange}/>
            </label>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="settings-card">
          <header>
            <span><FaBell /></span>
            <div>
              <h2>Notifications</h2>
              <p>Control platform notifications</p>
            </div>
          </header>

          <div className="settings-toggle-list">
            <label>
              <div>
                <strong>Order Notifications</strong>
                <span>Receive notifications for new orders</span>
              </div>
              <input type="checkbox" name="orderNotifications" checked={settings.orderNotifications} onChange={handleChange}/>
            </label>

            <label>
              <div>
                <strong>Email Notifications</strong>
                <span>Enable system email notifications</span>
              </div>
              <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange}/>
            </label>

            <label>
              <div>
                <strong>Restaurant Updates</strong>
                <span>Notify about restaurant activity</span>
              </div>
              <input type="checkbox" name="restaurantNotifications" checked={settings.restaurantNotifications} onChange={handleChange}/>
            </label>
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="settings-card">
          <header>
            <span><FaPalette /></span>
            <div>
              <h2>Appearance</h2>
              <p>Configure application appearance</p>
            </div>
          </header>

          <div className="settings-form-grid">
            <label>
              Theme
              <select name="theme" value={settings.theme} onChange={handleChange}>
                <option value="Light">Light</option>
                <option value="Dark">Dark</option>
                <option value="System">System Default</option>
              </select>
            </label>

            <label>
              Primary Color
              <div className="settings-color-input">
                <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleChange}/>
                <span>{settings.primaryColor}</span>
              </div>
            </label>
          </div>
        </section>

        {/* SYSTEM */}
        <section className="settings-card">
          <header>
            <span><FaShieldHalved /></span>
            <div>
              <h2>System</h2>
              <p>Platform availability and security</p>
            </div>
          </header>

          <div className="settings-toggle-list">
            <label className="maintenance-setting">
              <div>
                <strong>Maintenance Mode</strong>
                <span>Temporarily disable customer ordering</span>
              </div>
              <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange}/>
            </label>
          </div>
        </section>
      </div>

      {/* BOTTOM SAVE */}
      <div className="settings-bottom-save">
        <div>
          <strong>Save your changes</strong>
          <span>Changes are stored in your JSON Server.</span>
        </div>
        <button onClick={saveSettings}disabled={saving}><FaFloppyDisk />{saving ? "Saving..." : "Save Settings"}</button>
      </div>
    </main>
  );
};

export default AdminSettings;