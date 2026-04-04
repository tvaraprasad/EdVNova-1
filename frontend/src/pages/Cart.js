import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Cart() {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    const [showCheckout, setShowCheckout] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/store/cart' } } });
            return;
        }

        setProcessing(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                shipping_address: shippingAddress,
                phone: phone
            };

            const response = await axios.post(`${API_URL}/api/orders/create`, orderData, {
                withCredentials: true
            });

            // Mock payment
            await axios.post(`${API_URL}/api/orders/${response.data.id}/mock-payment`, {}, {
                withCredentials: true
            });

            toast.success('Order placed successfully!');
            clearCart();
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to place order');
        } finally {
            setProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center bg-background" data-testid="empty-cart">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                    <h1 className="font-heading text-2xl font-medium text-primary mb-2">Your cart is empty</h1>
                    <p className="text-text-secondary mb-6">Browse our store to find study materials</p>
                    <Link
                        to="/store"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="cart-page">
            <div className="container-custom py-8 md:py-12">
                <Link to="/store" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <h1 className="font-heading text-2xl font-medium text-primary mb-6">Shopping Cart ({cart.length})</h1>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="premium-card p-4 flex gap-4" data-testid={`cart-item-${item.id}`}>
                                    <img
                                        src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}
                                        alt={item.title}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-primary">{item.title}</h3>
                                        <p className="text-sm text-text-secondary">{item.category}</p>
                                        <p className="text-lg font-bold text-primary mt-2">₹{item.price?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-text-secondary hover:text-red-600 transition-colors"
                                            data-testid={`remove-item-${item.id}`}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 border border-border rounded hover:bg-background"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 border border-border rounded hover:bg-background"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="premium-card p-6 sticky top-24">
                            <h2 className="font-heading text-xl font-medium text-primary mb-6">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-text-secondary">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-text-secondary">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between text-lg font-bold text-primary">
                                        <span>Total</span>
                                        <span>₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {!showCheckout ? (
                                <button
                                    onClick={() => isAuthenticated ? setShowCheckout(true) : navigate('/login')}
                                    className="w-full py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
                                    data-testid="proceed-to-checkout"
                                >
                                    {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                                </button>
                            ) : (
                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <div>
                                        <Label htmlFor="address">Shipping Address</Label>
                                        <Input
                                            id="address"
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            placeholder="Enter full address"
                                            required
                                            className="mt-2"
                                            data-testid="shipping-address-input"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter phone number"
                                            required
                                            className="mt-2"
                                            data-testid="phone-input"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                                        data-testid="place-order-button"
                                    >
                                        {processing ? 'Processing...' : 'Place Order (Mock Payment)'}
                                    </button>
                                    <p className="text-xs text-text-secondary text-center">
                                        Payment is mocked for demo purposes
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
