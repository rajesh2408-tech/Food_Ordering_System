# Food Ordering System

A modern **Food Ordering System** built with **React**, **React Router**, **Axios**, **JSON Server**, and **CSS**. The application allows users to browse restaurants, explore food categories, view detailed menus, search for restaurants and food items, manage a cart, place orders, view nutrition information, and use a dedicated admin dashboard to manage the platform.

## Features

### User Features

- Browse available restaurants
- Browse food by category
- Search restaurants, cuisines, cities, and food items
- View complete restaurant information
- View restaurant ratings, delivery time, cost for two, address, and offers
- Filter menu items by category
- View detailed food information in a modal
- View food price, discount, rating, preparation time, nutrition, and allergens
- Add food items to cart
- Increase or decrease item quantity
- View cart subtotal
- Persistent cart using `localStorage`
- Checkout with delivery address
- Payment options: Cash on Delivery, UPI, and Card
- View order nutrition summary
- Place orders
- User login and logout
- User profile and profile editing
- View all other restaurants at the bottom of the restaurant menu page

### Admin Features

- Admin dashboard
- Manage restaurants
- Add, edit, and delete restaurants
- Manage food items inside restaurants
- Add, edit, delete, and enable/disable food items
- Manage users
- Manage orders
- Update order status
- View order details
- View nutrition and allergen details
- Analytics dashboard
- Application settings

## Tech Stack

### Frontend

- React
- React Router DOM
- JavaScript
- HTML5
- CSS3
- Axios
- React Icons

### Backend / Mock API

- JSON Server

### Browser Storage

- Local Storage

## Main Pages

- Home
- Login
- Registration
- User Profile
- Food Categories
- Restaurant Listing
- Restaurant Menu
- Food Details
- Cart
- Checkout
- Admin Dashboard
- Admin Orders
- Admin Restaurants
- Admin Food Items
- Admin Users
- Admin Analytics
- Admin Settings

## Project Structure

```text
food-ordering-system/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Home.jsx
│   │   ├── FoodCategories.jsx
│   │   ├── Restaurants.jsx
│   │   └── RestaurantMenu.jsx
│   ├── context/
│   │   └── CartContext.jsx
│   ├── layouts/
│   │   └── AdminLayout.jsx
│   ├── pages/
│   │   ├── Users/
│   │   │   ├── UserLogin.jsx
│   │   │   ├── UserRegister.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   └── CategoryRestaurants.jsx
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminRestaurants.jsx
│   │   │   ├── AdminFoodItems.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminAnalytics.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── Cart.jsx
│   │   └── Checkout.jsx
│   ├── services/
│   │   ├── auth.js
│   │   └── user.js
│   ├── styles/
│   │   ├── navbar.css
│   │   ├── RestaurantMenu.css
│   │   ├── Cart.css
│   │   └── ...
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── Allroutes.jsx
│   └── main.jsx
├── db.json
├── package.json
├── README.md
└── vite.config.js
```

> The exact folder structure may vary depending on how the project files are organized.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/food-ordering-system.git
cd food-ordering-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Main Packages If Needed

```bash
npm install react-router-dom axios react-icons
npm install json-server
```

## Running the Project

### Start the React Application

```bash
npm run dev
```

The Vite development server will usually run at:

```text
http://localhost:5173
```

### Start JSON Server

```bash
npx json-server --watch db.json --port 4000
```

The API will be available at:

```text
http://localhost:4000
```

## API Configuration

Example shared API configuration:

```javascript
export const BASE_URL = "http://localhost:4000";
```

Example request:

```javascript
axios.get(`${BASE_URL}/restaurants`);
```

## JSON Server Database

A basic `db.json` structure can look like this:

```json
{
  "users": [],
  "restaurants": [],
  "orders": [],
  "settings": []
}
```

## Restaurant Data Structure

```json
{
  "id": "RES001",
  "Name": "Spice Garden",
  "Description": "A popular restaurant serving fresh and flavorful dishes.",
  "RestaurantImage": "restaurant-image-url",
  "CoverImage": "cover-image-url",
  "Cuisine": ["Biryani", "South Indian", "Dosa"],
  "FoodType": "Both",
  "Rating": 4.4,
  "TotalReviews": 1162,
  "AverageCostForTwo": 450,
  "DeliveryTime": "20-30 mins",
  "DeliveryFee": 0,
  "MinimumOrder": 99,
  "Status": "Active",
  "Address": {
    "Street": "Main Road",
    "City": "Hyderabad",
    "State": "Telangana",
    "Pincode": "500001",
    "Country": "India"
  },
  "Items": []
}
```

## Food Item Data Structure

```json
{
  "id": "ITEM0001",
  "Name": "Paneer Biryani",
  "Description": "Flavorful paneer biryani served with aromatic rice.",
  "Category": "Biryani",
  "FoodType": "Veg",
  "Price": 389,
  "Discount": 15,
  "DiscountedPrice": 331,
  "Image": "food-image-url",
  "Rating": 4.9,
  "TotalReviews": 727,
  "IsAvailable": true,
  "IsBestSeller": true,
  "IsRecommended": false,
  "PreparationTime": "30-35 mins",
  "Nutrition": {
    "ServingSize": "1 serving",
    "Calories": 594,
    "Protein": "28g",
    "Carbohydrates": "75g",
    "Fat": "22g",
    "Fiber": "4g",
    "Sugar": "5g",
    "Sodium": "900mg"
  },
  "Allergens": ["Dairy"]
}
```

## Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/restaurants` | Get all restaurants |
| GET | `/restaurants/:id` | Get restaurant by ID |
| POST | `/restaurants` | Add a restaurant |
| PATCH | `/restaurants/:id` | Update a restaurant |
| DELETE | `/restaurants/:id` | Delete a restaurant |
| GET | `/users` | Get users |
| POST | `/users` | Register a user |
| PATCH | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |
| GET | `/orders` | Get all orders |
| POST | `/orders` | Create an order |
| PATCH | `/orders/:id` | Update an order |
| DELETE | `/orders/:id` | Delete an order |

## Application Routes

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<UserLogin />} />
  <Route path="/register" element={<UserRegister />} />
  <Route path="/profile" element={<UserProfile />} />
  <Route path="/category/:category" element={<CategoryRestaurants />} />
  <Route path="/restaurant/:id" element={<RestaurantMenu />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />
</Routes>
```

## Restaurant Search

The navbar search supports filtering using:

- Restaurant name
- Cuisine
- Food item name
- City

Example searches:

```text
Biryani
Pizza
Paneer Biryani
Spice Garden
Hyderabad
South Indian
```

Selecting a restaurant from the search results opens its restaurant menu page.

## Restaurant Menu

The restaurant menu page displays:

- Restaurant name and description
- Cuisine
- Address
- Rating and total reviews
- Delivery time
- Cost for two
- Restaurant image
- Offers
- Food categories
- Food menu
- Food discounts
- Food ratings
- Preparation time
- Add-to-cart controls
- Food details modal
- Nutrition information
- Allergen information
- Bottom cart bar
- Other restaurants section

At the bottom of the page, users can browse other available restaurants if they want to explore a different menu.

## Food Details Modal

Selecting a food item opens a detailed modal that can display:

- Food image
- Name
- Restaurant
- Veg / Non-Veg type
- Bestseller status
- Recommended status
- Original price
- Discounted price
- Discount percentage
- Rating
- Reviews
- Description
- Category
- Preparation time
- Nutrition
- Allergens
- Quantity controls
- Item total

The modal can be closed using the close button, clicking outside the modal, or pressing the `Esc` key.

## Cart Management

The cart is implemented using React Context.

Supported operations include:

```javascript
addToCart();
decreaseQuantity();
removeFromCart();
clearCart();
getItemQuantity();
```

The application calculates total cart items, item quantity, item price, and subtotal. Cart data is stored in `localStorage`, so it remains available after a page refresh.

## Checkout

The checkout page can display:

- Selected food items
- Quantity
- Item price
- Nutrition information
- Total nutrition
- Allergens
- Delivery address
- Payment method
- Bill details
- Order total

When an order is confirmed, it can be stored in the JSON Server `/orders` collection.

## Authentication

The current implementation uses `localStorage` to store the logged-in user.

```javascript
localStorage.setItem("loggedInUser", JSON.stringify(user));
```

Logout:

```javascript
localStorage.removeItem("loggedInUser");
```

> For a production application, use secure backend authentication with hashed passwords, sessions or JWTs, proper authorization, and secure storage.

## Admin Dashboard

### Restaurant Management

Admins can add, edit, delete, activate, or deactivate restaurants and manage restaurant information.

### Food Management

Admins can add, edit, and delete menu items, update availability, manage prices and discounts, and maintain nutrition and allergen information.

### Order Management

Admins can view orders, search and filter them, update order status, delete orders, and inspect ordered items, nutrition, and allergens.

### User Management

Admins can view, update, and delete users.

### Analytics

The analytics page can display information such as total users, restaurants, orders, revenue, top restaurants, and order statistics.

## Responsive Design

The application is designed to support:

- Desktop
- Laptop
- Tablet
- Mobile

Restaurant cards, menu sections, search results, modals, navigation, and other layouts adapt to different screen sizes using CSS media queries.

## Screenshots

Add your application screenshots here.

### Home Page

```text
Add Home Page screenshot
```

### Restaurant Menu

```text
Add Restaurant Menu screenshot
```

### Food Details

```text
Add Food Details Modal screenshot
```

### Cart

```text
Add Cart Page screenshot
```

### Checkout

```text
Add Checkout Page screenshot
```

### Admin Dashboard

```text
Add Admin Dashboard screenshot
```

## Future Improvements

- Real backend using Node.js and Express
- MongoDB / MySQL / PostgreSQL database
- JWT authentication
- Password hashing
- Google authentication
- Online payment gateway
- Live order tracking
- Restaurant maps and locations
- User reviews and ratings
- Wishlist / favorite restaurants
- Coupon system
- Delivery partner module
- Email and SMS order notifications
- Order history
- Restaurant owner dashboard
- Pagination
- Advanced search filters
- Image uploads
- Cloud image storage
- Real-time order updates
- Better role-based authorization

## Security Note

JSON Server and `localStorage` authentication are suitable for learning, prototyping, and development, but they should not be used as the only security mechanisms in production.

A production system should include:

- Server-side authentication
- Authorization
- Password hashing
- HTTPS
- Input validation
- Secure tokens
- Role-based access control
- Protected APIs
- Database validation

## Learning Objectives

This project demonstrates practical use of:

- React components
- React Hooks
- `useState`
- `useEffect`
- React Router
- Dynamic routing
- Context API
- API integration
- Axios
- CRUD operations
- Local Storage
- Search and filtering
- Conditional rendering
- Responsive CSS
- JSON Server
- State management
- Form handling
- Admin dashboard development

## Author

**Rajesh Cheruku**

## License

This project is intended for educational and portfolio purposes.

You can add a specific open-source license such as the MIT License if you plan to publish the project publicly.

## Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
