import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  category: "Books",
  condition: "used",
  status: "pending",
  tags: "",
  images: "",
  whatsappNumber: ""
};

export default function ListItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(id);

  useEffect(() => {
    async function loadItem() {
      if (!id) {
        return;
      }

      const { data } = await api.get(`/items/${id}`);
      setForm({
        title: data.item.title || "",
        description: data.item.description || "",
        price: data.item.price || "",
        category: data.item.category || "Books",
        condition: data.item.condition || "used",
        status: data.item.status || "pending",
        tags: data.item.tags?.join(", ") || "",
        images: data.item.images?.join(", ") || "",
        whatsappNumber: data.item.whatsappNumber || ""
      });
    }

    loadItem();
  }, [id]);

  useEffect(() => {
    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  function handleImageSelection(event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 4) {
      setError("You can upload a maximum of 4 images");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFiles(selectedFiles);
  }

  async function uploadSelectedImages() {
    if (imageFiles.length === 0) {
      return [];
    }

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));

    const { data } = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress(progressEvent) {
        if (!progressEvent.total) {
          return;
        }

        setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    });

    return data.urls;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setUploadProgress(0);
    setIsSubmitting(true);

    try {
      const manualImageUrls = form.images.split(",").map((image) => image.trim()).filter(Boolean);
      const uploadedImageUrls = await uploadSelectedImages();
      const payload = {
        ...form,
        price: Number(form.price),
        tags: form.tags,
        images: [...manualImageUrls, ...uploadedImageUrls].slice(0, 4)
      };

      const { data } = isEditing
        ? await api.put(`/items/${id}`, payload)
        : await api.post("/items", payload);

      navigate(`/items/${data.item._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save item");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase text-teal-700">Marketplace listing</p>
          <h1 className="text-3xl font-black">{isEditing ? "Edit item" : "List an item"}</h1>
        </div>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <label>
          Title
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </label>
        <label>
          Description
          <textarea rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            Price
            <input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          </label>
          <label>
            Category
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              <option>Books</option>
              <option>Electronics</option>
              <option>Clothes</option>
              <option>Others</option>
            </select>
          </label>
          <label>
            Condition
            <select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })}>
              <option value="used">Used</option>
              <option value="new">New</option>
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
          </label>
        </div>
        <label>
          Tags
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="book, coding, exam" />
        </label>
        <label>
          WhatsApp Number
          <input
            type="tel"
            value={form.whatsappNumber}
            onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })}
            placeholder="+91 98765 43210"
            autoComplete="tel"
            required={!isEditing || Boolean(form.whatsappNumber)}
          />
          <span className="mt-1 block text-xs font-normal text-slate-400">Include your country code so buyers can contact you about this listing.</span>
        </label>
        <label>
          Image URLs
          <input value={form.images} onChange={(event) => setForm({ ...form, images: event.target.value })} placeholder="https://image-one.jpg, https://image-two.jpg" />
        </label>
        <label>
          Upload Images
          <input type="file" accept="image/*" multiple onChange={handleImageSelection} />
        </label>
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previews.map((preview) => (
              <img key={preview} src={preview} alt="Selected preview" className="h-28 w-full rounded-lg object-cover ring-1 ring-slate-200" />
            ))}
          </div>
        )}
        {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
              <span>Uploading images</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-teal-700" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create listing"}
        </button>
      </form>
    </main>
  );
}
