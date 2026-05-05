import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

const kycStatusConfig = {
  verified:    { icon: "ri-shield-check-fill",   color: "text-[#10B981]", bg: "bg-green-50",  label: "Vérifié" },
  pending:     { icon: "ri-time-line",            color: "text-amber-600", bg: "bg-amber-50",  label: "En cours" },
  rejected:    { icon: "ri-close-circle-line",    color: "text-red-500",   bg: "bg-red-50",    label: "Rejeté" },
  not_started: { icon: "ri-upload-cloud-2-line",  color: "text-gray-400",  bg: "bg-gray-50",   label: "Téléverser" },
};

export default function KycSection() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("kyc_identity_verified, kyc_address_verified, kyc_business_verified, business_name, full_name")
        .eq("id", user.id)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user?.id]);

  if (loading) return <div className="p-5 text-center text-gray-400 text-sm">Chargement...</div>;

  const docs = [
    { id: "identity", label: "Pièce d'identité", status: profile?.kyc_identity_verified ? "verified" : "not_started" },
    { id: "address", label: "Justificatif d'adresse", status: profile?.kyc_address_verified ? "verified" : "not_started" },
    { id: "business", label: "Document entreprise", status: profile?.kyc_business_verified ? "verified" : "not_started" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#10B981]/10">
          <i className="ri-shield-check-line text-[#10B981] text-sm"></i>
        </div>
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Documents KYC
        </h3>
      </div>

      <div className="space-y-3">
        {docs.map((doc) => {
          const cfg = kycStatusConfig[doc.status];
          return (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <i className={`${cfg.icon} text-base ${cfg.color}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{doc.label}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
                {(doc.status === "not_started" || doc.status === "rejected") && (
                  <button className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap">
                    <i className="ri-upload-2-line mr-0.5"></i>Téléverser
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
