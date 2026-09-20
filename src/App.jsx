import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config";
import MenuSection from "./components/MenuSection";
import CartDrawer from "./components/CartDrawer";
import WhatsAppModal from "./components/WhatsappModal";
import AdminLogin from "./components/AdminLogin";
import ProductManager from "./components/ProductManager";
import logo from "./asset/logo.png";

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
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
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
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-gray-800 font-sans pb-24">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-pink-100 z-40 px-6 py-4 flex items-center justify-between">
        <div
          onClick={() => setView("menu")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <img
            src={logo}
            alt="Mimi's Puffpuff Logo"
            className="w-10 h-10 object-contain rounded-full border border-pink-200 shadow-xs"
          />
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Mimi's <span className="text-[#C2185B]">Puffpuff</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(view === "menu" ? "admin" : "menu")}
            className="text-xs font-bold text-gray-500 hover:text-[#C2185B] px-3 py-2 rounded-xl transition cursor-pointer"
          >
            {view === "menu" ? "Owner Portal 🔑" : "← Back to Menu"}
          </button>

          {view === "menu" && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#C2185B] hover:bg-[#a0134a] text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>🛒 Order Tray</span>
              {totalItems > 0 && (
                <span className="bg-[#EA580C] text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
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
          <div>
            {/* Hero Banner with Brand Colors & Logo Background */}
            <div className="max-w-5xl mx-auto px-4 pt-6">
              <div className="relative overflow-hidden bg-linear-to-r from-[#C2185B] via-fuchsia-700 to-[#EA580C] text-white p-6 sm:p-8 rounded-3xl shadow-lg text-center flex flex-col items-center">
                {/* Background Watermark */}
                <img 
                  src={logo} 
                  alt="" 
                  className="absolute -right-10 -bottom-10 w-60 h-60 opacity-15 pointer-events-none rounded-full blur-xs"
                />

                {/* Main Hero Logo */}
                <img 
                  src={logo} 
                  alt="Mimi's Logo" 
                  className="w-20 h-20 object-contain bg-white p-1.5 rounded-full shadow-md mb-3 border-2 border-orange-300"
                />
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
                  Mimi's Puff-Puff & Pantry
                </h2>
                <p className="text-pink-100 text-xs sm:text-sm font-medium italic">
                  a snack made with love...
                </p>
              </div>
            </div>
          <MenuSection onAddToCart={handleAddToCart} />
          </div>
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
