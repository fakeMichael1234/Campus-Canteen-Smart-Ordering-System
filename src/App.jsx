import { AnimatePresence } from "framer-motion";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { LoadingScreen } from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import EBill from "./pages/EBill";
import Landing from "./pages/Landing";
import Menu from "./pages/Menu";
import OrderVerify from "./pages/OrderVerify";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

function ProtectedShell() {
  const { currentUser, authLoading, dataLoading } = useAuth();

  if (authLoading) return <LoadingScreen label="Checking your saved Google session" />;
  if (!currentUser) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-premium-radial pb-24 md:pb-0">
      <Navbar />
      {dataLoading ? <LoadingScreen /> : <Outlet />}
      <BottomNav />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ebill" element={<EBill />} />
        </Route>
        <Route path="/verify/:uid/:orderId" element={<OrderVerify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
