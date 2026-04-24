import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { mockKycDocuments, mockTickets, mockFaq } from "@/mocks/support";

const kycSteps = [
  { key: "identity", label: "Identité", status: "verified", icon: "ri-user-3-line", detail: "Pièce d'identité vérifiée" },
  { key: "address", label: "Adresse", status: "verified", icon: "ri-map-pin-line", detail: "Preuve de domicile validée" },
  { key: "activity", label: "Activité", status: "pending", icon: "ri-store-2-line", detail: "En cours d'examen" },
  { key: "bank", label: "Bancaire", status: "not_started", icon: "ri-bank-line", detail: "Vérification non commencée" },
];

const statusConfig = {
  verified:    { label: "Vérifié",      color: "text-[#10B981]", bg: "bg-[#10B981]/5 border-[#10B981]/20", dot: "bg-[#10B981]" },
  pending:     { label: "En cours",     color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",       dot: "bg-amber-500" },
  rejected:    { label: "Rejeté",       color: "text-red-500",    bg: "bg-red-50 border-red-200",           dot: "bg-red-500" },
  not_started: { label: "Non commencé", color: "text-gray-400",   bg: "bg-gray-50 border-gray-200",         dot: "bg-gray-300" },
};

const kycCompletion = Math.round((kycSteps.filter(s => s.status === "verified").length / kycSteps.length) * 100);

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("kyc");

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Support & KYC</h2>
        <p className="text-sm text-gray-400">Gérez votre vérification d'identité et vos demandes d'assistance</p>
      </div>

      {/* KPI mini cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#10B981]/10 flex-shrink-0">
            <i className="ri-shield-check-line text-[#10B981] text-lg"></i>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{kycCompletion}%</p>
            <p className="text-[11px] text-gray-400">KYC complété</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FF6A00]/10 flex-shrink-0">
            <i className="ri-customer-service-2-line text-[#FF6A00] text-lg"></i>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{mockTickets.filter(t => t.status === "open").length}</p>
            <p className="text-[11px] text-gray-400">Tickets ouverts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#125C8D]/10 flex-shrink-0">
            <i className="ri-time-line text-[#125C8D] text-lg"></i>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">&lt; 24h</p>
            <p className="text-[11px] text-gray-400">Temps de réponse moyen</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {[
          { id: "kyc", label: "Vérification KYC", icon: "ri-shield-check-line" },
          { id: "tickets", label: "Mes tickets", icon: "ri-message-2-line" },
          { id: "faq", label: "Centre d'aide", icon: "ri-question-line" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "text-white"
                : "text-gray-500 bg-white border border-gray-100 hover:bg-gray-50"
            }`}
            style={activeTab === tab.id ? { backgroundColor: "#125C8D" } : {}}
          >
            <i className={`${tab.icon} text-sm`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* KYC Tab */}
      {activeTab === "kyc" && (
        <div className="space-y-5">
          {/* Progress */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Statut de vérification KYC</h3>
                <p className="text-xs text-gray-400">Complétez la vérification pour débloquer toutes les fonctionnalités</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#125C8D]">{kycCompletion}%</p>
                <p className="text-[10px] text-gray-400">{kycSteps.filter(s => s.status === "verified").length}/{kycSteps.length} étapes</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${kycCompletion}%`, backgroundColor: "#10B981" }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {kycSteps.map((step) => {
                const cfg = statusConfig[step.status];
                return (
                  <div key={step.key} className={`flex items-center gap-3 p-4 rounded-xl border ${cfg.bg}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      step.status === "verified" ? "bg-[#10B981]/15" :
                      step.status === "pending" ? "bg-amber-100" : "bg-gray-100"
                    }`}>
                      <i className={`${step.icon} text-sm ${cfg.color}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                        <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{step.detail}</p>
                    </div>
                    {step.status === "not_started" && (
                      <button className="text-[10px] font-semibold text-[#125C8D] border border-[#125C8D]/30 px-2 py-1 rounded-lg whitespace-nowrap hover:bg-[#125C8D]/5">
                        <i className="ri-upload-2-line mr-0.5"></i>Soumettre
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accepted docs */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Documents acceptés</h3>
            <div className="space-y-4">
              {[
                { title: "Pièce d'identité", desc: "Carte nationale d'identité NIN, Passeport international, Permis de conduire nigérian" },
                { title: "Justificatif de domicile", desc: "Facture d'électricité ou d'eau (moins de 3 mois), Relevé bancaire, Lettre d'hébergement officielle" },
                { title: "Activité commerciale", desc: "Certificat CAC d'enregistrement de l'entreprise, Licence commerciale Lagos State, Permis d'exercice" },
              ].map((doc) => (
                <div key={doc.title} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <i className="ri-file-text-line text-[#125C8D] text-base flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{doc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="space-y-3">
          {mockTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#125C8D]/30 transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ticket.status === "open" ? "bg-[#FF6A00]" : "bg-gray-300"}`}></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{ticket.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ticket.id} · {ticket.created_at}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  ticket.status === "open" ? "bg-[#FF6A00]/10 text-[#FF6A00]" : "bg-gray-100 text-gray-500"
                }`}>
                  {ticket.status === "open" ? "Ouvert" : "Résolu"}
                </span>
              </div>
              {ticket.messages?.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 ml-5 line-clamp-1">{ticket.messages[ticket.messages.length - 1].content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-2">
          {mockFaq.map((faq) => (
            <details key={faq.id} className="group border border-gray-100 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none hover:bg-[#F9FAFB] transition-all">
                <span className="text-sm font-semibold text-gray-800 pr-4">{faq.question}</span>
                <i className="ri-arrow-down-s-line text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180 text-lg"></i>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
