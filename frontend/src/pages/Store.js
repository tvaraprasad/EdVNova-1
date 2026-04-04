import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Plus } from 'lucide-react';
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
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Store</p>
                            <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter font-medium text-primary mb-4">
                                Study essentials
                            </h1>
                            <p className="text-lg text-text-secondary">
                                Workbooks, notes, guides, and study kits to support your learning journey.
                            </p>
                        </div>
                        <Link
                            to="/store/cart"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
                            data-testid="view-cart-button"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            View Cart ({cartCount})
                        </Link>
                    </div>
                </div>
            </section>

            {/* Filter & Products */}
            <section className="section bg-white">
                <div className="container-custom">
                    {/* Filter */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setFilter(category)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                    filter === category
                                        ? 'bg-accent text-white'
                                        : 'bg-background text-text-secondary hover:bg-border'
                                }`}
                                data-testid={`filter-${category}`}
                            >
                                {category === 'all' ? 'All Products' : category}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-text-secondary">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary">No products found.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="premium-card overflow-hidden group" data-testid={`product-card-${product.id}`}>
                                    <div className="aspect-square overflow-hidden bg-background">
                                        <img
                                            src={product.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs text-text-secondary">{product.category}</span>
                                        <h3 className="font-heading text-lg font-medium text-primary mt-1 mb-2 line-clamp-1">
                                            {product.title}
                                        </h3>
                                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xl font-bold text-primary">₹{product.price?.toLocaleString()}</p>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stock === 0}
                                                className="p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                                                data-testid={`add-to-cart-${product.id}`}
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        {product.stock <= 5 && product.stock > 0 && (
                                            <p className="text-xs text-amber-600 mt-2">Only {product.stock} left</p>
                                        )}
                                        {product.stock === 0 && (
                                            <p className="text-xs text-red-600 mt-2">Out of stock</p>
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
