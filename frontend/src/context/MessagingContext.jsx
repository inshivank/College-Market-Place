import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const MessagingContext = createContext(null);

export function MessagingProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/messages/conversations");
      setConversations(data.conversations); setUnreadCount(data.unreadCount);
    } finally { if (!silent) setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) { setConversations([]); setUnreadCount(0); return undefined; }
    refresh().catch(() => {});
    const timer = window.setInterval(() => refresh({ silent: true }).catch(() => {}), 10000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, refresh]);

  const value = useMemo(() => ({ conversations, unreadCount, loading, refresh }), [conversations, unreadCount, loading, refresh]);
  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) throw new Error("useMessaging must be used inside MessagingProvider");
  return context;
}
