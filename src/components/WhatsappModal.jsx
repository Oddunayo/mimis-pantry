import { useState } from "react";

export default function WhatsAppModal({ isOpen, onClose, cart }) {
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    deliveryDate: "",
    note: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

   
    const phoneNumber = "2348147369469"; 

    let text = `*NEW ORDER - MIMI'S PANTRY* 🍩\n\n`;
    text += `*Customer Name:* ${customer.name}\n`;
    text += `*Delivery Address:* ${customer.address}\n`;
    text += `*Preferred Date:* ${customer.deliveryDate}\n`;
    if (customer.note) text += `*Special Note:* ${customer.note}\n`;
    text += `\n-------------------------\n`;
    text += `*ITEMS ORDERED:*\n`;

    cart.forEach((item, index) => {
      text += `${index + 1}. ${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    text += `-------------------------\n`;
    text += `*TOTAL AMOUNT:* ₦${total.toLocaleString()}\n\n`;
    text += `Please confirm availability and payment instructions!`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Delivery Details</h3>
        <p className="text-xs text-gray-500 mb-6">Complete your information to send your order via WhatsApp.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Cole"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address / Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Ikeja, Lagos"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Date</label>
            <input
              type="date"
              required
              value={customer.deliveryDate}
              onChange={(e) => setCustomer({ ...customer, deliveryDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Extra Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Extra pepper sauce please!"
              value={customer.note}
              onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              💬 Send Order on WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}