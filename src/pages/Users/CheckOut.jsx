import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {FaArrowLeft,FaLocationDot,FaPhone,FaCreditCard,FaMoneyBillWave,FaWallet,FaShieldHalved,} from "react-icons/fa6";
import { useCart } from "../../context/CartContext.jsx";
import "../../styles/CheckOut.css";
import {BASE_URL} from "../../utils/api.js"
const Checkout = () => {
    const navigate = useNavigate();
    const {cart,subtotal, totalCartItems, getItemPrice, clearCart, } = useCart();

    // STATE
    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        house: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [errors, setErrors] = useState({});
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);

    // BILL
    const deliveryFee = subtotal >= 499 ? 0 : 40;
    const platformFee = cart.length > 0 ? 6 : 0;
    const gst = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + platformFee + gst;

    // RESTAURANT
    const restaurant =
        cart.length > 0
            ? {
                id: cart[0].restaurantId,
                name: cart[0].restaurantName,
                address: cart[0].restaurantAddress,
                city: cart[0].restaurantCity,
                image: cart[0].restaurantImage,
            }
            : null;

    // NUTRITION NUMBER HELPER
    // 28g    => 28
    // 900mg  => 900
    // 594    => 594
    const getNutritionNumber = (value) => {
        if (value === undefined || value === null || value === "") {
            return 0;
        }

        if (typeof value === "number") {
            return value;
        }

        const parsedValue = parseFloat(String(value).replace(/[^0-9.]/g, ""));

        return Number.isNaN(parsedValue)
            ? 0
            : parsedValue;
    };

    // TOTAL NUTRITION
    // Nutrition × Quantity
    const totalNutrition = useMemo(() => {
        return cart.reduce(
            (total, item) => {
                const nutrition = item.Nutrition || {};
                const quantity = Number(item.quantity) || 0;

                total.calories += getNutritionNumber(nutrition.Calories) * quantity;
                total.protein += getNutritionNumber(nutrition.Protein) * quantity;
                total.carbohydrates += getNutritionNumber(nutrition.Carbohydrates) * quantity;
                total.fat += getNutritionNumber(nutrition.Fat) * quantity;
                total.fiber += getNutritionNumber(nutrition.Fiber) * quantity;
                total.sugar += getNutritionNumber(nutrition.Sugar) * quantity;
                total.sodium += getNutritionNumber(nutrition.Sodium) * quantity;

                return total;
            },
            {
                calories: 0,
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0,
            }
        );
    }, [cart]);

    // ALLERGENS IN COMPLETE ORDER
    const orderAllergens = useMemo(() => {
        const allergens = cart.flatMap((item) => Array.isArray(item.Allergens) ? item.Allergens : []);
        return [...new Set(allergens.filter((allergen) => allergen && allergen !=="None Listed")),];
    }, [cart]);

    // ADDRESS CHANGE
    const handleChange = (event) => {
        const {name,value,} = event.target;
        setAddress((previous) => ({...previous,[name]: value,}));
        setErrors((previous) => ({ ...previous, [name]: "", }));
    };

    // VALIDATION
    const validateCheckout = () => {
        const newErrors = {};

        if (!address.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!address.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[6-9]\d{9}$/.test(address.phone)) {
            newErrors.phone = "Enter a valid 10 digit phone number";
        }

        if (!address.house.trim()) {
            newErrors.house = "House / Flat number is required";
        }

        if (!address.area.trim()) {
            newErrors.area = "Area / Street is required";
        }

        if (!address.city.trim()) {
            newErrors.city = "City is required";
        }

        if (!address.state.trim()) {
            newErrors.state = "State is required";
        }

        if (!address.pincode.trim()) {
            newErrors.pincode =
                "Pincode is required";
        } else if (!/^\d{6}$/.test(address.pincode)) {
            newErrors.pincode = "Enter a valid 6 digit pincode";
        }

        setErrors(newErrors);
        return (Object.keys(newErrors).length ===0);
    };

    // GENERATE ORDER ID
    const generateOrderId = () => {
        const timestamp = Date.now();
        const random = Math.floor(1000 + Math.random() * 9000);
        return `ORD${timestamp}${random}`;
    };

    // PLACE ORDER + SAVE TO JSON SERVER
    const placeOrder = async () => {
        // Prevent double click
        if (isPlacingOrder) {
            return;
        }

        // Empty cart protection
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // Address validation
        if (!validateCheckout()) {
            window.scrollTo({top: 0, behavior: "smooth",});
            return;
        }

        try {
            setIsPlacingOrder(true);
            const currentDate = new Date().toISOString();
            const orderId = generateOrderId();

            // CREATE ORDER OBJECT
            const orderData = {
                id: orderId,

                // RESTAURANT
                restaurant: {
                    id: restaurant?.id || "",
                    name: restaurant?.name || "",
                    address: restaurant?.address || "",
                    city: restaurant?.city || "",
                    image: restaurant?.image || "",
                },

                // CUSTOMER
                customer: {
                    fullName: address.fullName,
                    phone: address.phone,
                },

                // DELIVERY ADDRESS
                deliveryAddress: {
                    house: address.house,
                    area: address.area,
                    landmark: address.landmark,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    fullAddress: [address.house, address.area, address.landmark, address.city, address.state, address.pincode,].filter(Boolean).join(", "),
                },

                // ITEMS
                items: cart.map((item) => {
                    const itemPrice = getItemPrice(item);

                    return {
                        id: item.id,
                        Name: item.Name,
                        Description: item.Description || "",
                        Category: item.Category || "",
                        FoodType: item.FoodType || "",
                        Image: item.Image || "",
                        Price: Number(item.Price) || 0,
                        Discount: Number(item.Discount) || 0,
                        DiscountedPrice: item.DiscountedPrice !== undefined ? Number(item.DiscountedPrice): null,
                        finalPrice: itemPrice,
                        quantity: Number(item.quantity) || 1,
                        totalPrice: itemPrice * (Number(item.quantity) || 1),
                        Rating: item.Rating || 0,
                        PreparationTime: item.PreparationTime || "",
                        IsBestSeller: item.IsBestSeller || false,
                        IsRecommended: item.IsRecommended || false,
                        Nutrition: item.Nutrition || {},
                        Allergens: Array.isArray(item.Allergens) ? item.Allergens: [],
                    };
                }),

                // TOTAL ITEMS
                totalItems: totalCartItems,

                // COMPLETE ORDER NUTRITION
                nutrition: {
                    calories: Number(totalNutrition.calories.toFixed(2)),
                    protein: Number(totalNutrition.protein.toFixed(2)),
                    carbohydrates: Number(totalNutrition.carbohydrates.toFixed(2)),
                    fat: Number(totalNutrition.fat.toFixed(2)),
                    fiber: Number(totalNutrition.fiber.toFixed(2)),
                    sugar: Number(totalNutrition.sugar.toFixed(2)),
                    sodium: Number(totalNutrition.sodium.toFixed(2)),
                },
                allergens: orderAllergens,
                bill: {itemTotal: subtotal, deliveryFee: deliveryFee, platformFee: platformFee, gst: gst, totalAmount: totalAmount,},
                payment: {method: paymentMethod, displayMethod: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "upi" ? "UPI" : "Credit / Debit Card", status: paymentMethod === "cod" ? "Pending" : "Paid",},
                orderStatus: "Order Placed",
                deliveryStatus: "Waiting for restaurant confirmation",
                orderedAt: currentDate,
                updatedAt: currentDate,
            };

            // POST TO JSON SERVER
            const response = await axios.post(`${BASE_URL}/orders`, orderData);
            console.log("Order saved successfully:", response.data);

            // SAVE RESPONSE FOR SUCCESS POPUP
            setPlacedOrder(response.data);

            // SHOW SUCCESS
            setOrderSuccess(true);

        } catch (error) {
            console.error("Error placing order:",error);

            alert(
                "Unable to place your order. Please make sure JSON Server is running and try again."
            );
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // FINISH ORDER
    const finishOrder = () => {
        clearCart();
        navigate("/");
    };

    // EMPTY CART
    if (
        cart.length === 0 &&
        !orderSuccess
    ) {
        return (
            <main className="checkout-empty">
                <div>
                    <div className="checkout-empty-icon">🛒</div>
                    <h1>Your cart is empty</h1>
                    <p>Add some delicious food before proceeding to checkout.</p>
                    <button onClick={() =>navigate("/restaurants")}>VIEW RESTAURANTS</button>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
          {/* HEADER */}
            <header className="checkout-header">
                <button className="checkout-back-button" onClick={() => navigate("/cart")}><FaArrowLeft />Back to Cart</button>
                <div>
                    <h1>Checkout</h1>
                    <p>Review your food, nutrition and delivery information before placing the order.</p>
                </div>
            </header>

            <div className="checkout-layout">
            {/* LEFT SIDE */}
                <section className="checkout-left">
                 {/* YOUR ORDER */}
                    <section className="checkout-card">
                        <div className="checkout-section-heading">
                            <span className="checkout-step">1</span>
                            <div>
                                <h2>Your Order</h2>
                                <p>{totalCartItems}{" "} {totalCartItems === 1 ? "item" : "items"}{" "} from{" "} {restaurant?.name}</p>
                            </div>
                        </div>

                 {/* RESTAURANT */}
                        <div className="checkout-restaurant">
                            {restaurant?.image && (
                                <img src={restaurant.image} alt={restaurant.name}/>
                            )}
                            <div>
                                <h3>{restaurant?.name}</h3>
                                <p><FaLocationDot /><span>{restaurant?.address} {restaurant?.city && `, ${restaurant.city}`}</span> </p>
                            </div>
                        </div>

                 {/* FOOD ITEMS */}
                        <div className="checkout-items">
                            {cart.map((item) => {
                                const nutrition = item.Nutrition || {};
                                return (
                                    <article className="checkout-order-item" key={item.id}>
                                        {/* FOOD DETAILS */}
                                        <div className="checkout-item-main">
                                            <div className="checkout-item-image">
                                                <img src={item.Image} alt={item.Name}/>
                                            </div>

                                            <div className="checkout-item-info">
                                                <div className={item.FoodType === "Veg" ? "checkout-food-type veg" : "checkout-food-type non-veg"}>
                                                    <span></span>
                                                </div>
                                                <h3>{item.Name}</h3>
                                                <p className="checkout-item-description">{item.Description}</p>
                                                <div className="checkout-item-meta">
                                                    <span>
                                                        Quantity:{" "}
                                                        <strong>{item.quantity}</strong>
                                                    </span>
                                                    {item.PreparationTime && (
                                                        <span>{item.PreparationTime}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="checkout-item-price">
                                                <span>₹{getItemPrice(item)} {" "}×{" "} {item.quantity}</span>
                                                <strong>₹{getItemPrice(item) * item.quantity}</strong>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                {/* TOTAL ORDER NUTRITION */}
                        <section className="total-nutrition-section">
                            <div className="total-nutrition-heading">
                                <div>
                                    <p className="total-nutrition-label">COMPLETE ORDER</p>
                                    <h3>Total Nutrition in Your Order</h3>
                                    <span>Calculated using each item's nutrition × selected quantity</span>
                                </div>
                                <div className="total-calories">
                                    <span>🔥</span>
                                    <div>
                                        <strong>{Math.round(totalNutrition.calories)}</strong>
                                        <small>total kcal</small>
                                    </div>
                                </div>
                            </div>

                            <div className="total-nutrition-grid">
                                {/* PROTEIN */}
                                <div className="total-nutrient-card">
                                    <div className="total-nutrient-icon">💪</div>
                                    <div>
                                        <span>Protein</span>
                                        <strong>{totalNutrition.protein.toFixed(1)}g</strong>
                                    </div>
                                </div>

                                {/* CARBS */}
                                <div className="total-nutrient-card">
                                    <div className="total-nutrient-icon">🌾</div>
                                    <div>
                                        <span>Carbohydrates</span>
                                        <strong>{totalNutrition.carbohydrates.toFixed(1)}g</strong>
                                    </div>
                                </div>


                                {/* FAT */}
                                <div className="total-nutrient-card">
                                    <div className="total-nutrient-icon">🥑</div>
                                    <div>
                                        <span>Fat</span>
                                        <strong>{totalNutrition.fat.toFixed(1)}g </strong>
                                    </div>
                                </div>

                                {/* FIBER */}
                                <div className="total-nutrient-card">
                                    <div className="total-nutrient-icon">🌿</div>
                                    <div>
                                        <span>Fiber</span>
                                        <strong>{totalNutrition.fiber.toFixed(1)}g</strong>
                                    </div>
                                </div>

                                {/* SUGAR */}
                                <div className="total-nutrient-card">
                                    <div className="total-nutrient-icon">🍬</div>
                                    <div>
                                        <span>Sugar</span>
                                        <strong>{totalNutrition.sugar.toFixed(1)}g</strong>
                                    </div>
                                </div>

                                {/* SODIUM */}
                                <div className="total-nutrient-card">
                                    <div className="total-nutrient-icon">🧂</div>
                                    <div>
                                        <span>Sodium</span>
                                        <strong>{totalNutrition.sodium.toFixed(0)}mg</strong>
                                    </div>
                                </div>
                            </div>

                            {/* ORDER ALLERGENS */}
                            {orderAllergens.length >
                                0 && (
                                    <div className="order-allergen-summary">
                                        <div>
                                            <strong>⚠ Allergen Information</strong>
                                            <p>This order contains items with the following listed allergens.</p>
                                        </div>
                                        <div className="order-allergen-list">
                                            {orderAllergens.map(
                                                (allergen) => (
                                                <span key={allergen}>{allergen}</span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </section>
                    </section>

                   {/* DELIVERY ADDRESS */}
                    <section className="checkout-card">
                        <div className="checkout-section-heading">
                            <span className="checkout-step">2</span>
                            <div>
                                <h2>Delivery Address</h2>
                                <p>Where should we deliver your order?</p>
                            </div>
                        </div>

                        <div className="checkout-form">
                            {/* FULL NAME */}
                            <div className="checkout-field checkout-field-full">
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={ address.fullName } onChange={ handleChange } placeholder="Enter your full name" />
                                {errors.fullName && (
                                    <span className="checkout-error"> {errors.fullName} </span>
                                )}
                            </div>

                            {/* PHONE */}
                            <div className="checkout-field checkout-field-full">
                                <label> <FaPhone /> Phone Number</label>
                                <input type="tel" name="phone" maxLength="10" value={ address.phone } onChange={ handleChange } placeholder="10 digit mobile number" />
                                {errors.phone && (
                                    <span className="checkout-error">{errors.phone}</span>
                                )}
                            </div>

                            {/* HOUSE */}
                            <div className="checkout-field">
                                <label> House / Flat No. </label>
                                <input type="text" name="house" value={ address.house } onChange={handleChange} placeholder="House / Flat No."/>
                                {errors.house && (
                                    <span className="checkout-error">{errors.house}</span>
                                )}
                            </div>

                            {/* AREA */}
                            <div className="checkout-field">
                                <label>Area / Street</label>
                                <input type="text" name="area" value={ address.area } onChange={ handleChange } placeholder="Area / Street" />
                                {errors.area && (
                                    <span className="checkout-error">{errors.area}</span>
                                )}
                            </div>

                            {/* LANDMARK */}
                            <div className="checkout-field checkout-field-full">
                                <label>Landmark</label>
                                <input type="text" name="landmark" value={address.landmark} onChange={handleChange} placeholder="Nearby landmark (optional)"/>
                            </div>

                            {/* CITY */}
                            <div className="checkout-field">
                                <label>City</label>
                                <input type="text" name="city" value={address.city} onChange={handleChange} placeholder="City"/>
                                {errors.city && (
                                    <span className="checkout-error">{errors.city}</span>
                                )}
                            </div>

                            {/* STATE */}
                            <div className="checkout-field">
                                <label>State</label>
                                <input type="text" name="state" value={address.state} onChange={handleChange} placeholder="State"/>
                                {errors.state && (
                                    <span className="checkout-error">{errors.state}</span>
                                )}
                            </div>

                            {/* PINCODE */}
                            <div className="checkout-field">
                                <label>Pincode</label>
                                <input type="text" inputMode="numeric" name="pincode" maxLength="6" value={address.pincode} onChange={handleChange} placeholder="6 digit pincode"/>
                                {errors.pincode && (
                                    <span className="checkout-error">{errors.pincode}</span>
                                )}
                            </div>
                        </div>
                    </section>

                   {/* PAYMENT */}
                    <section className="checkout-card">
                        <div className="checkout-section-heading">
                            <span className="checkout-step">3</span>
                            <div>
                                <h2>Payment Method</h2>
                                <p>Choose how you wantto pay</p>
                            </div>
                        </div>

                        <div className="payment-methods">
                            {/* COD */}
                            <label className={paymentMethod === "cod" ? "payment-option active" : "payment-option"}>
                                <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={(event) => setPaymentMethod(event.target.value)}/>
                                <div className="payment-icon"><FaMoneyBillWave /></div>
                                <div className="payment-info">
                                    <strong>Cash on Delivery</strong>
                                    <span>Pay when your food arrives</span>
                                </div>
                            </label>

                            {/* UPI */}
                            <label className={paymentMethod === "upi" ? "payment-option active" : "payment-option"}>
                                <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={(event) => setPaymentMethod(event.target.value)}/>
                                <div className="payment-icon"><FaWallet /></div>
                                <div className="payment-info">
                                    <strong>UPI</strong>
                                    <span>Google Pay, PhonePe, Paytm and other UPI apps</span>
                                </div>
                            </label>

                            {/* CARD */}
                            <label className={paymentMethod === "card" ? "payment-option active" : "payment-option"}>
                                <input type="radio" name="payment" value="card" checked={paymentMethod ==="card"} onChange={(event) => setPaymentMethod(event.target.value)}/>
                                <div className="payment-icon"><FaCreditCard /></div>
                                <div className="payment-info">
                                    <strong>Credit / Debit Card</strong>
                                    <span>Visa, Mastercard and RuPay</span>
                                </div>
                            </label>
                        </div>
                    </section>
                </section>

                {/* RIGHT SIDE SUMMARY */}
                <aside className="checkout-summary">
                    <div className="checkout-summary-title">
                        <div>
                            <p>ORDER SUMMARY</p>
                            <h2>{restaurant?.name}</h2>
                        </div>
                        <span>{totalCartItems}{" "} {totalCartItems === 1 ? "item" : "items"}</span>
                    </div>

                    {/* NUTRITION SUMMARY */}
                    <div className="summary-nutrition">
                        <div className="summary-nutrition-title">
                            <strong>Order Nutrition</strong>
                            <span>{Math.round(totalNutrition.calories)}{" "}kcal</span>
                        </div>

                        <div className="summary-nutrition-values">
                            <div>
                                <span>Protein</span>
                                <strong>{totalNutrition.protein.toFixed(1)}g</strong>
                            </div>

                            <div>
                                <span>Carbs</span>
                                <strong>{totalNutrition.carbohydrates.toFixed(1)}g</strong>
                            </div>

                            <div>
                                <span>Fat</span>
                                <strong>{totalNutrition.fat.toFixed(1)}g</strong>
                            </div>

                            <div>
                                <span>Fiber</span>
                                <strong>{totalNutrition.fiber.toFixed(1)}g</strong>
                            </div>
                        </div>
                    </div>

                    {/* BILL */}
                    <div className="checkout-bill">
                        <div>
                            <span>Item Total</span>
                            <strong>₹{subtotal}</strong>
                        </div>

                        <div>
                            <span>Delivery Fee</span>
                            {deliveryFee === 0 ? (
                                <strong className="checkout-free">FREE</strong>
                            ) : (
                                <strong>₹{deliveryFee}</strong>
                            )}
                        </div>

                        <div>
                            <span>Platform Fee</span>
                            <strong>₹{platformFee}</strong>
                        </div>

                        <div>
                            <span>GST & Restaurant Charges</span>
                            <strong>₹{gst}</strong>
                        </div>
                    </div>

                    <div className="checkout-total">
                        <span>TO PAY</span>
                        <strong>₹{totalAmount}</strong>
                    </div>

                    {/* PLACE ORDER */}
                    <button className="place-order-button" onClick={placeOrder} disabled={isPlacingOrder}>
                        <span>{isPlacingOrder ? "PLACING ORDER..." : "PLACE ORDER"}</span>
                        {!isPlacingOrder && (
                            <strong>₹{totalAmount}</strong>
                        )}
                    </button>
                    <div className="checkout-secure">
                        <FaShieldHalved />
                        <p>Safe and secure checkout. Your order will only be confirmed after it is successfully saved.</p>
                    </div>
                </aside>
            </div>

          {/* SUCCESS POPUP */}

            {orderSuccess &&
                placedOrder && (
                    <div className="order-success-overlay">
                        <div className="order-success-popup">
                            <div className="order-success-icon">✓</div>
                            <h2>Order Placed Successfully!</h2>
                            <p className="order-success-message">Your order has been saved successfully and your food will be prepared shortly.</p>

                {/* ORDER ID */}
                            <div className="success-order-id">
                                <span>ORDER ID</span>
                                <strong>{placedOrder.id}</strong>
                            </div>

                {/* DETAILS */}
                            <div className="success-order-details">
                                <div>
                                    <span>Restaurant</span>
                                    <strong>{placedOrder.restaurant?.name}</strong>
                                </div>
                                <div>
                                    <span>Total Items</span>
                                    <strong>{placedOrder.totalItems}</strong>
                                </div>
                                <div>
                                    <span>Total Calories</span>
                                    <strong>{Math.round(placedOrder.nutrition?.calories || 0)}{" "}kcal</strong>
                                </div>
                                <div>
                                    <span>Payment</span>
                                    <strong>{placedOrder.payment?.displayMethod}</strong>
                                </div>
                                <div>
                                    <span>Payment Status</span>
                                    <strong>{placedOrder.payment ?.status}</strong>
                                </div>
                                <div>
                                    <span>Order Status</span>
                                    <strong className="success-status">{placedOrder.orderStatus}</strong>
                                </div>
                                <div className="success-total-row">
                                    <span>Total Amount</span>
                                    <strong>₹{ placedOrder .bill ?.totalAmount }</strong>
                                </div>
                            </div>
                            {/* =============================================DELIVERY============================================== */}
                            <div className="success-delivery-message">
                                <span>🛵</span>
                                <div>
                                    <strong>Order confirmed</strong>
                                    <p>Your food will be delivered as soon as possible.</p>
                                </div>
                            </div>
                            <button className="success-home-button" onClick={finishOrder}>CONTINUE SHOPPING</button>
                        </div>

                    </div>

                )}

        </main>
    );
};

export default Checkout;