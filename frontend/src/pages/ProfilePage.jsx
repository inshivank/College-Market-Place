import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";
import ItemCard from "../components/ItemCard";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const [ownItems, setOwnItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  async function fetchProfileData() {
    const [itemsResponse, wishlistResponse] = await Promise.all([
      api.get("/items"),
      api.get("/wishlist")
    ]);

    setOwnItems(
      itemsResponse.data.items.filter((item) => String(item.seller?._id || item.seller) === String(user.id))
    );
    setWishlist(wishlistResponse.data.items);
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase text-teal-700">Profile</p>
        <h1 className="text-3xl font-black">{user.name}</h1>
        <p className="text-slate-500">{user.email} {user.rollNumber ? `· ${user.rollNumber}` : ""}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Your listings</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ownItems.map((item) => <ItemCard key={item._id} item={item} onWishlistChange={fetchProfileData} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black">Wishlist</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((item) => <ItemCard key={item._id} item={item} onWishlistChange={fetchProfileData} />)}
        </div>
      </section>
    </main>
  );
}
