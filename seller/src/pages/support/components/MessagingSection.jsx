import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

export default function MessagingSection() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [adminId, setAdminId] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });
      if (!error && data) setMessages(data);
      setLoading(false);
    };
    fetchMessages();
    // Realtime subscription
    const channel = supabase
      .channel('seller-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);
  useEffect(() => {
    const fetchAdmin = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();
      if (!error && data?.id) {
        setAdminId(data.id);
      } else {
        console.warn("Aucun admin trouvé dans profiles");
      }
      setAdminLoading(false);
    };
    fetchAdmin();
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id) return;
    if (!adminId) {
      alert("Le service de messagerie est temporairement indisponible. Réessayez.");
      return;
    }
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: adminId,
      subject: "Support",
      content: newMessage.trim(),
    });
    if (!error) {
      setNewMessage("");
      // refresh
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    }
  };
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#125C8D] rounded-full animate-spin mx-auto mb-2"></div>
        Chargement des messages...
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ height: "600px" }}>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Support TrustLink</p>
            <p className="text-[10px] text-gray-400">Messages avec l'administration</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {adminLoading && (
              <p className="text-xs text-gray-400 text-center py-2">Connexion au support...</p>
            )}
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8">Aucun message. Écris au support ci-dessous.</p>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%]">
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed ${isMe
                        ? "bg-[#125C8D] text-white rounded-2xl rounded-br-sm"
                        : "bg-gray-100 text-gray-700 rounded-2xl rounded-bl-sm"
                        }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Écrire au support..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ backgroundColor: "#125C8D" }}
              >
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
