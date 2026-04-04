import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Store() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { addToCart, cartCount } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/products`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = ['all', ...new Set(products.map(p => p.category))];
    const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`${product.title} added to cart`);
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="store-page">
            {/* Hero */}
            <section className="hero-gradient py-20 md:py-28">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div>
                            <div className="badge-accent mb-6 w-fit">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Store
                            </div>
                            <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter font-bold text-primary mb-4">
                                Study essentials
                            </h1>
                            <p className="text-xl text-gray-600">
                                Workbooks, notes, guides, and study kits to support your learning journey.
                            </p>
                        </div>
                        <Link
                            to="/store/cart"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/20"
                            data-testid="view-cart-button"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            View Cart ({cartCount})
                        </Link>
                    </div>
                </div>
            </section>

            {/* Filter & Products */}
            <section className="section section-light">
                <div className="container-custom">
                    {/* Filter */}
                    <div className="flex flex-wrap gap-3 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setFilter(category)}
                                className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 ${
                                    filter === category
                                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                data-testid={`filter-${category}`}
                            >
                                {category === 'all' ? 'All Products' : category}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-500">No products found.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="premium-card overflow-hidden group" data-testid={`product-card-${product.id}`}>
                                    <div className="aspect-square overflow-hidden bg-gray-50">
                                        <img
                                            src={product.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{product.category}</span>
                                        <h3 className="font-heading text-lg font-semibold text-primary mt-2 mb-3 line-clamp-1 group-hover:text-accent transition-colors">
                                            {product.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <p className="text-2xl font-bold text-primary">₹{product.price?.toLocaleString()}</p>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stock === 0}
                                                className="p-3 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 shadow-md shadow-accent/20"
                                                data-testid={`add-to-cart-${product.id}`}
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        {product.stock <= 5 && product.stock > 0 && (
                                            <p className="text-xs text-amber-600 font-medium mt-3">Only {product.stock} left</p>
                                        )}
                                        {product.stock === 0 && (
                                            <p className="text-xs text-red-600 font-medium mt-3">Out of stock</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
