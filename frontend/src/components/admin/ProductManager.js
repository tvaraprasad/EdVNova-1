import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Upload, Package } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [uploading, setUploading] = useState(false);

    const defaultForm = { title: '', description: '', category: 'Workbooks', price: 0, stock: 50, image_url: '', file_url: '' };
    const [formData, setFormData] = useState(defaultForm);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/manage/products`, { withCredentials: true });
            setProducts(res.data);
        } catch { toast.error('Failed to load products'); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const openAdd = () => { setEditItem(null); setFormData(defaultForm); setShowForm(true); };
    const openEdit = (p) => {
        setEditItem(p);
        setFormData({
            title: p.title, description: p.description || '', category: p.category || 'Workbooks',
            price: p.price || 0, stock: p.stock || 0, image_url: p.image_url || '', file_url: p.file_url || ''
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        try {
            const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
            if (editItem) {
                await axios.put(`${API_URL}/api/admin/products/${editItem.id}`, payload, { withCredentials: true });
                toast.success('Product updated');
            } else {
                await axios.post(`${API_URL}/api/admin/products`, payload, { withCredentials: true });
                toast.success('Product created');
            }
            setShowForm(false);
            fetchProducts();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/products/${id}`, { withCredentials: true });
            toast.success('Product deleted');
            fetchProducts();
        } catch { toast.error('Failed to delete'); }
    };

    const handleFileUpload = async (e, field, type) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_type', type);
            const res = await axios.post(`${API_URL}/api/uploads/file`, fd, {
                withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, [field]: res.data.file_url }));
            toast.success(`${file.name} uploaded`);
        } catch { toast.error('Upload failed'); }
        finally { setUploading(false); }
    };

    return (
        <div data-testid="product-manager">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary">Products ({products.length})</h3>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors" data-testid="add-product-btn">
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                    <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow" data-testid={`product-card-${p.id}`}>
                        {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-32 object-cover rounded-lg mb-4" />}
                        <h4 className="font-semibold text-primary mb-1">{p.title}</h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-primary">₹{p.price?.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                            </div>
                            <div className="flex gap-1">
                                <span className={`px-2 py-0.5 text-xs rounded font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t">
                            <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"><Edit className="w-3.5 h-3.5" /> Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center gap-1 py-2 px-3 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No products yet. Add your first product.</p>
                    </div>
                )}
            </div>

            {/* Form Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit' : 'Add'} Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="mt-1" data-testid="product-title-input" /></div>
                        <div><Label>Description *</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={3} className="mt-1" /></div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><Label>Category</Label>
                                <select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    {['Workbooks', 'Notes', 'Kits', 'Stationery', 'Digital'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div><Label>Price (₹) *</Label><Input type="number" value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} className="mt-1" /></div>
                            <div><Label>Stock *</Label><Input type="number" value={formData.stock} onChange={e => setFormData(p => ({...p, stock: e.target.value}))} className="mt-1" /></div>
                        </div>
                        <div><Label>Image URL</Label><Input value={formData.image_url} onChange={e => setFormData(p => ({...p, image_url: e.target.value}))} className="mt-1" placeholder="https://..." /></div>
                        <div>
                            <Label>Downloadable File (optional)</Label>
                            <label className="mt-1 flex items-center gap-2 px-4 py-3 bg-gray-50 border border-dashed rounded-lg cursor-pointer hover:bg-gray-100 text-sm w-full">
                                <Upload className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-500">{formData.file_url ? 'Replace file' : 'Upload file'}</span>
                                <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'file_url', 'products')} />
                            </label>
                            {formData.file_url && <p className="text-xs text-green-600 mt-1">File: {formData.file_url}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={uploading} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50" data-testid="save-product-btn">
                                {uploading ? 'Uploading...' : (editItem ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
