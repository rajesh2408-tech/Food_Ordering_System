import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {FiUser, FiMail, FiPhone, FiMapPin, FiHash, FiLogOut, FiCalendar, FiEdit3, FiSave, FiX, FiShield } from "react-icons/fi";
import { logout } from "../../services/auth";
import "../../styles/UserProfile.css";
import { BASE_URL } from "../../utils/api";
const UserProfile = () => {

    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const [user, setUser] = useState(storedUser);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        Name: storedUser?.Name || "",
        Mobile: storedUser?.Mobile || "",
        Gender: storedUser?.Gender || "",
        ProfileImage: storedUser?.ProfileImage || "",
        Street: storedUser?.Address?.Street || "",
        City: storedUser?.Address?.City || "",
        State: storedUser?.Address?.State || "",
        Pincode: storedUser?.Address?.Pincode || "",
        Country: storedUser?.Address?.Country || ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleEdit = () => {
        setFormData({
            Name: user?.Name || "",
            Mobile: user?.Mobile || "",
            Gender: user?.Gender || "",
            ProfileImage: user?.ProfileImage || "",
            Street: user?.Address?.Street || "",
            City: user?.Address?.City || "",
            State: user?.Address?.State || "",
            Pincode: user?.Address?.Pincode || "",
            Country: user?.Address?.Country || ""
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData({
            Name: user?.Name || "",
            Mobile: user?.Mobile || "",
            Gender: user?.Gender || "",
            ProfileImage: user?.ProfileImage || "",
            Street: user?.Address?.Street || "",
            City: user?.Address?.City || "",
            State: user?.Address?.State || "",
            Pincode: user?.Address?.Pincode || "",
            Country: user?.Address?.Country || ""
        });
        setIsEditing(false);
    };

    const validate = () => {
        if (!formData.Name.trim()) {
            alert("Name is required");
            return false;
        }

        if (!/^[6-9]\d{9}$/.test(formData.Mobile)) {
            alert("Enter a valid 10 digit mobile number");
            return false;
        }

        if (!formData.Gender) {
            alert("Please select gender");
            return false;
        }

        if (!formData.Street.trim()) {
            alert("Street address is required");
            return false;
        }

        if (!formData.City.trim()) {
            alert("City is required");
            return false;
        }

        if (!formData.State.trim()) {
            alert("State is required");
            return false;
        }

        if (!/^\d{6}$/.test(formData.Pincode)) {
            alert("Enter a valid 6 digit pincode");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const updatedData = {
                Name: formData.Name,
                Mobile: formData.Mobile,
                Gender: formData.Gender,
                ProfileImage: formData.ProfileImage,
                Address: {
                    Street: formData.Street,
                    City: formData.City,
                    State: formData.State,
                    Pincode: formData.Pincode,
                    Country: formData.Country
                },
                updatedAt: new Date().toISOString()
            };

            const response = await axios.patch(`${BASE_URL}/users/${user.id}`, updatedData);

            setUser(response.data);
            localStorage.setItem("loggedInUser", JSON.stringify(response.data));
            setIsEditing(false);
            alert("Profile Updated Successfully");
        } catch (error) {
            console.error("Profile update error:", error);
            alert("Unable to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        alert("Logout Successful");
        navigate("/login");
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <main className="user-profile-page">
            <div className="user-profile-container">
                {/* PAGE HEADER */}
                <div className="profile-page-header">
                    <div>
                        <h1>My Profile</h1>
                        <p>Manage your personal information and account details</p>
                    </div>
                    {!isEditing ? (
                        <button className="profile-header-edit-btn" onClick={handleEdit}><FiEdit3 />Edit Profile</button>
                    ) : (
                        <div className="profile-edit-actions">
                            <button className="profile-cancel-btn" onClick={handleCancel}><FiX />Cancel</button>
                            <button className="profile-save-btn" onClick={handleSave} disabled={loading}>
                                <FiSave />
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-content">
                    {/* LEFT PROFILE CARD */}
                    <aside className="profile-sidebar">
                        <div className="profile-image-container">
                            <img src={isEditing ? formData.ProfileImage : user?.ProfileImage} alt={user?.Name || "User"} className="profile-image"/>
                            <span className={`profile-status ${user?.Status?.toLowerCase() === "active" ? "active" : "inactive"}`}>
                                {user?.Status || "Active"}
                            </span>
                        </div>

                        {isEditing ? (
                            <div className="profile-image-edit">
                                <label>Profile Image URL</label>
                                <input type="text" name="ProfileImage" value={formData.ProfileImage} onChange={handleChange} placeholder="Profile image URL"/>
                            </div>
                        ) : null}

                        <h2>{isEditing ? formData.Name : user?.Name}</h2>
                        <p className="profile-email">{user?.Email}</p>

                        <div className="profile-user-id">
                            <FiHash />
                            <span>{user?.id}</span>
                        </div>

                        <div className="profile-role">
                            <FiShield />
                            <span>{user?.Role || "User"}</span>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT */}
                    <section className="profile-main">
                        {/* PERSONAL INFO */}
                        <div className="profile-card">
                            <div className="profile-card-title">
                                <div className="profile-title-icon"><FiUser /></div>
                                <div>
                                    <h2>Personal Information</h2>
                                    <p>Your personal and contact details</p>
                                </div>
                            </div>

                            <div className="profile-info-grid">
                                {/* NAME */}
                                <div className="profile-info-item">
                                    <div className="info-icon"><FiUser /></div>
                                    <div className="profile-field-content">
                                        <span>Full Name</span>
                                        {isEditing ? (
                                            <input type="text" name="Name" value={formData.Name} onChange={handleChange}/>
                                        ) : (
                                            <strong>{user?.Name || "N/A"}</strong>
                                        )}
                                    </div>
                                </div>

                                {/* EMAIL */}
                                <div className="profile-info-item">
                                    <div className="info-icon"><FiMail /></div>
                                    <div className="profile-field-content">
                                        <span>Email Address</span>
                                        <strong>{user?.Email || "N/A"}</strong>
                                    </div>
                                </div>

                                {/* MOBILE */}
                                <div className="profile-info-item">
                                    <div className="info-icon"><FiPhone /></div>
                                    <div className="profile-field-content">
                                        <span>Mobile Number</span>
                                        {isEditing ? (
                                            <input type="tel" name="Mobile" value={formData.Mobile} onChange={handleChange} maxLength="10"/>
                                        ) : (
                                            <strong>{user?.Mobile || "N/A"}</strong>
                                        )}
                                    </div>
                                </div>

                                {/* GENDER */}
                                <div className="profile-info-item">
                                    <div className="info-icon"><FiUser /></div>
                                    <div className="profile-field-content">
                                        <span>Gender</span>
                                        {isEditing ? (
                                            <select name="Gender" value={formData.Gender} onChange={handleChange}>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (
                                            <strong>{user?.Gender || "N/A"}</strong>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div className="profile-card">
                            <div className="profile-card-title">
                                <div className="profile-title-icon"><FiMapPin /></div>
                                <div>
                                    <h2>Delivery Address</h2>
                                    <p>Your default delivery location</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="profile-address-edit-grid">
                                    <div className="profile-edit-field full">
                                        <label>Street Address</label>
                                        <input type="text" name="Street" value={formData.Street} onChange={handleChange}/>
                                    </div>
                                    <div className="profile-edit-field">
                                        <label>City</label>
                                        <input type="text" name="City" value={formData.City} onChange={handleChange}/>
                                    </div>
                                    <div className="profile-edit-field">
                                        <label>State</label>
                                        <input type="text" name="State" value={formData.State} onChange={handleChange}/>
                                    </div>
                                    <div className="profile-edit-field">
                                        <label>Pincode</label>
                                        <input type="text" name="Pincode" value={formData.Pincode} onChange={handleChange} maxLength="6"/>
                                    </div>
                                    <div className="profile-edit-field">
                                        <label>Country</label>
                                        <input type="text" name="Country" value={formData.Country} onChange={handleChange}/>
                                    </div>
                                </div>
                            ) : (
                                <div className="profile-address">
                                    <div className="address-icon"><FiMapPin /></div>
                                    <div>
                                        <strong>Home Address</strong>
                                        <p>{user?.Address?.Street || "N/A"}</p>
                                        <p>{user?.Address?.City || ""} {user?.Address?.State ? `, ${user.Address.State}` : ""}</p>
                                        <p>{user?.Address?.Pincode || ""} {user?.Address?.Country ? `, ${user.Address.Country}` : ""}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACCOUNT INFO */}
                        <div className="profile-card">
                            <div className="profile-card-title">
                                <div className="profile-title-icon"><FiCalendar /></div>
                                <div>
                                    <h2>Account Information</h2>
                                    <p>Details about your account</p>
                                </div>
                            </div>

                            <div className="account-information">
                                <div>
                                    <span>User ID</span>
                                    <strong>{user?.id || "N/A"}</strong>
                                </div>
                                <div>
                                    <span>Account Status</span>
                                    <strong className="account-active">{user?.Status || "Active"}</strong>
                                </div>
                                <div>
                                    <span>Member Since</span>
                                    <strong>{formatDate(user?.createdAt)}</strong>
                                </div>
                                <div>
                                    <span>Last Updated</span>
                                    <strong>{formatDate(user?.updatedAt)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* LOGOUT */}
                        {!isEditing && (
                            <div className="profile-logout-section">
                                <div>
                                    <h3>Logout from your account</h3>
                                    <p>You will need to login again to access your account.</p>
                                </div>

                                <button className="profile-logout-btn" onClick={handleLogout}>
                                    <FiLogOut />
                                    Logout
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default UserProfile;