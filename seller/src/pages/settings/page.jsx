import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";

const sideNav = [
  { id: "profile",       label: "Mon Profil",        icon: "ri-user-line" },
  { id: "boutique",      label: "Boutique & Marque",  icon: "ri-store-2-line" },
  { id: "banque",        label: "Comptes Bancaires",  icon: "ri-bank-line" },
  { id: "notifications", label: "Notifications",      icon: "ri-notification-3-line" },
  { id: "securite",      label: "Sécurité",           icon: "ri-shield-line" },
  { id: "langue",        label: "Langue & Devise",    icon: "ri-global-line" },
];

const notifRows = [
  { section: "Commandes", items: [
    { label: "Nouvelle commande reçue",    sub: "Alerte immédiate à chaque nouvelle commande",         email: true,  sms: true,  push: true  },
    { label: "Commande prête à expédier", sub: "Rappel quand une commande est en attente d'expédition", email: true,  sms: false, push: true  },
    { label: "Commande livrée",           sub: "Confirmation de livraison au client",                   email: true,  sms: false, push: false },
  ]},
  { section: "Wallet & Paiements", items: [
    { label: "Paiement reçu",        sub: "À chaque crédit sur votre compte",                    email: true,  sms: true,  push: true  },
    { label: "Retrait effectué",     sub: "Confirmation de virement bancaire",                   email: true,  sms: true,  push: false },
    { label: "Fonds escrow libérés", sub: "Quand les fonds sont transférés vers votre solde",    email: true,  sms: false, push: true  },
  ]},
  { section: "Compte & Sécurité", items: [
    { label: "Connexion depuis un nouvel appareil", sub: "Alerte de sécurité en cas de connexion suspecte", email: true,  sms: true,  push: true  },
    { label: "Mise à jour du statut KYC",           sub: "Notifications sur l'avancement de votre vérification", email: true,  sms: false, push: true  },
  ]},
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { section } = useParams();
  const [active, setActive] = useState(section || "profile");

  const [profileForm, setProfileForm] = useState({
    prenom: "Adebayo", nom: "Okonkwo",
    email: "adebayo@trustlink.ng", phone: "+234 801 234 5678",
    location: "Lagos, Nigeria",
    bio: "Vendeur certifié de vêtements et accessoires de mode africains. Spécialisé dans les tissus Ankara et la mode contemporaine nigériane.",
  });

  const [boutiqueForm, setBoutiqueForm] = useState({
    name: "Adebayo Fashions", slug: "adebayo-fashions",
    description: "Boutique spécialisée dans la mode africaine contemporaine — vêtements Ankara, accessoires et prêt-à-porter.",
    category: "Mode & Vêtements", website: "https://adebayo-fashions.com", instagram: "@adebayofashions",
  });

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [twoFA, setTwoFA] = useState(true);
  const [notifs, setNotifs] = useState(() => {
    const map = {};
    notifRows.forEach(s => s.items.forEach(item => {
      map[item.label] = { email: item.email, sms: item.sms, push: item.push };
    }));
    return map;
  });
  const [langForm, setLangForm] = useState({ lang: "English", devise: "Naira nigérian (₦)", timezone: "Africa/Lagos (GMT+1)" });

  const pwMismatch = passwords.next && passwords.confirm && passwords.next !== passwords.confirm;

  const SectionTitle = ({ title, sub }) => (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h2>
      <p className="text-sm text-gray-400">Gérez vos informations personnelles et préférences</p>
    </div>
  );

  const FieldRow = ({ label, value, onChange, type = "text" }) => (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#125C8D] bg-gray-50 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {sideNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left border-b border-gray-50 last:border-0 ${
                  active === item.id ? "text-[#125C8D] font-semibold bg-[#125C8D]/5" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className={`${item.icon} text-base w-4 text-center ${active === item.id ? "text-[#125C8D]" : "text-gray-400"}`}></i>
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all text-left">
                <i className="ri-logout-box-r-line text-base w-4 text-center"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Mon Profil */}
          {active === "profile" && (
            <div>
              <SectionTitle title="Mon Profil" />
              {/* Photo */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Photo de profil</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                      alt="Profile"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center">
                      <i className="ri-check-line text-white text-[8px] font-bold"></i>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Adebayo Okonkwo</p>
                    <p className="text-xs text-gray-400">Vendeur vérifié · Lagos Hub</p>
                    <button className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <i className="ri-upload-2-line text-xs"></i>Changer la photo
                    </button>
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Informations personnelles</h3>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-[#125C8D] border border-[#125C8D]/30 px-3 py-1.5 rounded-lg hover:bg-[#125C8D]/5 transition-colors">
                    <i className="ri-pencil-line text-xs"></i>Modifier
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="Prénom" value={profileForm.prenom} onChange={v => setProfileForm(f=>({...f, prenom:v}))} />
                  <FieldRow label="Nom" value={profileForm.nom} onChange={v => setProfileForm(f=>({...f, nom:v}))} />
                  <div className="col-span-2">
                    <FieldRow label="Email" value={profileForm.email} onChange={v => setProfileForm(f=>({...f, email:v}))} type="email" />
                  </div>
                  <div className="col-span-2">
                    <FieldRow label="Téléphone" value={profileForm.phone} onChange={v => setProfileForm(f=>({...f, phone:v}))} />
                  </div>
                  <div className="col-span-2">
                    <FieldRow label="Localisation" value={profileForm.location} onChange={v => setProfileForm(f=>({...f, location:v}))} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={e => setProfileForm(f=>({...f, bio:e.target.value}))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#125C8D] bg-gray-50 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutique & Marque */}
          {active === "boutique" && (
            <div>
              <SectionTitle title="Boutique & Marque" />
              {/* Logo */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Logo de la boutique</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: "#125C8D" }}>AF</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Adebayo Fashions</p>
                    <p className="text-xs text-gray-400">Format recommandé : 400×400px, PNG ou JPG</p>
                    <button className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <i className="ri-upload-2-line text-xs"></i>Télécharger un logo
                    </button>
                  </div>
                </div>
              </div>
              {/* Info boutique */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Informations de la boutique</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="Nom de la boutique" value={boutiqueForm.name} onChange={v => setBoutiqueForm(f=>({...f, name:v}))} />
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">URL de la boutique</label>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-100 border-r border-gray-200 whitespace-nowrap">trustlink.ng/</span>
                        <input
                          type="text"
                          value={boutiqueForm.slug}
                          onChange={e => setBoutiqueForm(f=>({...f, slug:e.target.value}))}
                          className="flex-1 px-3 py-2.5 text-sm outline-none bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Description</label>
                    <textarea
                      value={boutiqueForm.description}
                      onChange={e => setBoutiqueForm(f=>({...f, description:e.target.value}))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] bg-gray-50 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Catégorie principale</label>
                      <select
                        value={boutiqueForm.category}
                        onChange={e => setBoutiqueForm(f=>({...f, category:e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] bg-gray-50 cursor-pointer"
                      >
                        {["Mode & Vêtements","Electronique","Alimentation","Beauté & Cosmétiques","Sports"].map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <FieldRow label="Site web" value={boutiqueForm.website} onChange={v => setBoutiqueForm(f=>({...f, website:v}))} />
                  </div>
                  <FieldRow label="Instagram" value={boutiqueForm.instagram} onChange={v => setBoutiqueForm(f=>({...f, instagram:v}))} />
                  <div className="flex justify-end pt-2">
                    <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: "#125C8D" }}>
                      Sauvegarder les modifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comptes Bancaires */}
          {active === "banque" && (
            <div>
              <SectionTitle title="Comptes Bancaires" />
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Comptes enregistrés</h3>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-[#125C8D] border border-[#125C8D]/30 px-3 py-1.5 rounded-lg hover:bg-[#125C8D]/5 transition-colors">
                    <i className="ri-add-line"></i>Ajouter un compte
                  </button>
                </div>
                {[
                  { bank: "GTBank", num: "****1532", name: "ADEBAYO FASHIONS LTD", primary: true },
                  { bank: "Access Bank", num: "****2291", name: "ADEBAYO FASHIONS LTD", primary: false },
                ].map((b) => (
                  <div key={b.bank} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl mb-3 last:mb-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 flex-shrink-0">
                      <i className="ri-bank-line text-gray-500"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{b.bank}</p>
                        {b.primary && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">Défaut</span>}
                      </div>
                      <p className="text-xs text-gray-400">{b.num}</p>
                      <p className="text-xs text-gray-400 uppercase">{b.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {active === "notifications" && (
            <div>
              <SectionTitle title="Notifications" />
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {notifRows.map((section, si) => (
                  <div key={section.section}>
                    <div className="grid grid-cols-[1fr_60px_60px_60px] items-center px-6 py-3 border-b border-gray-100 bg-gray-50">
                      <span className="text-sm font-bold text-gray-800">{section.section}</span>
                      {["EMAIL","SMS","PUSH"].map(h => (
                        <span key={h} className="text-[10px] font-bold text-gray-400 uppercase text-center">{h}</span>
                      ))}
                    </div>
                    {section.items.map((item) => (
                      <div key={item.label} className="grid grid-cols-[1fr_60px_60px_60px] items-center px-6 py-4 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                        {["email","sms","push"].map(type => (
                          <div key={type} className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={notifs[item.label]?.[type] ?? false}
                              onChange={e => setNotifs(n => ({...n, [item.label]: {...n[item.label], [type]: e.target.checked}}))}
                              className="w-4 h-4 accent-[#125C8D] cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sécurité */}
          {active === "securite" && (
            <div>
              <SectionTitle title="Sécurité" />
              {/* Password */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Modifier le mot de passe</h3>
                <div className="space-y-3 max-w-lg">
                  {[
                    { label: "Mot de passe actuel", key: "current" },
                    { label: "Nouveau mot de passe", key: "next" },
                    { label: "Confirmer le nouveau mot de passe", key: "confirm" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={passwords[key]}
                          onChange={e => setPasswords(p => ({...p, [key]: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#125C8D] bg-gray-50 transition-colors"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <i className="ri-eye-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwMismatch && <p className="text-xs text-red-500"><i className="ri-close-circle-line mr-1"></i>Les mots de passe ne correspondent pas</p>}
                  <div className="flex justify-end pt-2">
                    <button
                      disabled={!passwords.current || !passwords.next || !passwords.confirm || pwMismatch}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#125C8D" }}
                    >
                      Modifier le mot de passe
                    </button>
                  </div>
                </div>
              </div>
              {/* 2FA */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Double authentification (2FA)</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#125C8D]/10 flex items-center justify-center">
                      <i className="ri-smartphone-line text-[#125C8D]"></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Authentification par SMS</p>
                      <p className="text-xs text-gray-400">+234 801 *** 5678</p>
                    </div>
                  </div>
                  <label className="relative cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={twoFA} onChange={e => setTwoFA(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#10B981] transition-colors"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>
              {/* Sessions */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Sessions actives</h3>
                <div className="space-y-3">
                  {[
                    { browser: "Chrome", os: "Windows 11", loc: "Lagos, Nigeria", sub: "Actif maintenant", current: true },
                    { browser: "Safari", os: "iPhone 14",  loc: "Lagos, Nigeria", sub: "Il y a 2 heures",  current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <i className={`${s.os.includes("iPhone") ? "ri-smartphone-line" : "ri-computer-line"} text-gray-500 text-base`}></i>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{s.browser} — {s.os}</p>
                          <p className="text-[10px] text-gray-400">{s.loc} · {s.sub}</p>
                        </div>
                      </div>
                      {s.current
                        ? <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">Session actuelle</span>
                        : <button className="text-xs font-semibold text-red-500 hover:underline cursor-pointer">Révoquer</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Langue & Devise */}
          {active === "langue" && (
            <div>
              <SectionTitle title="Langue & Devise" />
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Langue & Devise</h3>
                <div className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Langue d'interface</label>
                      <select value={langForm.lang} onChange={e=>setLangForm(f=>({...f,lang:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white cursor-pointer">
                        {["English","Français","Yoruba","Hausa","Igbo"].map(l=><option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Devise principale</label>
                      <select value={langForm.devise} onChange={e=>setLangForm(f=>({...f,devise:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white cursor-pointer">
                        {["Naira nigérian (₦)","Franc CFA (FCFA)","Dollar US ($)"].map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Fuseau horaire</label>
                    <select value={langForm.timezone} onChange={e=>setLangForm(f=>({...f,timezone:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white cursor-pointer">
                      {["Africa/Lagos (GMT+1)","Africa/Cotonou (GMT+1)","Europe/Paris (GMT+2)","UTC (GMT+0)"].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: "#125C8D" }}>
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
              {/* Exchange rates */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Taux de change actuel</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { pair: "NGN → FCFA", rate: "3.52", since: "Il y a 2 min" },
                    { pair: "NGN → USD", rate: "0.00063", since: "Il y a 2 min" },
                    { pair: "USD → FCFA", rate: "616.40", since: "Il y a 2 min" },
                  ].map((r) => (
                    <div key={r.pair} className="p-4 border border-gray-100 rounded-xl text-center">
                      <p className="text-xs text-gray-400 mb-1">{r.pair}</p>
                      <p className="text-xl font-bold text-gray-900">{r.rate}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{r.since}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
