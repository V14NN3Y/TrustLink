import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <Header />
      <main className="pt-16 min-h-screen bg-[#F9FAFB]" style={{ marginLeft: "256px" }}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
