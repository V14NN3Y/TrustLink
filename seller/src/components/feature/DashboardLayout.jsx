import Sidebar from "./Sidebar";
import Header from "./Header";
import GlobalSearch from "./GlobalSearch";
import { SidebarProvider } from "@/lib/SidebarContext";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#F9FAFB]">
        <Sidebar />
        <Header />
        <GlobalSearch />
        <main className="pt-16 min-h-screen bg-[#F9FAFB] md:ml-64">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
