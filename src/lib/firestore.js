import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { buildOrderId, calculateTotals } from "./utils";

const defaultSettings = {
  theme: "light",
  notificationsEnabled: true,
  orderUpdates: true,
  marketing: false,
  preferredCanteen: "Main Canteen",
};

const defaultPaymentPreferences = {
  preferredMethod: "UPI",
  upiId: "",
  saveForNextOrder: true,
};

const asPlainObject = (snapshot) => (snapshot.exists() ? snapshot.data() : null);

export async function ensureUserProfile(firebaseUser) {
  if (!db || !firebaseUser) return;

  const { uid, email, displayName, photoURL, phoneNumber } = firebaseUser;
  const userRef = doc(db, "users", uid);
  const userSnapshot = await getDoc(userRef);
  const now = serverTimestamp();

  if (!userSnapshot.exists()) {
    await setDoc(userRef, {
      uid,
      email,
      fullName: displayName || "",
      googleName: displayName || "",
      phoneNumber: phoneNumber || "",
      registeredMobile: "",
      hostel: "",
      address: "",
      department: "",
      year: "",
      registerNumber: "",
      profilePicture: photoURL || "",
      favoritesCount: 0,
      orderCount: 0,
      totalAmountSpent: 0,
      recentlyOrdered: [],
      preferences: {
        dietary: "all",
        spiceLevel: "medium",
        pickupWindow: "asap",
      },
      paymentPreferences: defaultPaymentPreferences,
      authProvider: "google",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      schemaVersion: 2,
    });
  } else {
    await setDoc(
      userRef,
      {
        email,
        googleName: displayName || userSnapshot.data().googleName || "",
        profilePicture: photoURL || userSnapshot.data().profilePicture || "",
        lastLoginAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  const seedIfMissing = async (reference, payload) => {
    const snapshot = await getDoc(reference);
    if (!snapshot.exists()) {
      await setDoc(reference, payload);
    }
  };

  await Promise.all([
    seedIfMissing(doc(db, "cart", uid), { items: [], updatedAt: now }),
    seedIfMissing(doc(db, "favorites", uid), { itemIds: [], updatedAt: now }),
    seedIfMissing(doc(db, "settings", uid), { ...defaultSettings, updatedAt: now }),
    seedIfMissing(doc(db, "notifications", uid), { items: [], updatedAt: now }),
    seedIfMissing(doc(db, "orders", uid), { uid, updatedAt: now }),
  ]);
}

export function subscribeUserProfile(uid, callback, onError) {
  return onSnapshot(doc(db, "users", uid), (snapshot) => callback(asPlainObject(snapshot)), onError);
}

export function subscribeUserCart(uid, callback, onError) {
  return onSnapshot(
    doc(db, "cart", uid),
    (snapshot) => callback(asPlainObject(snapshot) || { items: [] }),
    onError
  );
}

export function subscribeUserFavorites(uid, callback, onError) {
  return onSnapshot(
    doc(db, "favorites", uid),
    (snapshot) => callback(asPlainObject(snapshot) || { itemIds: [] }),
    onError
  );
}

export function subscribeUserSettings(uid, callback, onError) {
  return onSnapshot(
    doc(db, "settings", uid),
    (snapshot) => callback({ ...defaultSettings, ...(asPlainObject(snapshot) || {}) }),
    onError
  );
}

export function subscribeUserNotifications(uid, callback, onError) {
  return onSnapshot(
    doc(db, "notifications", uid),
    (snapshot) => callback(asPlainObject(snapshot) || { items: [] }),
    onError
  );
}

export function subscribeUserOrders(uid, callback, onError) {
  const ordersQuery = query(
    collection(db, "orders", uid, "history"),
    orderBy("createdAt", "desc"),
    limit(80)
  );

  return onSnapshot(
    ordersQuery,
    (snapshot) => callback(snapshot.docs.map((entry) => ({ firestoreId: entry.id, ...entry.data() }))),
    onError
  );
}

export async function updateUserProfile(uid, profilePatch) {
  await setDoc(
    doc(db, "users", uid),
    {
      ...profilePatch,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveCart(uid, items) {
  await setDoc(
    doc(db, "cart", uid),
    {
      items,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveFavorites(uid, itemIds) {
  await setDoc(
    doc(db, "favorites", uid),
    {
      itemIds,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "users", uid),
    {
      favoritesCount: itemIds.length,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveSettings(uid, settingsPatch) {
  await setDoc(
    doc(db, "settings", uid),
    {
      ...settingsPatch,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function createOrder(uid, profile, items, payment) {
  const orderRef = doc(collection(db, "orders", uid, "history"));
  const userRef = doc(db, "users", uid);
  const cartRef = doc(db, "cart", uid);
  const notificationsRef = doc(db, "notifications", uid);
  const totals = calculateTotals(items);
  const orderId = buildOrderId();
  const createdAtIso = new Date().toISOString();

  const order = {
    id: orderRef.id,
    orderId,
    uid,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image,
      category: item.category,
      veg: item.veg,
    })),
    subtotal: Number(totals.subtotal.toFixed(2)),
    gst: Number(totals.gst.toFixed(2)),
    platformFee: Number(totals.platformFee.toFixed(2)),
    pickupFee: 0,
    total: Number(totals.total.toFixed(2)),
    paymentMethod: payment.method,
    paymentReference: payment.reference,
    paymentStatus: payment.method === "Pay at Counter" ? "Pending at counter" : "Paid",
    status: "Confirmed",
    profileSnapshot: {
      fullName: profile?.fullName || profile?.googleName || "",
      email: profile?.email || "",
      phoneNumber: profile?.phoneNumber || "",
      registeredMobile: profile?.registeredMobile || "",
      hostel: profile?.hostel || "",
      address: profile?.address || "",
      department: profile?.department || "",
      year: profile?.year || "",
      registerNumber: profile?.registerNumber || "",
      profilePicture: profile?.profilePicture || "",
    },
    createdAt: serverTimestamp(),
    createdAtIso,
    updatedAt: serverTimestamp(),
  };

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const user = userSnapshot.exists() ? userSnapshot.data() : {};
    const existingRecent = Array.isArray(user.recentlyOrdered) ? user.recentlyOrdered : [];
    const incomingRecent = order.items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      orderedAt: createdAtIso,
    }));
    const mergedRecent = [...incomingRecent, ...existingRecent]
      .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, 10);

    const userPatch = {
      totalAmountSpent: Number(user.totalAmountSpent || 0) + order.total,
      orderCount: Number(user.orderCount || 0) + 1,
      recentlyOrdered: mergedRecent,
      lastOrderAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (payment.savePreference) {
      userPatch.paymentPreferences = {
        preferredMethod: payment.method,
        upiId: payment.upiId || "",
        saveForNextOrder: true,
      };
    }

    transaction.set(orderRef, order);
    transaction.set(userRef, userPatch, { merge: true });
    transaction.set(cartRef, { items: [], updatedAt: serverTimestamp() }, { merge: true });
    transaction.set(
      notificationsRef,
      {
        items: arrayUnion({
          id: `${orderId}-confirmed`,
          type: "order",
          title: "Order confirmed",
          body: `${order.items.length} item order is now in the canteen queue.`,
          orderId,
          read: false,
          createdAt: createdAtIso,
        }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  return order;
}
