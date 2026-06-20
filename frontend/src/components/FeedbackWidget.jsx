import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const categories = [
  ["Bug Report", "🐞"], ["Feature Request", "💡"], ["UI / UX", "🎨"],
  ["Performance", "⚡"], ["Marketplace Listing", "🛒"], ["General Feedback", "💬"]
];
const ratingLabels = ["Poor", "Fair", "Good", "Great", "Excellent"];

function deviceDetails() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Microsoft Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  return { browser, os, screen: `${window.screen.width} × ${window.screen.height}` };
}

export default function FeedbackWidget() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const dialogRef = useRef(null);
  const fileRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [allowContact, setAllowContact] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const badgeKey = `collegeMarketplaceFeedbackSubmitted:${user?.id || "guest"}`;
  const [showBadge, setShowBadge] = useState(() => !localStorage.getItem(badgeKey));

  useEffect(() => setShowBadge(!localStorage.getItem(badgeKey)), [badgeKey]);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => event.key === "Escape" && !submitting && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKeyDown); };
  }, [open, submitting]);

  useEffect(() => {
    if (!screenshot) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(screenshot);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  function launch() {
    if (!isAuthenticated) { navigate("/login", { state: { message: "Sign in to share feedback." } }); return; }
    setOpen(true); setSuccess(false); setError("");
  }

  function chooseScreenshot(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Screenshot must be an image."); event.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setError("Screenshot must be 10 MB or smaller."); event.target.value = ""; return; }
    setError(""); setScreenshot(file);
  }

  async function submit(event) {
    event.preventDefault();
    if (!category) return setError("Choose a feedback category.");
    if (message.trim().length < 10) return setError("Please write at least 10 characters.");
    setSubmitting(true); setError("");
    try {
      const form = new FormData();
      form.append("category", category); form.append("rating", rating || "");
      form.append("message", message.trim()); form.append("allowContact", String(allowContact));
      form.append("page", window.location.href);
      Object.entries(deviceDetails()).forEach(([key, value]) => form.append(key, value));
      if (screenshot) form.append("screenshot", screenshot);
      await api.post("/feedback", form);
      localStorage.setItem(badgeKey, "true"); setShowBadge(false); setSuccess(true); setShowToast(true);
      setCategory(""); setRating(0); setMessage(""); setAllowContact(false); setScreenshot(null);
      window.setTimeout(() => setOpen(false), 2800);
      window.setTimeout(() => setShowToast(false), 6000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not submit feedback. Please try again.");
    } finally { setSubmitting(false); }
  }

  return (
    <>
      {showToast && <div role="status" aria-live="polite" className="fixed right-4 top-24 z-[60] max-w-sm animate-[feedback-toast_.3s_ease-out] rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl dark:border-emerald-900 dark:bg-slate-900"><div className="flex gap-3"><span className="text-2xl" aria-hidden="true">🎉</span><div><p className="font-black text-slate-900 dark:text-white">Thank you!</p><p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-300">Your feedback was submitted successfully. We really appreciate your help improving College Marketplace.</p></div><button type="button" onClick={() => setShowToast(false)} aria-label="Dismiss notification" className="self-start text-slate-400">×</button></div></div>}
      <div className="group fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
        <span role="tooltip" className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">Help us improve</span>
        <button type="button" onClick={launch} aria-label="Open feedback form" className="relative flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-3 font-black text-slate-800 shadow-xl shadow-slate-900/15 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white">
          <span aria-hidden="true" className="text-lg">💬</span><span className="hidden sm:inline">Feedback</span>
          {showBadge && <span className="absolute -right-1 -top-2 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white ring-2 ring-white">New</span>}
        </button>
      </div>

      {open && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && !submitting && setOpen(false)}>
        <section ref={dialogRef} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="feedback-title" className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl outline-none dark:bg-slate-900 dark:text-slate-100">
          {success ? <div className="grid min-h-[430px] place-items-center p-8 text-center">
            <div><div className="mx-auto mb-5 grid h-20 w-20 animate-bounce place-items-center rounded-full bg-teal-100 text-4xl">🎉</div><h2 className="text-3xl font-black">Thank you!</h2><p className="mx-auto mt-3 max-w-md leading-7 text-slate-500 dark:text-slate-300">Your feedback has been submitted successfully. We really appreciate your help in improving College Marketplace.</p></div>
          </div> : <form onSubmit={submit}>
            <header className="border-b border-slate-100 bg-gradient-to-br from-teal-50 to-white px-5 py-5 dark:border-slate-800 dark:from-teal-950/50 dark:to-slate-900 sm:px-7">
              <button type="button" onClick={() => setOpen(false)} aria-label="Close feedback form" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-xl text-slate-500 hover:bg-white/80 dark:hover:bg-slate-800">×</button>
              <h2 id="feedback-title" className="pr-10 text-2xl font-black">💬 Help Us Improve</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Your feedback helps us build a better marketplace.</p>
            </header>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
              {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
              <label className="block">Category <span className="text-rose-500">*</span><select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1.5 dark:border-slate-700 dark:bg-slate-800"><option value="">Choose a category</option>{categories.map(([label, icon]) => <option key={label} value={label}>{label} {icon}</option>)}</select></label>
              <fieldset><legend className="text-sm font-semibold text-slate-600 dark:text-slate-300">Overall Rating <span className="font-normal text-slate-400">(optional)</span></legend><div className="mt-2 flex items-center gap-1"><div className="flex" role="radiogroup" aria-label="Overall rating">{[1,2,3,4,5].map((star) => <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} stars, ${ratingLabels[star-1]}`} onClick={() => setRating(star)} className={`px-1 text-3xl transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-400 ${star <= rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}>★</button>)}</div>{rating > 0 && <span className="ml-2 text-sm font-bold text-slate-500">{ratingLabels[rating-1]}</span>}</div></fieldset>
              <label className="block">Feedback <span className="text-rose-500">*</span><textarea rows="6" minLength="10" maxLength="1000" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder={'Tell us:\n• What happened?\n• What were you trying to do?\n• How can we improve?'} className="mt-1.5 resize-y dark:border-slate-700 dark:bg-slate-800"/><span className={`mt-1 block text-right text-xs ${message.length > 900 ? "font-bold text-amber-600" : "text-slate-400"}`}>{message.length} / 1000</span></label>
              <div><p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Screenshot <span className="font-normal text-slate-400">(optional, max 10 MB)</span></p><input ref={fileRef} type="file" accept="image/*" onChange={chooseScreenshot} className="sr-only"/><button type="button" onClick={() => fileRef.current?.click()} className="mt-1.5 w-full rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-bold text-slate-500 transition hover:border-teal-400 hover:bg-teal-50 dark:border-slate-700 dark:hover:bg-teal-950/30">{preview ? "Replace screenshot" : "Choose an image"}</button>{preview && <div className="relative mt-3"><img src={preview} alt="Screenshot preview" className="max-h-48 w-full rounded-xl object-contain bg-slate-100"/><button type="button" onClick={() => { setScreenshot(null); if (fileRef.current) fileRef.current.value = ""; }} className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-bold text-white">Remove</button></div>}</div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><input type="checkbox" checked={allowContact} onChange={(e) => setAllowContact(e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal-700"/><span className="text-sm font-medium text-slate-600 dark:text-slate-300">It’s okay to contact me about this feedback.{allowContact && <span className="mt-1 block text-xs text-teal-700 dark:text-teal-300">We’ll use {user?.email}</span>}</span></label>
            </div>
            <footer className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-7"><button type="button" disabled={submitting} onClick={() => setOpen(false)} className="btn-secondary dark:bg-slate-800 dark:text-slate-200">Cancel</button><button type="submit" disabled={submitting} className="btn-primary min-w-36 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"/>Submitting…</span> : "Send feedback"}</button></footer>
          </form>}
        </section>
      </div>}
    </>
  );
}
