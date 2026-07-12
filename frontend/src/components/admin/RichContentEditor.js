import { useState, useRef } from 'react';
import axios from 'axios';
import { ImagePlus, Trash2, GripVertical, Type, Upload } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * RichContentEditor
 * Renders an array of content blocks: [{type:"text",value:""}, {type:"image",url:"",caption:""}]
 * Admin can interleave text and images freely.
 */
export default function RichContentEditor({ blocks, onChange, placeholder }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const [insertIdx, setInsertIdx] = useState(-1);

    const updateBlock = (idx, updates) => {
        const newBlocks = blocks.map((b, i) => i === idx ? { ...b, ...updates } : b);
        onChange(newBlocks);
    };

    const removeBlock = (idx) => {
        onChange(blocks.filter((_, i) => i !== idx));
    };

    const addTextBlock = (afterIdx) => {
        const newBlocks = [...blocks];
        newBlocks.splice(afterIdx + 1, 0, { type: 'text', value: '' });
        onChange(newBlocks);
    };

    const triggerImageUpload = (afterIdx) => {
        setInsertIdx(afterIdx);
        fileRef.current?.click();
    };

    const handleImageFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await axios.post(`${API_URL}/api/learning-assets/upload-image`, fd, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const newBlocks = [...blocks];
            newBlocks.splice(insertIdx + 1, 0, { type: 'image', url: res.data.url, caption: '' });
            onChange(newBlocks);
            toast.success('Image uploaded');
        } catch (err) {
            toast.error('Image upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleMediaLibraryUrl = (afterIdx, url) => {
        const newBlocks = [...blocks];
        newBlocks.splice(afterIdx + 1, 0, { type: 'image', url, caption: '' });
        onChange(newBlocks);
    };

    // If no blocks, show a single text block
    const displayBlocks = blocks.length === 0 ? [{ type: 'text', value: '' }] : blocks;

    return (
        <div className="space-y-2" data-testid="rich-content-editor">
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageFile} />

            {displayBlocks.map((block, idx) => (
                <div key={idx} className="group relative">
                    {block.type === 'text' ? (
                        <Textarea
                            value={block.value || ''}
                            onChange={e => {
                                if (blocks.length === 0) {
                                    onChange([{ type: 'text', value: e.target.value }]);
                                } else {
                                    updateBlock(idx, { value: e.target.value });
                                }
                            }}
                            rows={4}
                            className="text-sm pr-8"
                            placeholder={placeholder || 'Write content...'}
                        />
                    ) : block.type === 'image' ? (
                        <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img
                                src={block.url?.startsWith('/') ? `${API_URL}${block.url}` : block.url}
                                alt={block.caption || 'Content image'}
                                className="max-w-full max-h-64 mx-auto block"
                            />
                            <input
                                value={block.caption || ''}
                                onChange={e => updateBlock(idx, { caption: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs text-gray-500 bg-white border-t focus:outline-none"
                                placeholder="Image caption (optional)"
                            />
                        </div>
                    ) : null}

                    {/* Block actions */}
                    {blocks.length > 0 && (
                        <div className="absolute -right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5">
                            <button onClick={() => removeBlock(idx)} className="p-1 bg-white border rounded text-gray-400 hover:text-red-500 shadow-sm" title="Remove block">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* Insert controls between blocks */}
                    <div className="flex items-center justify-center gap-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => addTextBlock(idx)} className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-400 hover:text-accent bg-gray-50 hover:bg-accent/5 rounded border border-transparent hover:border-accent/20 transition-colors">
                            <Type className="w-3 h-3" /> Text
                        </button>
                        <button onClick={() => triggerImageUpload(idx)} disabled={uploading} className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-400 hover:text-accent bg-gray-50 hover:bg-accent/5 rounded border border-transparent hover:border-accent/20 transition-colors">
                            <ImagePlus className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Image'}
                        </button>
                    </div>
                </div>
            ))}

            {/* Initial add buttons when empty */}
            {blocks.length === 0 && (
                <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => onChange([{ type: 'text', value: '' }])} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-accent border border-dashed border-gray-200 rounded hover:border-accent/30">
                        <Type className="w-3 h-3" /> Add Text
                    </button>
                    <button onClick={() => triggerImageUpload(-1)} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-accent border border-dashed border-gray-200 rounded hover:border-accent/30">
                        <ImagePlus className="w-3 h-3" /> Add Image
                    </button>
                </div>
            )}
        </div>
    );
}
