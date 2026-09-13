// frontend/src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import type { Cart } from '../types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  cartCount: number;
  cartTotal: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Sepeti Backend'den Çek
  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      const responseData = res.data.data?.cart;

      // Backend getCart: { cart: Cart, totalPrice: number, itemCount: number } dönüyor
      if (responseData && responseData.cart) {
        setCart(responseData.cart);
      } else {
        setCart(responseData || null);
      }
    } catch (err) {
      console.error('Sepet getirilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı değiştiğinde (Giriş yapınca / Çıkış yapınca) sepeti yenile
  useEffect(() => {
    fetchCart();
  }, [user]);

  // 2. Sepete Ürün Ekle
  const addToCart = async (productId: string, quantity = 1) => {
    try {
      // TODO 2: api.post('/cart/items', { productId, quantity }) çağır
      await api.post('/cart/items', { productId, quantity });
      // Ardından güncel sepeti almak için await fetchCart() çağır
      await fetchCart();
    } catch (err: any) {
      console.error('Ürün sepete eklenemedi:', err);
      throw err;
    }
  };

  // 3. Miktar Güncelle
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      // TODO 3: api.patch(`/cart/items/${itemId}`, { quantity }) çağır
      await api.patch(`/cart/items/${itemId}`, { quantity });
      // Ardından await fetchCart() çağır
      await fetchCart();
    } catch (err) {
      console.error('Miktar güncellenemedi:', err);
    }
  };

  // 4. Sepetten Ürün Çıkar
  const removeFromCart = async (itemId: string) => {
    try {
      // TODO 4: api.delete(`/cart/items/${itemId}`) çağır
      await api.delete(`/cart/items/${itemId}`);
      // Ardından await fetchCart() çağır
      await fetchCart();
    } catch (err) {
      console.error('Ürün silinemedi:', err);
    }
  };

  // 5. Sepeti Boşalt
  const clearCart = async () => {
    try {
      // TODO 5: api.delete('/cart') çağır
      await api.delete('/cart');
      // setCart(null) yap veya await fetchCart() çağır
      setCart(null);
    } catch (err) {
      console.error('Sepet temizlenemedi:', err);
    }
  };

  // Toplam ürün adedi (Navbar rozeti için)
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Toplam sepet tutarı
  const cartTotal = cart?.items?.reduce((sum, item) => {
    const price = Number(item.product?.price || 0);
    return sum + price * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
