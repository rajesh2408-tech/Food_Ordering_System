import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import FoodCategories from './components/FoodCategories.jsx'
import Footer from './components/Footer'
import Home from './components/Home'
import Navbar from './components/Navbar'
import RestaurantMenu from './components/RestaurantMenu.jsx'
import Restaurants from './components/Restaurants'

import AdminLayout from './layouts/AdminLayout'

import Analytics from "./pages/Admin/AdminAnalytics.jsx"
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import FoodItems from "./pages/Admin/AdminFoodItems.jsx"
import AdminRestaurants from "./pages/Admin/AdminRestaurants.jsx"
import AdminSettings from "./pages/Admin/AdminSettings.jsx"
import Orders from "./pages/Admin/Orders.jsx"
import Users from "./pages/Admin/Users.jsx"

import CategoryRestaurants from './pages/Users/CategoryRestaurants'
import Checkout from '../src/pages/Users/CheckOut.jsx'
import UserLogin from './pages/Users/UserLogin'
import UserReg from './pages/Users/UserReg'

import Cart from './pages/Cart.jsx'

import UserProfile from './pages/Users/UserProfile'
import AdminProtectedRoute from './pages/protected/AdminProtectedRoute.jsx'
import UserProtectedRoute from './pages/protected/UserProtectedRoute.jsx'

const Allroutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nav" element={<Navbar />} />
        <Route path="/foodcategories" element={<FoodCategories />} />
        <Route path="/category/:category" element={<CategoryRestaurants />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantMenu />}/>
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/reg" element={<UserReg />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/footer" element={<Footer />} />

        <Route path="/profile" element={<UserProtectedRoute><UserProfile /></UserProtectedRoute>} />

        <Route path='/admin' element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>

          <Route index element={<Navigate to="admindashboard" replace />} />
          <Route path="admindashboard" element={<AdminDashboard />} />
          <Route path="adminsettings" element={<AdminSettings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="foods" element={<FoodItems />} />
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AdminSettings />} />

        </Route>

      </Routes>
    </div>
  )
}

export default Allroutes;