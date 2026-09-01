import React, {createContext, useContext, useEffect, useState, } from "react";

const CartContext = createContext(null);
export const CartProvider = ({children}) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Unable to load cart:", error);
      return [];
    }
  });

  // SAVE CART
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  // ITEM PRICE
  const getItemPrice = (item) => {
    if (item.Discount > 0 && item.DiscountedPrice !== undefined) {
      return Number(item.DiscountedPrice);
    }

    return Number(item.Price);
  };

  
  // ADD ITEM
  const addToCart = (item, restaurant) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find((cartItem) => cartItem.id === item.id);

      // ITEM ALREADY EXISTS
      if (existingItem) {
        return previousCart.map((cartItem) => cartItem.id === item.id ? {...cartItem, quantity: cartItem.quantity + 1,} : cartItem);
      }

      // NEW ITEM
      return [
        ...previousCart,

        {
          ...item,
          quantity: 1,
          restaurantId: restaurant?.id || "",
          restaurantName: restaurant?.Name || "",
          restaurantAddress: restaurant?.Address?.Street || "",
          restaurantCity: restaurant?.Address?.City || "",
          restaurantImage: restaurant?.RestaurantImage || "",
        },
      ];
    });
  };

  // DECREASE
  const decreaseQuantity = (itemId) => {
    setCart((previousCart) =>
      previousCart.map((item) =>item.id === itemId ? { ...item, quantity: item.quantity - 1,} : item )
        .filter((item) =>item.quantity > 0)
    );
  };

  // REMOVE ITEM
  const removeFromCart = (itemId) => {
    setCart((previousCart) => previousCart.filter((item) => item.id !== itemId));
  };

  // CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  // GET ITEM QUANTITY
  const getItemQuantity = (itemId) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  // TOTAL ITEMS
  const totalCartItems =
    cart.reduce((total, item) => total + item.quantity, 0);

  // SUBTOTAL
  const subtotal =
    cart.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, decreaseQuantity, removeFromCart, clearCart, getItemQuantity, getItemPrice, totalCartItems, subtotal, }}>
      {children}
    </CartContext.Provider>
  );
};

// CUSTOM HOOK
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};