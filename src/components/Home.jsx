import React from 'react'
import { Link } from 'react-router-dom'
import Nav from "./Navbar"
import Hero from "./Hero"
import Footer from "./Footer"
import FoodCategories from "./FoodCategories"
import Restaurants from "./Restaurants"

const Home = () => {
  return (
    <div>
      <Nav/>
      <Hero/>
      <FoodCategories/>
      <Restaurants/>
      <Footer/>
    </div>
  )
}

export default Home

