export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const formatDate = (value) => {
  if (!value) return "Just now";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (value) => {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const calculateTotals = (items = []) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const platformFee = subtotal > 0 ? 2 : 0;
  const gst = subtotal * 0.05;
  const total = subtotal + gst + platformFee;
  return { subtotal, gst, platformFee, pickupFee: 0, total };
};

export const getCartItems = (cartItems = [], menuItems = []) =>
  cartItems
    .map((cartItem) => {
      const menuItem = menuItems.find((item) => item.id === cartItem.id);
      if (!menuItem) return null;
      return {
        ...menuItem,
        quantity: Number(cartItem.quantity || 0),
      };
    })
    .filter(Boolean);

export const getFirstName = (name = "Student") => name.trim().split(" ")[0] || "Student";

export const classNames = (...values) => values.filter(Boolean).join(" ");

export const orderStatusSteps = ["Confirmed", "Preparing", "Ready", "Completed"];

export const getOrderProgress = (status = "Confirmed") => {
  const index = Math.max(orderStatusSteps.indexOf(status), 0);
  return {
    index,
    percent: (index / (orderStatusSteps.length - 1)) * 100,
  };
};

export const buildOrderId = () =>
  `CB${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;
