import { mockKycDocuments } from "@/mocks/support";

const kycStatusConfig = {
  verified:    { icon: "ri-shield-check-fill",   color: "text-[#10B981]", bg: "bg-green-50",  label: "Vérifié" },
  pending:     { icon: "ri-time-line",            color: "text-amber-600", bg: "bg-amber-50",  label: "En cours" },
  rejected:    { icon: "ri-close-circle-line",    color: "text-red-500",   bg: "bg-red-50",    label: "Rejeté" },
  not_started: { icon: "ri-upload-cloud-2-line",  color: "text-gray-400",  bg: "bg-gray-50",   label: "Téléverser" },
};

export default function KycSection() {
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
        {mockKycDocuments.map((doc) => {
          const cfg = kycStatusConfig[doc.status];
          return (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <i className={`${cfg.icon} text-base ${cfg.color}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{doc.label}</p>
                {doc.uploaded_at && (
                  <p className="text-[10px] text-gray-400">Uploadé le {doc.uploaded_at}</p>
                )}
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
