import React from "react";
import {Navigate} from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user) {
    return (<Navigate to="/login" replace/>);
  }

  if (user.Role?.toLowerCase() !== "admin") {
    return (<Navigate to="/" replace/>);
  }

  return children;
};

export default AdminProtectedRoute;