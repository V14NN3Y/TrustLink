"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: 'dashboard' },
  { name: 'Catalogue Produits', href: '/products', icon: 'shopping_bag' },
  { name: 'Commandes & Litiges', href: '/orders', icon: 'receipt_long' },
  { name: 'Messagerie', href: '/messages', icon: 'chat' },
  { name: 'Utilisateurs', href: '/users', icon: 'people' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar - Premium Dark Blue */}
      <aside className="w-72 bg-primary-dark text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 pb-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-inner">
               <Image src="/logo.png" alt="TrustLink Logo" width={32} height={32} className="object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">TrustLink</h1>
          </Link>
          <div className="bg-white/10 h-px w-full mt-6" />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-accent text-white shadow-lg shadow-accent/30' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                  {/* Symbol placeholder or Material Icon would go here - using simple logic for now */}
                   <span className="text-xl">
                      {item.icon === 'dashboard' && '▤'}
                      {item.icon === 'shopping_bag' && '🛍'}
                      {item.icon === 'receipt_long' && '📄'}
                      {item.icon === 'chat' && '💬'}
                      {item.icon === 'people' && '👥'}
                   </span>
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold shadow-lg">
                A
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">Admin TrustLink</p>
                <p className="text-xs text-white/50 truncate">superadmin@trustlink.bj</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-accent uppercase tracking-widest mb-0.5">Console Admin</h2>
            <p className="text-lg font-extrabold text-foreground tracking-tight">TrustLink Marketplace MVP</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="relative">
               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white animate-pulse" />
               <span className="text-xl grayscale hover:grayscale-0 cursor-pointer transition-all">🔔</span>
             </div>
             <div className="h-8 w-px bg-border" />
             <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-border">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-bold text-gray-500">Live Server</p>
             </div>
          </div>
        </header>

        <div className="flex-1 p-10 overflow-auto scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
