
import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../config";

const CATEGORIES = [
  { value: "puff-puff", label: "Puff-Puff" },
  { value: "pastries", label: "Pastries" },
  { value: "small-chops", label: "Small Chops" },
  { value: "combos", label: "Combos" },
  { value: "drinks", label: "Drinks" },
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0";

export default function ProductManager({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("puff-puff");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        setProducts(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      },
      (error) => {
        console.error("Error loading products:", error);
        alert("Failed to load products. Please refresh the page.");
      }
    );

    return () => unsubscribe();
  }, []);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 600;
          const scale = Math.min(1, maxWidth / img.width);

          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not process the image."));
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };

        img.onerror = () => reject(new Error("Could not read the image."));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error("Could not read the file."));
      reader.readAsDataURL(file);
    });
  };

  const resetForm = () => {
    setName("");
    setCategory("puff-puff");
    setPrice("");
    setDescription("");
    setImageFile(null);
    setEditingId(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name || "");
    setCategory(product.category || "puff-puff");
    setPrice(String(product.price ?? ""));
    setDescription(product.description || "");
    setImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: name.trim(),
        category,
        price: Number(price),
        description: description.trim(),
      };

      if (!productData.name || price === "" ||
          !Number.isFinite(productData.price) ||
          productData.price < 0) {
        alert("Please enter a valid product name and price.");
        return;
      }

      if (imageFile) {
        productData.imageUrl = await convertToBase64(imageFile);
      }

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
      } else {
        productData.imageUrl = productData.imageUrl || DEFAULT_IMAGE;
        productData.available = true;
        productData.createdAt = serverTimestamp();

        await addDoc(collection(db, "products"), productData);
      }

      resetForm();
      alert(editingId ? "Product updated successfully." : "Product added successfully.");
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "products", id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error("Error signing out:", err);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Inventory Dashboard
          </h2>
          <p className="text-xs text-gray-500">Add or manage menu items</p>
        </div>

        <button
          onClick={handleSignOut}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">
          {editingId ? "Edit Menu Item" : "Add New Snack"}
        </h3>

        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Peppered Puff-Puff Box"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Price (₦)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="3500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Product Photo {editingId && "(Optional when editing)"}
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
            />
            {editingId && (
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep the current photo.
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              placeholder="Short description of ingredients or quantity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "+ Save to Menu"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 className="font-bold text-gray-900 mb-4 text-sm">
        Active Menu ({products.length})
      </h3>

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={p.imageUrl || DEFAULT_IMAGE}
                alt={p.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 text-sm truncate">
                  {p.name}
                </h4>
                <p className="text-xs text-amber-600 font-semibold">
                  ₦{Number(p.price || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {CATEGORIES.find((cat) => cat.value === p.category)?.label ||
                    p.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEdit(p)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-xs text-red-500 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
