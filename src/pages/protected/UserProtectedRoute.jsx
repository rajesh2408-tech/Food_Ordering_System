import React from "react";
import { Navigate } from "react-router-dom";

const UserProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admin should not access normal user profile
    if (user.Role?.toLowerCase() === "admin") {
        return <Navigate to="/admin/admindashboard" replace />;
    }

    return children;
};

export default UserProtectedRoute;