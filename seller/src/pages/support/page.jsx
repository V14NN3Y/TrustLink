import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import DashboardLayout from "@/components/feature/DashboardLayout";

const statusConfig = {
  verified: { label: "Vérifié", color: "text-[#10B981]", bg: "bg-[#10B981]/5 border-[#10B981]/20", dot: "bg-[#10B981]" },
  pending: { label: "En cours", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  rejected: { label: "Rejeté", color: "text-red-500", bg: "bg-red-50 border-red-200", dot: "bg-red-500" },
  not_started: { label: "Non commencé", color: "text-gray-400", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-300" },
};

const KYC_CONFIG = [
  { key: "identity", label: "Identité", flag: "kyc_identity_verified", icon: "ri-user-3-line", detail: "Pièce d'identité" },
  { key: "address", label: "Adresse", flag: "kyc_address_verified", icon: "ri-map-pin-line", detail: "Justificatif de domicile" },
  { key: "activity", label: "Activité", flag: "kyc_business_verified", icon: "ri-store-2-line", detail: "Registre de commerce" },
  { key: "bank", label: "Bancaire", flag: null, icon: "ri-bank-line", detail: "RIB bancaire" },
];

const KYC_URL_MAP = {
  identity: { urlField: 'kyc_identity_url', verifiedField: 'kyc_identity_verified' },
  address: { urlField: 'kyc_address_url', verifiedField: 'kyc_address_verified' },
  activity: { urlField: 'kyc_business_url', verifiedField: 'kyc_business_verified' },
};

const uploadKycDocument = async (user, file, key) => {
  const fileExt = file.name.split('.').pop();
  const path = `kyc/${user.id}/${key}_${Date.now()}.${fileExt}`;
  const { error: uploadErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadErr) throw uploadErr;
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  const cfg = KYC_URL_MAP[key];
  await supabase.from('profiles').update({ [cfg.urlField]: publicUrl }).eq('id', user.id);
  return publicUrl;
};

export default function SupportPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("kyc");
  const [kycSteps, setKycSteps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);

  const loadKycStatus = () => {
    if (!user) return;
    supabase.from('profiles').select('kyc_identity_verified, kyc_address_verified, kyc_business_verified, kyc_identity_url, kyc_address_url, kyc_business_url').eq('id', user.id).single()
      .then(({ data }) => {
        setProfile(data);
        if (data) {
          setKycSteps(KYC_CONFIG.map(k => {
            const fields = KYC_URL_MAP[k.key];
            const isVerified = fields ? data[fields.verifiedField] : false;
            const hasDoc = fields ? !!data[fields.urlField] : false;
            return {
              ...k,
              status: !k.flag ? 'not_started' : isVerified ? 'verified' : hasDoc ? 'pending' : 'not_started',
            };
          }));
        }
      });
  };

  useEffect(() => { loadKycStatus(); }, [user]);

  const handleKycUpload = async (key) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      setUploadingKey(key);
      try {
        await uploadKycDocument(user, file, key);
        loadKycStatus();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'upload du document KYC");
      } finally {
        setUploadingKey(null);
      }
    };
    input.click();
  };

  const kycCompletion = kycSteps.length > 0
    ? Math.round((kycSteps.filter(s => s.status === "verified").length / kycSteps.length) * 100)
    : 0;

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
            <p className="text-xl font-bold text-gray-900">—</p>
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id
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
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${step.status === "verified" ? "bg-[#10B981]/15" :
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
                    {(step.status === "not_started" || step.status === "pending") && (
                      <button
                        onClick={() => handleKycUpload(step.key)}
                        disabled={uploadingKey === step.key}
                        className="text-[10px] font-semibold text-[#125C8D] border border-[#125C8D]/30 px-2 py-1 rounded-lg whitespace-nowrap hover:bg-[#125C8D]/5 disabled:opacity-50 cursor-pointer"
                      >
                        <i className="ri-upload-2-line mr-0.5"></i>
                        {uploadingKey === step.key ? 'Upload...' : step.status === 'pending' ? 'Remplacer' : 'Soumettre'}
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
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          <i className="ri-message-2-line text-3xl mb-2 block"></i>
          <p className="text-sm">Utilisez l'onglet "Messages" pour contacter le support</p>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center py-12">
          <i className="ri-question-answer-line text-4xl text-gray-200 mb-3 block" />
          <p className="text-sm text-gray-500">Section FAQ — bientôt disponible</p>
        </div>
      )}
    </DashboardLayout>
  );
}
