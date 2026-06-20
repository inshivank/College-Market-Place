import { useEffect, useRef, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useMessaging } from "../context/MessagingContext";
import UserAvatar from "./UserAvatar";

const emojis = ["😀", "👍", "🙏", "✨", "🎉", "❤️", "🤝", "💯"];

export default function ChatModal({ open, onClose, conversationId: initialConversationId, item: initialItem, seller: initialSeller }) {
  const { user } = useAuth();
  const { refresh: refreshInbox } = useMessaging();
  const [conversationId, setConversationId] = useState(initialConversationId || null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(Boolean(initialConversationId));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { setConversationId(initialConversationId || null); setConversation(null); setMessages([]); setError(""); }, [initialConversationId, open]);
  async function load(id, silent = false) {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/messages/${id}`);
      setConversation(data.conversation); setMessages(data.messages);
      await api.patch("/messages/read", { conversationId: id });
      refreshInbox({ silent: true }).catch(() => {});
    } catch (requestError) { if (!silent) setError(requestError.response?.data?.message || "Could not load this conversation"); }
    finally { if (!silent) setLoading(false); }
  }
  useEffect(() => {
    if (!open || !conversationId) return undefined;
    load(conversationId);
    const timer = window.setInterval(() => load(conversationId, true), 10000);
    return () => window.clearInterval(timer);
  }, [open, conversationId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: messages.length > 1 ? "smooth" : "auto" }); }, [messages, sending]);
  useEffect(() => { if (!image) { setPreview(""); return undefined; } const url = URL.createObjectURL(image); setPreview(url); return () => URL.revokeObjectURL(url); }, [image]);
  useEffect(() => { if (!open) return undefined; const close = (event) => event.key === "Escape" && onClose(); document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [open, onClose]);

  const item = conversation?.item || initialItem;
  const seller = conversation?.seller || initialSeller;
  const buyer = conversation?.buyer;
  const isSeller = conversation && String(conversation.seller?._id) === String(user?.id);
  const otherUser = isSeller ? buyer : seller;
  const blocked = conversation?.blockedBy?.length > 0;

  function selectImage(event) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Attachment must be an image.");
    if (file.size > 10 * 1024 * 1024) return setError("Image must be 10 MB or smaller.");
    setError(""); setImage(file);
  }
  async function send(event) {
    event.preventDefault(); if ((!text.trim() && !image) || blocked) return;
    setSending(true); setError("");
    try {
      const form = new FormData(); form.append("text", text.trim()); if (image) form.append("image", image);
      let response;
      if (conversationId) response = await api.post(`/messages/${conversationId}`, form);
      else { form.append("itemId", item._id); response = await api.post("/messages", form); setConversation(response.data.conversation); setConversationId(response.data.conversation._id); }
      setMessages((current) => [...current, response.data.message]); setText(""); setImage(null); if (fileRef.current) fileRef.current.value = "";
      refreshInbox({ silent: true }).catch(() => {});
    } catch (requestError) { setError(requestError.response?.data?.message || "Could not send message"); }
    finally { setSending(false); }
  }
  async function toggleBlock() { try { const next = !blocked; await api.patch(`/messages/${conversationId}/block`, { blocked: next }); await load(conversationId, true); } catch (requestError) { setError(requestError.response?.data?.message || "Could not update block status"); } }
  async function markSold() { try { await api.put(`/items/${item._id}`, { status: "sold" }); setConversation((current) => ({ ...current, item: { ...current.item, status: "sold" } })); } catch (requestError) { setError(requestError.response?.data?.message || "Could not mark item as sold"); } }
  async function reportSeller() { const reason = window.prompt("Tell us why you’re reporting this seller (minimum 10 characters):"); if (!reason) return; try { const { data } = await api.post(`/messages/${conversationId}/report`, { reason }); window.alert(data.message); } catch (requestError) { setError(requestError.response?.data?.message || "Could not submit report"); } }

  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-0 backdrop-blur-sm sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-label={`Chat with ${otherUser?.name || seller?.name || "seller"}`} className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(760px,90vh)] sm:max-w-2xl sm:rounded-3xl">
      <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3"><UserAvatar user={otherUser || seller}/><div className="min-w-0 flex-1"><p className="truncate font-black">{otherUser?.name || seller?.name || "Seller"}</p><p className="truncate text-xs text-slate-500">About {item?.title}{item?.status === "sold" ? " · Sold" : ""}</p></div>{conversationId && <div className="flex gap-1">{isSeller ? <><button type="button" onClick={markSold} disabled={item?.status === "sold"} title="Mark item sold" className="rounded-lg px-2 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-50 disabled:text-slate-300">Sold</button><button type="button" onClick={toggleBlock} className="rounded-lg px-2 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50">{blocked ? "Unblock" : "Block"}</button></> : <button type="button" onClick={reportSeller} className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100">Report</button>}</div>}<button type="button" onClick={onClose} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded-full text-2xl text-slate-400 hover:bg-slate-100">×</button></header>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">{item?.images?.[0] ? <img src={item.images[0]} alt="" className="h-11 w-11 rounded-lg object-cover"/> : <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-100">🛍️</span>}<div><p className="line-clamp-1 text-sm font-bold">{item?.title}</p>{item?.price !== undefined && <p className="text-xs font-black text-teal-700">Rs. {Number(item.price).toLocaleString("en-IN")}</p>}</div></div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4" aria-live="polite">{loading ? <div className="space-y-4">{[1,2,3].map((value) => <div key={value} className={`h-14 animate-pulse rounded-2xl bg-slate-200 ${value % 2 ? "mr-24" : "ml-24"}`}/>)}</div> : messages.length === 0 ? <div className="grid h-full place-items-center text-center"><div><span className="text-5xl">👋</span><h2 className="mt-3 text-xl font-black">Start the conversation</h2><p className="mt-1 text-sm text-slate-500">Ask about condition, availability, or where to meet on campus.</p></div></div> : messages.map((message, index) => { const mine = String(message.sender?._id || message.sender) === String(user?.id); const isLastMine = mine && index === messages.length - 1; return <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className="max-w-[82%]"><div className={`overflow-hidden rounded-2xl ${mine ? "rounded-br-md bg-teal-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>{message.image && <a href={message.image} target="_blank" rel="noreferrer"><img src={message.image} alt="Message attachment" className="max-h-72 w-full object-cover"/></a>}{message.text && <p className="whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-5">{message.text}</p>}</div><p className={`mt-1 text-[10px] text-slate-400 ${mine ? "text-right" : "text-left"}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{isLastMine && ` · ${message.read ? "Seen" : "Sent"}`}</p></div></div>; })}{sending && <div className="flex justify-end"><div className="flex gap-1 rounded-2xl rounded-br-md bg-teal-100 px-4 py-3"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600 [animation-delay:120ms]"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600 [animation-delay:240ms]"/></div></div>}<div ref={bottomRef}/></div>
      {error && <p role="alert" className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">{error}</p>}{blocked ? <div className="border-t border-slate-200 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">Messaging has been disabled for this conversation.</div> : <form onSubmit={send} className="relative border-t border-slate-100 bg-white p-3">{preview && <div className="absolute bottom-full left-3 mb-2 rounded-xl border bg-white p-2 shadow-xl"><img src={preview} alt="Attachment preview" className="h-20 w-24 rounded-lg object-cover"/><button type="button" onClick={() => setImage(null)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white">×</button></div>}{showEmojis && <div className="absolute bottom-full left-12 mb-2 grid grid-cols-4 gap-1 rounded-xl border bg-white p-2 shadow-xl">{emojis.map((emoji) => <button key={emoji} type="button" onClick={() => { setText((current) => current + emoji); setShowEmojis(false); }} className="rounded p-1 text-xl hover:bg-slate-100">{emoji}</button>)}</div>}<div className="flex items-end gap-2"><input ref={fileRef} type="file" accept="image/*" onChange={selectImage} className="sr-only"/><button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach image" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100">📷</button><button type="button" onClick={() => setShowEmojis((value) => !value)} aria-label="Choose emoji" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100">☺</button><textarea rows="1" maxLength="2000" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(event); } }} placeholder="Message…" className="max-h-28 min-h-10 resize-none rounded-2xl bg-slate-100"/><button type="submit" disabled={sending || (!text.trim() && !image)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-700 text-white disabled:opacity-40" aria-label="Send message">➤</button></div></form>}
    </section>
  </div>;
}
