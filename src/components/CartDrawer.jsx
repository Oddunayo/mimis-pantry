export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onCheckout }) {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Your Order Tray 🍩</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-2">🧺</p>
                <p className="font-medium">Your tray is empty.</p>
                <p className="text-xs text-gray-400 mt-1">Add some sweet treats from the menu!</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.imageUrl || "https://via.placeholder.com/60"} 
                      alt={item.name} 
                      className="w-14 h-14 object-cover rounded-xl"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-amber-600 text-xs font-bold mt-0.5">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="text-gray-600 font-bold hover:text-amber-600 px-1"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-1">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-600 font-bold hover:text-amber-600 px-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Total */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-amber-50/50 space-y-4">
              <div className="flex items-center justify-between font-extrabold text-gray-900">
                <span>Total Amount</span>
                <span className="text-xl text-amber-600">₦{totalAmount.toLocaleString()}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-600/20"
              >
                <span>Continue to Delivery Info</span>
                <span>→</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}