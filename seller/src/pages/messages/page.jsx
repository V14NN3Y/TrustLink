import DashboardLayout from "@/components/feature/DashboardLayout";
import MessagingSection from "@/pages/support/components/MessagingSection";

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Messages
        </h2>
        <p className="text-sm text-gray-400">Échangez directement avec l'administration TrustLink</p>
      </div>
      <MessagingSection />
    </DashboardLayout>
  );
}
