export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="h-48 w-full overflow-hidden relative bg-amber-50">
          <img
            src={product.imageUrl || "https://via.placeholder.com/300"}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-amber-800 uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between mt-auto">
        <span className="text-lg font-extrabold text-amber-600">
          ₦{product.price?.toLocaleString()}
        </span>
        <button
          onClick={() => onAddToCart(product)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Add to Order
        </button>
      </div>
    </div>
  );
}