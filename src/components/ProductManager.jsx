import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../config";

export default function ProductManager({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("puff-puff");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Helper function to convert & compress photo to Base64 text string
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          // Compress large photos so they don't exceed Firestore document limits
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // 70% quality JPEG
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0";

      // 1. Convert photo file to Base64 if selected
      if (imageFile) {
        finalImageUrl = await convertToBase64(imageFile);
      }

      // 2. Save product directly to Firestore
      await addDoc(collection(db, "products"), {
        name,
        category,
        price: Number(price),
        description,
        imageUrl: finalImageUrl,
        available: true,
        createdAt: serverTimestamp(),
      });

      // 3. Reset form
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      e.target.reset();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const handleSignOut = () => {
    signOut(auth);
    onLogout();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h2>
          <p className="text-xs text-gray-500">Add or manage menu items</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Add New Snack</h3>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Item Name</label>
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 capitalize"
            >
              <option value="puff-puff">Puff-Puff</option>
              <option value="pastries">Pastries</option>
              <option value="combos">Combos</option>
              <option value="drinks">Drinks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Price (₦)</label>
            <input
              type="number"
              required
              placeholder="3500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Product Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows="2"
              placeholder="Short description of ingredients or quantity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
            >
              {loading ? "Processing Image & Saving..." : "+ Save to Menu"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Products List */}
      <h3 className="font-bold text-gray-900 mb-4 text-sm">Active Menu ({products.length})</h3>
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                <p className="text-xs text-amber-600 font-semibold">₦{p.price?.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-xs text-red-500 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}