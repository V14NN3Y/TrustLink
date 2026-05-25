import DashboardLayout from "@/components/feature/DashboardLayout";
import MessagingSection from "@/pages/support/components/MessagingSection";
import { useLocale } from "@/lib/i18n";

export default function MessagesPage() {
  const { t } = useLocale();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {t("messages.title")}
        </h2>
        <p className="text-sm text-gray-400">{t("messages.subtitle")}</p>
      </div>
      <MessagingSection />
    </DashboardLayout>
  );
}
