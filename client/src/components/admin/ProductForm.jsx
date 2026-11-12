import { useState } from 'react';
import { Sparkles, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

export default function ProductForm({ initialData = null, onSuccess, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [stock, setStock] = useState(initialData?.stock ?? 10);
  const [description, setDescription] = useState(initialData?.description || '');
  const [featuresText, setFeaturesText] = useState(initialData?.features?.join('\n') || '');
  const [tagsText, setTagsText] = useState(initialData?.tags?.join(', ') || '');
  const [images, setImages] = useState(initialData?.images || []);

  const [roughNotes, setRoughNotes] = useState('');
  const [rawImageFile, setRawImageFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImageFile(file);

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData);
      setImages((prev) => [...prev, data]);
      toast.success('Image uploaded to Cloudinary');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!name && !roughNotes && !rawImageFile) {
      toast.error('Enter a product name, rough notes, or upload an image first');
      return;
    }
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('productName', name);
      formData.append('roughNotes', roughNotes);
      formData.append('category', category);
      if (rawImageFile) {
        formData.append('image', rawImageFile);
      }

      const { data } = await api.post('/ai/generate-listing', formData);
      setName(data.seoTitle);
      setDescription(data.description);
      setFeaturesText(data.features.join('\n'));
      setTagsText(data.tags.join(', '));
      if (!category && data.suggestedCategory) {
        setCategory(data.suggestedCategory);
      }
      toast.success('Gemini generated SEO title, description, features & tags!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        category,
        brand,
        price: Number(price),
        stock: Number(stock),
        description,
        features: featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
        tags: tagsText.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
        images,
      };

      if (initialData?._id) {
        await api.put(`/products/${initialData._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-bold text-slate-900">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-bold text-indigo-900">
            <Sparkles className="h-4 w-4 text-brand-600" /> Gemini AI Listing Generator
          </span>
          <button
            type="button"
            disabled={aiLoading}
            onClick={handleGenerateWithAI}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiLoading ? 'Generating...' : 'Auto-Fill Listing with AI'}
          </button>
        </div>
        <textarea
          rows={2}
          value={roughNotes}
          onChange={(e) => setRoughNotes(e.target.value)}
          placeholder="Optional: Paste rough specs or simply upload a product photo below..."
          className="w-full rounded-lg border border-indigo-200 bg-white p-2.5 text-xs outline-none focus:border-brand-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Product Title</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Electronics, Accessories, Apparel..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Price (₹ INR)</label>
          <input
            required
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Stock Quantity</label>
          <input
            required
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Product Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Key Features (one per line)
          </label>
          <textarea
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            SEO Search Tags (comma-separated)
          </label>
          <textarea
            rows={4}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Product Images</label>
        <div className="flex flex-wrap items-center gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-500 hover:text-brand-600">
            <Upload className="mb-1 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : initialData ? 'Update Product' : 'Publish Product'}
        </button>
      </div>
    </form>
  );
}
