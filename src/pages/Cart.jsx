import React from "react";
import { useNavigate } from "react-router-dom";
import {FaArrowLeft, FaTrash, FaLocationDot, } from "react-icons/fa6";
import { useCart } from "../context/CartContext.jsx";
import "../styles/cart.css";
const Cart = () => {
    const navigate = useNavigate();
    const {cart, addToCart, decreaseQuantity, removeFromCart, clearCart, totalCartItems, subtotal, getItemPrice, } = useCart();

    // You can later get these values from backend/database
    const deliveryFee = subtotal >= 499 ? 0 : 40;
    const platformFee = cart.length > 0 ? 6 : 0;
    const gst = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + platformFee + gst;
        
    // Restaurant data from cart
    const restaurant = cart.length > 0 ? {id: cart[0].restaurantId, name: cart[0].restaurantName, address: cart[0].restaurantAddress, } : null;

    if (cart.length === 0) {
        return (
            <main className="empty-cart-page">
                <div className="empty-cart-container">
                    <div className="empty-cart-icon">🛒</div>
                    <h1>Your cart is empty</h1>
                    <p>You can go to the restaurant page and add some delicious food.</p>
                    <button onClick={() => navigate("/")}>SEE RESTAURANTS</button>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
          {/* TOP */}
            <div className="cart-page-header">
                <button className="cart-back-button" onClick={() => navigate(-1)}><FaArrowLeft />Back</button>
                <h1>Your Cart</h1>
            </div>

            {/* CONTENT */}
            <div className="cart-main-layout">

                {/* LEFT SIDE */}
                <section className="cart-left-section">
                    {/* RESTAURANT */}
                    <div className="cart-restaurant-card">
                        <div>
                            <p className="cart-small-title">ORDER FROM</p>
                            <h2>{restaurant?.name}</h2>
                            <p><FaLocationDot />{restaurant?.address}</p>
                        </div>
                        <button onClick={() => navigate(`/restaurant/${restaurant.id}`)}>VIEW MENU</button>
                    </div>

                    {/* ITEMS */}
                    <section className="cart-items-container">
                        <div className="cart-items-heading">
                            <h2>Cart Items</h2>
                            <span>{totalCartItems}{" "} {totalCartItems === 1 ? "item" : "items"}</span>
                        </div>

                        {cart.map((item) => (
                            <article className="cart-item" key={item.id}>

                                {/* IMAGE */}
                                <div className="cart-item-image">
                                    <img src={item.Image} alt={item.Name}/>
                                </div>

                                {/* DETAILS */}
                                <div className="cart-item-details">
                                    <div className={item.FoodType === "Veg" ? "cart-food-type veg" : "cart-food-type non-veg"}>
                                        <span></span>
                                    </div>

                                    <h3>{item.Name}</h3>
                                    <p className="cart-item-description">{item.Description}</p>

                                    <div className="cart-item-prices">
                                        {item.Discount > 0 && (
                                            <span className="cart-old-price">₹{item.Price}</span>
                                        )}
                                        <span className="cart-current-price">₹{getItemPrice(item)}</span>
                                    </div>

                                    {/* NUTRITION */}
                                    {item.Nutrition && (
                                        <div className="cart-nutrition">
                                            <p className="nutrition-title">Nutrition per serving</p>
                                            <div className="nutrition-badges">

                                                {item.Nutrition.Calories !== undefined && (
                                                    <div className="nutrition-badge">
                                                        <span>🔥</span>
                                                        <div>
                                                            <strong>{item.Nutrition.Calories}</strong>
                                                            <small>kcal</small>
                                                        </div>
                                                    </div>
                                                )}

                                                {item.Nutrition.Protein && (
                                                    <div className="nutrition-badge">
                                                        <span>💪</span>
                                                        <div>
                                                            <strong>{item.Nutrition.Protein}</strong>
                                                            <small>Protein</small>
                                                        </div>
                                                    </div>
                                                )}

                                                {item.Nutrition.Carbohydrates && (
                                                    <div className="nutrition-badge">
                                                        <span>🌾</span>
                                                        <div>
                                                            <strong>{item.Nutrition.Carbohydrates}</strong>
                                                            <small>Carbs</small>
                                                        </div>
                                                    </div>
                                                )}

                                                {item.Nutrition.Fat && (
                                                    <div className="nutrition-badge">
                                                        <span>🥑</span>
                                                        <div>
                                                            <strong>{item.Nutrition.Fat}</strong>
                                                            <small>Fat</small>
                                                        </div>
                                                    </div>
                                                )}

                                                {item.Nutrition.Fiber && (
                                                    <div className="nutrition-badge">
                                                        <span>🌿</span>
                                                        <div>
                                                            <strong>{item.Nutrition.Fiber}</strong>
                                                            <small>Fiber</small>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* QUANTITY + PRICE */}
                                <div className="cart-item-actions">
                                    <div className="cart-quantity">
                                        <button onClick={() => decreaseQuantity(item.id)}>−</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => addToCart(item, {id: item.restaurantId, Name: item.restaurantName, Address: {Street: item.restaurantAddress, }, })}>+</button>
                                    </div>
                                    <strong> ₹ {getItemPrice(item) * item.quantity}</strong>
                                    <button className="cart-remove-button" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                                </div>

                            </article>

                        ))}
                        <button className="clear-cart-button" onClick={clearCart}>Clear Cart</button>

                    </section>

                </section>

            {/* RIGHT SIDE - BILL */}
                <aside className="cart-bill">

                    <h2>Bill Details</h2>

                    <div className="bill-row">
                        <span>Item Total</span>
                        <span>₹{subtotal}</span>
                    </div>

                    <div className="bill-row">
                        <span>Delivery Fee</span>
                        {deliveryFee === 0 ? (<span className="free-delivery">FREE</span>) : (<span>₹{deliveryFee}</span>)}
                    </div>

                    <div className="bill-row">
                        <span>Platform Fee</span>
                        <span>₹{platformFee}</span>
                    </div>

                    <div className="bill-row">
                        <span>GST & Restaurant Charges</span>
                        <span>₹{gst}</span>
                    </div>
                    <div className="bill-line"></div>
                    <div className="bill-total">
                        <span>TO PAY</span>
                        <strong>₹{totalAmount}</strong>
                    </div>

                    {subtotal < 499 && (
                        <p className="free-delivery-message">Add ₹{499 - subtotal} more to get FREE delivery</p>
                    )}
                    <button className="checkout-button" onClick={() => navigate("/checkout")}>PROCEED TO CHECKOUT</button>
                </aside>

            </div>

        </main>
    );
};

export default Cart;