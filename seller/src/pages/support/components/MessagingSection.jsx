import { useState, useRef, useEffect } from "react";
import { mockTickets } from "@/mocks/support";

export default function MessagingSection() {
  const [selectedTicket, setSelectedTicket] = useState(mockTickets[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockTickets[0]?.messages ?? []);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: `msg-${Date.now()}`,
      sender: "seller",
      sender_name: "Adebayo Fashions",
      content: newMessage,
      timestamp: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setMessages(ticket.messages ?? []);
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ height: "600px" }}>
      <div className="flex h-full">
        {/* Ticket list */}
        <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket)}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-[#F9FAFB] transition-all ${selectedTicket?.id === ticket.id ? "bg-[#125C8D]/5 border-l-2 border-l-[#125C8D]" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{ticket.subject}</p>
                  {ticket.unread > 0 && (
                    <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#125C8D" }}>
                      {ticket.unread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    ticket.status === "in_progress" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-[#10B981]"
                  }`}>
                    {ticket.status === "in_progress" ? "En cours" : "Résolu"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{selectedTicket?.subject}</p>
            <p className="text-[10px] text-gray-400">Support TrustLink</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isSeller = msg.sender === "seller";
              return (
                <div key={msg.id} className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%]">
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed ${
                        isSeller
                          ? "bg-[#125C8D] text-white rounded-2xl rounded-br-sm"
                          : "bg-gray-100 text-gray-700 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-1 ${isSeller ? "text-right" : "text-left"}`}>
                      {msg.sender_name} · {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Tapez votre message... (Entrée pour envoyer)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
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
