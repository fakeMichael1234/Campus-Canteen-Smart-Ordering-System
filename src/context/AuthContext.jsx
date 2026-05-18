import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { menuItems } from "../data/menu";
import {
  auth,
  db,
  enablePersistentAuth,
  googleProvider,
  isFirebaseConfigured,
} from "../lib/firebase";
import {
  createOrder,
  ensureUserProfile,
  saveCart,
  saveFavorites,
  saveSettings as saveSettingsDocument,
  subscribeUserCart,
  subscribeUserFavorites,
  subscribeUserNotifications,
  subscribeUserOrders,
  subscribeUserProfile,
  subscribeUserSettings,
  updateUserProfile,
} from "../lib/firestore";
import { getCartItems } from "../lib/utils";

const AuthContext = createContext(null);

const initialUserData = {
  profile: null,
  cart: { items: [] },
  favorites: { itemIds: [] },
  orders: [],
  settings: null,
  notifications: { items: [] },
};

const cacheKey = (uid) => `campusBites:${uid}:cache`;

function loadCache(uid) {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(uid)) || "null");
  } catch {
    return null;
  }
}

function writeCache(uid, data) {
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify({ ...data, cachedAt: new Date().toISOString() }));
  } catch {
    /* Local cache is optional. Firestore remains the source of truth. */
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [data, setData] = useState(initialUserData);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;
    enablePersistentAuth().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      setAuthError("");
      setAuthLoading(true);

      if (!user) {
        setCurrentUser(null);
        setData(initialUserData);
        setAuthLoading(false);
        return;
      }

      try {
        await ensureUserProfile(user);
        if (active) setCurrentUser(user);
      } catch (error) {
        console.error(error);
        if (active) setAuthError(error.message || "Unable to sync your account.");
      } finally {
        if (active) setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser || !db) {
      setData(initialUserData);
      return undefined;
    }

    const cached = loadCache(currentUser.uid);
    if (cached) {
      setData((previous) => ({ ...previous, ...cached }));
    }

    setDataLoading(true);
    const pending = new Set(["profile", "cart", "favorites", "orders", "settings", "notifications"]);
    const markReady = (key) => {
      pending.delete(key);
      if (pending.size === 0) setDataLoading(false);
    };

    const onError = (key) => (error) => {
      console.error(error);
      markReady(key);
    };

    const unsubscribers = [
      subscribeUserProfile(
        currentUser.uid,
        (profile) => {
          setData((previous) => ({ ...previous, profile }));
          markReady("profile");
        },
        onError("profile")
      ),
      subscribeUserCart(
        currentUser.uid,
        (cart) => {
          setData((previous) => ({ ...previous, cart }));
          markReady("cart");
        },
        onError("cart")
      ),
      subscribeUserFavorites(
        currentUser.uid,
        (favorites) => {
          setData((previous) => ({ ...previous, favorites }));
          markReady("favorites");
        },
        onError("favorites")
      ),
      subscribeUserOrders(
        currentUser.uid,
        (orders) => {
          setData((previous) => ({ ...previous, orders }));
          markReady("orders");
        },
        onError("orders")
      ),
      subscribeUserSettings(
        currentUser.uid,
        (settings) => {
          setData((previous) => ({ ...previous, settings }));
          markReady("settings");
        },
        onError("settings")
      ),
      subscribeUserNotifications(
        currentUser.uid,
        (notifications) => {
          setData((previous) => ({ ...previous, notifications }));
          markReady("notifications");
        },
        onError("notifications")
      ),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    writeCache(currentUser.uid, data);
  }, [currentUser, data]);

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      const message = "Firebase is not configured. Add your Firebase web app values to .env first.";
      setAuthError(message);
      throw new Error(message);
    }

    try {
      setAuthError("");
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user);
      setCurrentUser(result.user);
      return result.user;
    } catch (error) {
      const message =
        error?.code === "auth/popup-closed-by-user"
          ? "Google sign-in was closed before it finished."
          : error.message || "Google sign-in failed. Please try again.";
      setAuthError(message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setCurrentUser(null);
    setData(initialUserData);
  }, []);

  const cartItems = useMemo(() => getCartItems(data.cart?.items || [], menuItems), [data.cart]);
  const favoriteIds = data.favorites?.itemIds || [];

  const persistCart = useCallback(
    async (items) => {
      if (!currentUser) return;
      setData((previous) => ({ ...previous, cart: { ...previous.cart, items } }));
      await saveCart(currentUser.uid, items);
    },
    [currentUser]
  );

  const addToCart = useCallback(
    async (item, quantity = 1) => {
      const existing = data.cart?.items || [];
      const found = existing.find((entry) => entry.id === item.id);
      const next = found
        ? existing.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: Number(entry.quantity || 0) + quantity }
              : entry
          )
        : [...existing, { id: item.id, quantity }];
      await persistCart(next.filter((entry) => entry.quantity > 0));
    },
    [data.cart, persistCart]
  );

  const updateCartQuantity = useCallback(
    async (itemId, quantity) => {
      const next = (data.cart?.items || [])
        .map((entry) => (entry.id === itemId ? { ...entry, quantity } : entry))
        .filter((entry) => Number(entry.quantity) > 0);
      await persistCart(next);
    },
    [data.cart, persistCart]
  );

  const replaceCart = useCallback(
    async (items) => {
      await persistCart(items.map((item) => ({ id: item.id, quantity: Number(item.quantity || 1) })));
    },
    [persistCart]
  );

  const clearCart = useCallback(async () => {
    await persistCart([]);
  }, [persistCart]);

  const toggleFavorite = useCallback(
    async (itemId) => {
      if (!currentUser) return;
      const current = data.favorites?.itemIds || [];
      const next = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      setData((previous) => ({ ...previous, favorites: { ...previous.favorites, itemIds: next } }));
      await saveFavorites(currentUser.uid, next);
    },
    [currentUser, data.favorites]
  );

  const saveProfile = useCallback(
    async (profilePatch) => {
      if (!currentUser) return;
      await updateUserProfile(currentUser.uid, profilePatch);
    },
    [currentUser]
  );

  const saveSettings = useCallback(
    async (settingsPatch) => {
      if (!currentUser) return;
      await saveSettingsDocument(currentUser.uid, settingsPatch);
    },
    [currentUser]
  );

  const placeOrder = useCallback(
    async (payment) => {
      if (!currentUser) throw new Error("Sign in required.");
      if (cartItems.length === 0) throw new Error("Your cart is empty.");
      return createOrder(currentUser.uid, data.profile, cartItems, payment);
    },
    [currentUser, data.profile, cartItems]
  );

  const value = useMemo(
    () => ({
      isFirebaseConfigured,
      currentUser,
      authLoading,
      dataLoading,
      authError,
      profile: data.profile,
      cart: data.cart,
      cartItems,
      favorites: data.favorites,
      favoriteIds,
      orders: data.orders || [],
      settings: data.settings,
      notifications: data.notifications,
      loginWithGoogle,
      logout,
      addToCart,
      updateCartQuantity,
      replaceCart,
      clearCart,
      toggleFavorite,
      saveProfile,
      saveSettings,
      placeOrder,
    }),
    [
      currentUser,
      authLoading,
      dataLoading,
      authError,
      data,
      cartItems,
      favoriteIds,
      loginWithGoogle,
      logout,
      addToCart,
      updateCartQuantity,
      replaceCart,
      clearCart,
      toggleFavorite,
      saveProfile,
      saveSettings,
      placeOrder,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
