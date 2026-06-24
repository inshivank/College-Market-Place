import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatModal from "./ChatModal";
import UserAvatar from "./UserAvatar";

export default function SellerContactCard({ item, stats }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const seller = item.seller;
  const isOwnItem = String(seller?._id || seller) === String(user?.id);
  const phone = seller?.phone?.replace(/[^\d+]/g, "");

  function openChat() {
    if (!isAuthenticated) { navigate("/login", { state: { message: "Sign in to contact this seller." } }); return; }
    if (!isOwnItem) setChatOpen(true);
  }

  return <>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-slate-950 to-teal-900 px-5 py-5 text-white"><p className="text-xs font-black uppercase tracking-widest text-teal-300">Seller profile</p><div className="mt-4 flex items-center gap-3"><UserAvatar user={seller} className="h-14 w-14"/><div className="min-w-0"><div className="flex items-center gap-1.5"><h2 className="truncate text-xl font-black">{seller?.name || "Campus Seller"}</h2>{seller?.verified && <span title="Verified seller" aria-label="Verified seller" className="grid h-5 w-5 place-items-center rounded-full bg-sky-500 text-[11px] font-black">✓</span>}</div><p className="text-xs text-slate-300">Joined {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "recently"}</p></div></div></div>
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 py-4 text-center"><div><p className="text-xl font-black">{stats?.totalListings ?? "—"}</p><p className="text-xs font-bold text-slate-400">Total listings</p></div><div><p className="text-sm font-black">Within a day</p><p className="text-xs font-bold text-slate-400">Avg. response</p></div></div>
      <div className="space-y-2 p-4">{isOwnItem ? <p className="rounded-xl bg-slate-50 p-3 text-center text-sm font-bold text-slate-500">This is your listing.</p> : <><button type="button" onClick={openChat} className="btn-primary w-full gap-2 py-3 text-base"><span>📩</span> Send Message</button><div className="grid grid-cols-3 gap-2"><a href={phone ? `tel:${phone}` : undefined} aria-disabled={!phone} onClick={(event) => !phone && event.preventDefault()} className={`rounded-xl border border-slate-200 px-2 py-2.5 text-center text-xs font-bold ${phone ? "text-slate-700 hover:bg-slate-50" : "cursor-not-allowed text-slate-300"}`}><span className="block text-lg">📞</span>Call</a><a href={phone ? `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${item.title} on College Marketplace.`)}` : undefined} target="_blank" rel="noreferrer" aria-disabled={!phone} onClick={(event) => !phone && event.preventDefault()} className={`rounded-xl border border-slate-200 px-2 py-2.5 text-center text-xs font-bold ${phone ? "text-slate-700 hover:bg-slate-50" : "cursor-not-allowed text-slate-300"}`}><span className="block text-lg">💬</span>WhatsApp</a><a href={`mailto:${seller?.email}?subject=${encodeURIComponent(`College Marketplace: ${item.title}`)}`} className="rounded-xl border border-slate-200 px-2 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"><span className="block text-lg">📧</span>Email</a></div></>}</div>
      <p className="border-t border-slate-100 px-4 py-3 text-center text-[11px] text-slate-400">Keep payments and meetups safe—use a public campus location.</p>
    </section>
    <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} item={item} seller={seller}/>
  </>;
}
