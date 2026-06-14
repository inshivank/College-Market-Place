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
  images: ""
};

export default function ListItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
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
        images: data.item.images?.join(", ") || ""
      });
    }

    loadItem();
  }, [id]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      tags: form.tags,
      images: form.images.split(",").map((image) => image.trim()).filter(Boolean)
    };

    try {
      const { data } = isEditing
        ? await api.put(`/items/${id}`, payload)
        : await api.post("/items", payload);
      navigate(`/items/${data.item._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save item");
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
        <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
        <label>Description<textarea rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>Price<input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
          <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Books</option><option>Electronics</option><option>Clothes</option><option>Others</option></select></label>
          <label>Condition<select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })}><option value="used">Used</option><option value="new">New</option></select></label>
          <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="pending">Pending</option><option value="active">Active</option><option value="sold">Sold</option></select></label>
        </div>
        <label>Tags<input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="book, coding, exam" /></label>
        <label>Image URLs<input value={form.images} onChange={(event) => setForm({ ...form, images: event.target.value })} placeholder="https://image-one.jpg, https://image-two.jpg" /></label>
        <button type="submit" className="btn-primary">{isEditing ? "Save changes" : "Create listing"}</button>
      </form>
    </main>
  );
}
