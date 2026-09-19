import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../config";
import ProductCard from "./ProductCard";

const CATEGORIES = ["all", "puff-puff", "pastries", "combos", "drinks"];

export default function MenuSection({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, "products");
    
    // Query filtered products or all
    const q = selectedCategory === "all"
      ? query(productsRef)
      : query(productsRef, where("category", "==", selectedCategory));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Our Menu</h2>
        <p className="text-gray-500 text-sm mt-1">Freshly made treats for every craving</p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setLoading(true);
              setSelectedCategory(cat);
            }}
            className={`capitalize px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedCategory === cat
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading delicious menu...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No items available in this category.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}