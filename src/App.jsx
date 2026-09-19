import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config";
import MenuSection from "./components/MenuSection";
import CartDrawer from "./components/CartDrawer";
import WhatsAppModal from "./components/WhatsappModal";
import AdminLogin from "./components/AdminLogin";
import ProductManager from "./components/ProductManager";

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Navigation & Auth state
  const [view, setView] = useState("menu"); // "menu" or "admin"
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-amber-50/30 text-gray-800 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-amber-100 z-40 px-6 py-4 flex items-center justify-between">
        <h1 
          onClick={() => setView("menu")}
          className="text-xl font-black text-amber-600 tracking-tight cursor-pointer"
        >
          Mimi's Pantry 🍩
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(view === "menu" ? "admin" : "menu")}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            {view === "menu" ? "Owner Portal 🔑" : "← Back to Menu"}
          </button>

          {view === "menu" && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span>🛒 Order Tray</span>
              {totalItems > 0 && (
                <span className="bg-white text-amber-600 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content View Switcher */}
      <main>
        {view === "menu" ? (
          <MenuSection onAddToCart={handleAddToCart} />
        ) : user ? (
          <ProductManager onLogout={() => setView("menu")} />
        ) : (
          <AdminLogin onLoginSuccess={() => setView("admin")} />
        )}
      </main>

      {/* Cart & Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <WhatsAppModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
      />
    </div>
  );
}