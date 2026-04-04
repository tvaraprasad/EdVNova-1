import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, MessageCircle, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Cart() {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: 'Pune',
        pincode: '',
        notes: ''
    });
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/store/cart' } } });
            return;
        }

        setProcessing(true);
        try {
            const fullAddress = `${formData.address}, ${formData.city} - ${formData.pincode}`;
            
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                shipping_address: fullAddress,
                phone: formData.phone
            };

            const response = await axios.post(`${API_URL}/api/orders/create`, orderData, {
                withCredentials: true
            });

            // Mock payment
            await axios.post(`${API_URL}/api/orders/${response.data.id}/mock-payment`, {}, {
                withCredentials: true
            });

            toast.success('Order placed successfully!');
            setOrderComplete(true);
            
            // Send order details to WhatsApp
            const orderItems = cart.map(item => `• ${item.title} x${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}`).join('\n');
            const whatsappMessage = encodeURIComponent(
                `🛒 *New Order from EdVNova Store*\n\n` +
                `*Customer Details:*\n` +
                `Name: ${formData.name}\n` +
                `Phone: ${formData.phone}\n` +
                `Email: ${formData.email}\n\n` +
                `*Shipping Address:*\n${fullAddress}\n\n` +
                `*Order Items:*\n${orderItems}\n\n` +
                `*Total: ₹${cartTotal.toLocaleString()}*\n\n` +
                `${formData.notes ? `Notes: ${formData.notes}` : ''}`
            );
            
            // Redirect to WhatsApp after 2 seconds
            setTimeout(() => {
                window.open(`https://wa.me/919652546434?text=${whatsappMessage}`, '_blank');
                clearCart();
            }, 2000);
            
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to place order');
        } finally {
            setProcessing(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center bg-background" data-testid="order-complete">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-primary mb-4">Order Placed!</h1>
                    <p className="text-gray-600 mb-4">
                        Your order has been placed successfully. We're redirecting you to WhatsApp to confirm your order details.
                    </p>
                    <p className="text-accent font-semibold mb-8">
                        Redirecting to WhatsApp...
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center bg-background" data-testid="empty-cart">
                <div className="text-center">
                    <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h1 className="font-heading text-3xl font-bold text-primary mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">Browse our store to find study materials</p>
                    <Link
                        to="/store"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="cart-page">
            <div className="container-custom py-12 md:py-16">
                <Link to="/store" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                </Link>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <h1 className="font-heading text-3xl font-bold text-primary mb-8">Shopping Cart ({cart.length})</h1>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="premium-card p-6 flex gap-6" data-testid={`cart-item-${item.id}`}>
                                    <img
                                        src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}
                                        alt={item.title}
                                        className="w-28 h-28 object-cover rounded-xl"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-primary text-lg">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                                        <p className="text-xl font-bold text-primary">₹{item.price?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            data-testid={`remove-item-${item.id}`}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-white rounded transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-white rounded transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary & Checkout */}
                    <div>
                        <div className="premium-card p-8 sticky top-24">
                            <h2 className="font-heading text-xl font-bold text-primary mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between text-xl font-bold text-primary">
                                        <span>Total</span>
                                        <span>₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {!showCheckout ? (
                                <button
                                    onClick={() => isAuthenticated ? setShowCheckout(true) : navigate('/login', { state: { from: { pathname: '/store/cart' } } })}
                                    className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
                                    data-testid="proceed-to-checkout"
                                >
                                    {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                                </button>
                            ) : (
                                <form onSubmit={handleCheckout} className="space-y-5">
                                    <div>
                                        <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                            required
                                            className="mt-2 h-11"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            required
                                            className="mt-2 h-11"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                            required
                                            className="mt-2 h-11"
                                            data-testid="phone-input"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="address" className="text-gray-700 font-medium">Full Address *</Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="House/Flat No., Street, Area, Landmark"
                                            required
                                            rows={3}
                                            className="mt-2"
                                            data-testid="shipping-address-input"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                                required
                                                className="mt-2 h-11"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="pincode" className="text-gray-700 font-medium">Pincode *</Label>
                                            <Input
                                                id="pincode"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                placeholder="411001"
                                                required
                                                className="mt-2 h-11"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="notes" className="text-gray-700 font-medium">Order Notes (Optional)</Label>
                                        <Input
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Any special instructions?"
                                            className="mt-2 h-11"
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                                        data-testid="place-order-button"
                                    >
                                        {processing ? 'Processing...' : (
                                            <>
                                                <MessageCircle className="w-5 h-5" />
                                                Place Order
                                            </>
                                        )}
                                    </button>
                                    
                                    <p className="text-xs text-gray-500 text-center">
                                        Order details will be sent to WhatsApp for confirmation
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
