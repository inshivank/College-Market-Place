import { useMemo, useState } from "react";
import ChatModal from "../components/ChatModal";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { useMessaging } from "../context/MessagingContext";

function relativeTime(date) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "now"; if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`; if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const { user } = useAuth();
  const { conversations, loading } = useMessaging();
  const [selected, setSelected] = useState(null);
  const sorted = useMemo(() => [...conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [conversations]);

  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><section className="mb-6"><p className="text-sm font-black uppercase text-teal-700">Your conversations</p><h1 className="text-4xl font-black">Inbox</h1><p className="mt-1 text-slate-500">Chat with buyers and sellers without leaving the marketplace.</p></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <div className="divide-y divide-slate-100">{[1,2,3,4].map((value) => <div key={value} className="flex animate-pulse gap-4 p-4"><div className="h-14 w-14 rounded-full bg-slate-200"/><div className="flex-1 space-y-2"><div className="h-4 w-1/3 rounded bg-slate-200"/><div className="h-3 w-3/4 rounded bg-slate-100"/></div></div>)}</div> : sorted.length === 0 ? <div className="grid min-h-96 place-items-center p-8 text-center"><div><span className="text-6xl">💬</span><h2 className="mt-4 text-2xl font-black">No conversations yet</h2><p className="mx-auto mt-2 max-w-sm text-slate-500">When you contact a seller—or a buyer messages you—your conversations will appear here.</p></div></div> : <div className="divide-y divide-slate-100">{sorted.map((conversation) => { const isSeller = String(conversation.seller?._id) === String(user?.id); const other = isSeller ? conversation.buyer : conversation.seller; return <button key={conversation._id} type="button" onClick={() => setSelected(conversation)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 sm:gap-4"><div className="relative"><UserAvatar user={other} className="h-12 w-12 sm:h-14 sm:w-14"/>{conversation.unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</span>}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className={`truncate ${conversation.unreadCount ? "font-black text-slate-950" : "font-bold text-slate-800"}`}>{other?.name || "Marketplace user"}</p><time className="shrink-0 text-xs text-slate-400">{relativeTime(conversation.updatedAt)}</time></div><p className="truncate text-xs font-bold text-teal-700">{conversation.item?.title || "Deleted listing"}</p><p className={`mt-0.5 truncate text-sm ${conversation.unreadCount ? "font-bold text-slate-700" : "text-slate-500"}`}>{conversation.lastMessage || "Conversation started"}</p></div>{conversation.item?.images?.[0] && <img src={conversation.item.images[0]} alt="" className="hidden h-14 w-14 rounded-xl object-cover sm:block"/>}</button>; })}</div>}</section>
    <ChatModal open={Boolean(selected)} onClose={() => setSelected(null)} conversationId={selected?._id}/>
  </main>;
}
