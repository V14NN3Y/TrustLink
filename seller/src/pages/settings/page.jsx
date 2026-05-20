import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

const STORE_DOMAIN = import.meta.env.VITE_DOMAIN || 'trustlink.ng';
const CATEGORIES = ["Mode & Vêtements", "Electronique", "Alimentation", "Beauté & Cosmétiques", "Sports"];
const LANGUAGES = ["English", "Français", "Yoruba", "Hausa", "Igbo"];
const CURRENCIES = ["Naira nigérian (₦)", "Franc CFA (FCFA)", "Dollar US ($)"];
const TIMEZONES = ["Africa/Lagos (GMT+1)", "Africa/Cotonou (GMT+1)", "Europe/Paris (GMT+2)", "UTC (GMT+0)"];

const sideNav = [
  { id: "profile", label: "Mon Profil", icon: "ri-user-line" },
  { id: "boutique", label: "Boutique & Marque", icon: "ri-store-2-line" },
  { id: "notifications", label: "Notifications", icon: "ri-notification-3-line" },
  { id: "securite", label: "Sécurité", icon: "ri-shield-line" },
  { id: "langue", label: "Langue & Devise", icon: "ri-global-line" },
];

function SectionTitle({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h2>
      <p className="text-sm text-gray-400">{sub || 'Gérez vos informations personnelles et préférences'}</p>
    </div>
  );
}

function FieldRow({ label, value, onChange, type = "text" }) {
  return (
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
}

const notifRows = [
  {
    section: "Commandes", items: [
      { label: "Nouvelle commande reçue", sub: "Alerte immédiate à chaque nouvelle commande", email: true, sms: true, push: true },
      { label: "Commande prête à expédier", sub: "Rappel quand une commande est en attente d'expédition", email: true, sms: false, push: true },
      { label: "Commande livrée", sub: "Confirmation de livraison au client", email: true, sms: false, push: false },
    ]
  },
  {
    section: "Compte & Sécurité", items: [
      { label: "Connexion depuis un nouvel appareil", sub: "Alerte de sécurité en cas de connexion suspecte", email: true, sms: true, push: true },
      { label: "Mise à jour du statut KYC", sub: "Notifications sur l'avancement de votre vérification", email: true, sms: false, push: true },
    ]
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notifList, setNotifList] = useState([]);
  const { section } = useParams();
  const { user, profile, logout, setProfile } = useAuth();
  const [active, setActive] = useState(section || "profile");

  const [uploadMsg, setUploadMsg] = useState(null);

  const uploadToStorage = async (bucket, file, folderPath) => {
    if (!file || !profile?.id) return null;
    const fileExt = file.name.split(".").pop();
    const path = `${folderPath}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      if (uploadError.message?.includes('bucket')) throw new Error('Le dossier de stockage n\'existe pas. Contactez l\'administration.');
      throw uploadError;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const [savingProfile, setSavingProfile] = useState(false);
  const saveProfile = async () => {
    if (!profile?.id) return;
    setSavingProfile(true);
    // 1. Mettre à jour l'email dans auth.users si changé
    if (profileForm.email !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: profileForm.email });
      if (authError) {
        setSavingProfile(false);
        toast({ title: "Erreur", description: "Erreur mise à jour email : " + authError.message, variant: "destructive" });
        return;
      }
    }
    // 2. Mettre à jour le profil
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: `${profileForm.prenom} ${profileForm.nom}`.trim(),
        email: profileForm.email,
        phone: profileForm.phone,
        default_address_line1: profileForm.address1,
        default_address_line2: profileForm.address2,
        default_city: profileForm.city,
        default_country: profileForm.country,
        default_postal_code: profileForm.postal,
        business_description: profileForm.bio,
      })
      .eq("id", profile.id);
    setSavingProfile(false);
    if (error) {
      toast({ title: "Erreur", description: "Erreur sauvegarde : " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Profil mis à jour !" });
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirm || pwMismatch) return;
    if (passwords.next.length < 6) {
      setPwMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    setPwSaving(true);
    setPwMessage(null);
    // Étape 1 : vérifier le mot de passe actuel en re-essayant une connexion
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email,
      password: passwords.current,
    });
    if (signInError) {
      setPwSaving(false);
      setPwMessage({ type: 'error', text: 'Mot de passe actuel incorrect.' });
      return;
    }
    // Étape 2 : appeler Supabase pour mettre à jour le mot de passe
    const { error } = await supabase.auth.updateUser({
      password: passwords.next,
    });
    setPwSaving(false);
    if (error) {
      setPwMessage({ type: 'error', text: error.message });
    } else {
      setPwMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setPasswords({ current: '', next: '', confirm: '' });
    }
  };

  const [profileForm, setProfileForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    postal: "",
  });
  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      prenom: profile.full_name?.split(" ")[0] || "",
      nom: profile.full_name?.split(" ").slice(1).join(" ") || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: `${profile.default_city || ""}, ${profile.default_country || ""}`,
      bio: profile.business_description || "",
      address1: profile.default_address_line1 || "",
      address2: profile.default_address_line2 || "",
      city: profile.default_city || "",
      country: profile.default_country || "",
      postal: profile.default_postal_code || "",
    });
  }, [profile]);

  useEffect(() => {
    const fetchNotifList = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(25);
      setNotifList(data || []);
    };
    fetchNotifList();
  }, [profile]);

  const [boutiqueForm, setBoutiqueForm] = useState({
    name: profile?.business_name || "Ma Boutique",
    slug: "",
    description: profile?.business_description || "",
    category: "Mode & Vêtements",
    website: "",
    instagram: "",
  });
  useEffect(() => {
    if (profile?.business_name) {
      setBoutiqueForm(f => ({
        ...f,
        name: profile.business_name || "Ma Boutique",
        description: profile.business_description || "",
      }));
    }
  }, [profile]);
  const saveBoutique = async () => {
    if (!profile?.id) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: boutiqueForm.name,
        business_description: boutiqueForm.description,
        business_slug: boutiqueForm.slug || null,
        business_category: boutiqueForm.category || null,
        business_website: boutiqueForm.website || null,
        business_instagram: boutiqueForm.instagram || null,
      })
      .eq("id", profile.id);
    if (error) {
      toast({ title: "Erreur", description: "Erreur sauvegarde boutique : " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Boutique mise à jour !" });
    }
  };

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);
  const [twoFA, setTwoFA] = useState(true);
  const [notifs, setNotifs] = useState(() => {
    const map = {};
    notifRows.forEach(s => s.items.forEach(item => {
      map[item.label] = { email: item.email, sms: item.sms, push: item.push };
    }));
    return map;
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSavedMsg, setNotifSavedMsg] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.from('notification_preferences').select('type, channel, enabled').eq('user_id', profile.id).then(({ data }) => {
      if (!data) return;
      const typeLabelMap = {
        'new_order': 'Nouvelle commande reçue',
        'dispute_update': 'Mise à jour du statut KYC',
        'order_update': 'Commande livrée',
      };
      const newNotifs = { ...notifs };
      data.forEach(p => {
        const label = typeLabelMap[p.type];
        if (label && newNotifs[label]) {
          newNotifs[label] = { ...newNotifs[label], [p.channel]: p.enabled };
        }
      });
      setNotifs(newNotifs);
    });
  }, [profile?.id]);

  const saveNotifPrefs = async () => {
    if (!profile?.id) return;
    setNotifSaving(true);
    const typeMap = {
      'Nouvelle commande reçue': 'new_order',
      'Commande prête à expédier': 'order_update',
      'Commande livrée': 'order_update',
      'Connexion depuis un nouvel appareil': 'new_message',
      'Mise à jour du statut KYC': 'dispute_update',
    };
    try {
      for (const [label, channels] of Object.entries(notifs)) {
        const type = typeMap[label];
        if (!type) continue;
        for (const channel of ['email', 'sms', 'push']) {
          await supabase.from('notification_preferences').upsert(
            { user_id: profile.id, type, channel, enabled: channels[channel] ?? false },
            { onConflict: 'user_id, type, channel' }
          );
        }
      }
      setNotifSavedMsg(true);
      setTimeout(() => setNotifSavedMsg(false), 3000);
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.message || "Erreur de sauvegarde" });
    } finally {
      setNotifSaving(false);
    }
  };
  const currentLocale = typeof window !== 'undefined' ? localStorage.getItem('trustlink_seller_locale') || 'fr' : 'fr';
  const currentCurrency = typeof window !== 'undefined' ? localStorage.getItem('trustlink_currency') || 'NGN' : 'NGN';
  const [langForm, setLangForm] = useState({
    lang: currentLocale === 'fr' ? 'Français' : 'English',
    devise: currentCurrency === 'NGN' ? "Naira nigérian (₦)" : "Franc CFA (FCFA)",
    timezone: "Africa/Lagos (GMT+1)",
  });

  const pwMismatch = passwords.next && passwords.confirm && passwords.next !== passwords.confirm;

  // Cursor jump fix: moved SectionTitle and FieldRow outside component

  const [savedLangMsg, setSavedLangMsg] = useState(false);

  const handleSaveLang = async () => {
    const localeVal = langForm.lang === 'Français' ? 'fr' : 'en';
    const currencyVal = langForm.devise.includes('Naira') ? 'NGN' : 'XOF';
    localStorage.setItem('trustlink_seller_locale', localeVal);
    localStorage.setItem('trustlink_currency', currencyVal);
    window.dispatchEvent(new CustomEvent('currency-change', { detail: currencyVal }));
    await supabase.from('profiles').update({ locale: localeVal }).eq('id', user?.id);
    setSavedLangMsg(true);
    setTimeout(() => setSavedLangMsg(false), 3000);
  };

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
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left border-b border-gray-50 last:border-0 ${active === item.id ? "text-[#125C8D] font-semibold bg-[#125C8D]/5" : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <i className={`${item.icon} text-base w-4 text-center ${active === item.id ? "text-[#125C8D]" : "text-gray-400"}`}></i>
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all text-left"
              >
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
              {uploadMsg && (
                <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${uploadMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <i className={`${uploadMsg.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}`} />{uploadMsg.text}
                </div>
              )}
              <SectionTitle title="Mon Profil" />
              {/* Photo */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Photo de profil</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={profile?.avatar_url || ""}
                      alt="Profile"
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                    <div className="w-16 h-16 rounded-xl items-center justify-center text-white font-bold text-lg hidden" style={{ backgroundColor: "#125C8D" }}>
                      {profile?.full_name?.slice(0, 2)?.toUpperCase() || "SE"}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center">
                      <i className="ri-check-line text-white text-[8px] font-bold"></i>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{profile?.full_name || "Vendeur"}</p>
                    <p className="text-xs text-gray-400">Vendeur vérifié · {profile?.default_city || "Hub"}</p>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          const url = await uploadToStorage("avatars", file, `profiles/${profile.id}`);
                          if (!url) throw new Error('URL non générée');
                          const { error } = await supabase
                            .from("profiles")
                            .update({ avatar_url: url })
                            .eq("id", profile.id);
                          if (error) throw error;
                          setProfile({ ...profile, avatar_url: url });
                          setUploadMsg({ type: 'success', text: 'Photo mise à jour !' });
                        } catch (err) {
                          setUploadMsg({ type: 'error', text: err.message });
                        }
                      }}
                    />
                    <label htmlFor="avatar-upload" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <i className="ri-upload-2-line text-xs"></i>Changer la photo
                    </label>
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Informations personnelles</h3>
                  <button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#125C8D] px-3 py-1.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    <i className="ri-save-line text-xs"></i>
                    {savingProfile ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="Prénom" value={profileForm.prenom} onChange={v => setProfileForm(f => ({ ...f, prenom: v }))} />
                  <FieldRow label="Nom" value={profileForm.nom} onChange={v => setProfileForm(f => ({ ...f, nom: v }))} />
                  <div className="col-span-2">
                    <FieldRow label="Email" value={profileForm.email} onChange={v => setProfileForm(f => ({ ...f, email: v }))} type="email" />
                  </div>
                  <div className="col-span-2">
                    <FieldRow label="Téléphone" value={profileForm.phone} onChange={v => setProfileForm(f => ({ ...f, phone: v }))} />
                  </div>
                  <div className="col-span-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Localisation</label>
                      <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-100">
                        {profileForm.location || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#125C8D] bg-gray-50 transition-colors resize-none"
                    />
                  </div>
                  {/* Adresse par défaut */}
                  <div className="col-span-2 mt-2">
                    <p className="text-xs font-semibold text-gray-800 mb-2">Adresse de livraison par défaut</p>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldRow label="Adresse ligne 1" value={profileForm.address1} onChange={v => setProfileForm(f => ({ ...f, address1: v }))} />
                      <FieldRow label="Adresse ligne 2" value={profileForm.address2} onChange={v => setProfileForm(f => ({ ...f, address2: v }))} />
                      <FieldRow label="Ville" value={profileForm.city} onChange={v => setProfileForm(f => ({ ...f, city: v }))} />
                      <FieldRow label="Pays" value={profileForm.country} onChange={v => setProfileForm(f => ({ ...f, country: v }))} />
                      <FieldRow label="Code postal" value={profileForm.postal} onChange={v => setProfileForm(f => ({ ...f, postal: v }))} />
                    </div>
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
                  {profile?.business_logo_url ? (
                    <img
                      src={profile.business_logo_url}
                      alt="Logo boutique"
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: "#125C8D" }}>
                      {profile?.business_name?.slice(0, 2)?.toUpperCase() || "SE"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{profile?.business_name || "Ma Boutique"}</p>
                    <p className="text-xs text-gray-400">Format recommandé : 400×400px, PNG ou JPG</p>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          const url = await uploadToStorage("avatars", file, `shops/${profile.id}`);
                          if (!url) throw new Error('URL non générée');
                          const { error } = await supabase
                            .from("profiles")
                            .update({ business_logo_url: url })
                            .eq("id", profile.id);
                          if (error) throw error;
                          setProfile({ ...profile, business_logo_url: url });
                          setUploadMsg({ type: 'success', text: 'Logo mis à jour !' });
                        } catch (err) {
                          setUploadMsg({ type: 'error', text: err.message });
                        }
                      }}
                    />
                    <label htmlFor="logo-upload" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <i className="ri-upload-2-line text-xs"></i>Télécharger un logo
                    </label>
                  </div>
                </div>
              </div>
              {/* Info boutique */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Informations de la boutique</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="Nom de la boutique" value={boutiqueForm.name} onChange={v => setBoutiqueForm(f => ({ ...f, name: v }))} />
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">URL de la boutique</label>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-100 border-r border-gray-200 whitespace-nowrap">{STORE_DOMAIN}/</span>
                        <input
                          type="text"
                          value={boutiqueForm.slug}
                          onChange={e => setBoutiqueForm(f => ({ ...f, slug: e.target.value }))}
                          className="flex-1 px-3 py-2.5 text-sm outline-none bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Description</label>
                    <textarea
                      value={boutiqueForm.description}
                      onChange={e => setBoutiqueForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] bg-gray-50 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Catégorie principale</label>
                      <select
                        value={boutiqueForm.category}
                        onChange={e => setBoutiqueForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] bg-gray-50 cursor-pointer"
                      >
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <FieldRow label="Site web" value={boutiqueForm.website} onChange={v => setBoutiqueForm(f => ({ ...f, website: v }))} />
                  </div>
                  <FieldRow label="Instagram" value={boutiqueForm.instagram} onChange={v => setBoutiqueForm(f => ({ ...f, instagram: v }))} />
                  <div className="flex justify-end pt-2">
                    <button onClick={saveBoutique} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: "#125C8D" }}>
                      Sauvegarder les modifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {active === "notifications" && (
            <div>
              <SectionTitle title="Notifications" />
              <div className="mb-4">
                <button
                  onClick={() => navigate("/notifications")}
                  className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer"
                >
                  Voir l'historique des notifications →
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {notifRows.map((section, si) => (
                  <div key={section.section}>
                    <div className="grid grid-cols-[1fr_60px_60px_60px] items-center px-6 py-3 border-b border-gray-100 bg-gray-50">
                      <span className="text-sm font-bold text-gray-800">{section.section}</span>
                      {["EMAIL", "SMS", "PUSH"].map(h => (
                        <span key={h} className="text-[10px] font-bold text-gray-400 uppercase text-center">{h}</span>
                      ))}
                    </div>
                    {section.items.map((item) => (
                      <div key={item.label} className="grid grid-cols-[1fr_60px_60px_60px] items-center px-6 py-4 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                        {["email", "sms", "push"].map(type => (
                          <div key={type} className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={notifs[item.label]?.[type] ?? false}
                              onChange={e => setNotifs(n => ({ ...n, [item.label]: { ...n[item.label], [type]: e.target.checked } }))}
                              className="w-4 h-4 accent-[#125C8D] cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {notifSavedMsg && (
                <div className="mt-3 p-3 rounded-lg text-sm font-inter flex items-center gap-2" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                  <i className="ri-checkbox-circle-line"></i> Préférences sauvegardées !
                </div>
              )}
              <button
                onClick={saveNotifPrefs}
                disabled={notifSaving}
                className="mt-3 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#125C8D" }}
              >
                {notifSaving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
              </button>
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
                          onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#125C8D] bg-gray-50 transition-colors"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <i className="ri-eye-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwMismatch && <p className="text-xs text-red-500"><i className="ri-close-circle-line mr-1"></i>Les mots de passe ne correspondent pas</p>}
                  {pwMessage && (
                    <p className={`text-xs flex items-center gap-1 ${pwMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                      <i className={`${pwMessage.type === 'error' ? 'ri-close-circle-line' : 'ri-checkbox-circle-line'}`}></i>
                      {pwMessage.text}
                    </p>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={!passwords.current || !passwords.next || !passwords.confirm || pwMismatch || pwSaving}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#125C8D" }}
                    >
                      {pwSaving ? 'Mise à jour...' : 'Modifier le mot de passe'}
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
                      <p className="text-xs text-gray-400">{profile?.phone || 'Aucun numéro renseigné'}</p>
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
                <p className="text-xs text-gray-400">La gestion des sessions est assurée par votre fournisseur d'authentification.</p>
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
                      <select value={langForm.lang} onChange={e => setLangForm(f => ({ ...f, lang: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white cursor-pointer">
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Devise principale</label>
                      <select value={langForm.devise} onChange={e => setLangForm(f => ({ ...f, devise: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white cursor-pointer">
                        {CURRENCIES.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Fuseau horaire</label>
                    <select value={langForm.timezone} onChange={e => setLangForm(f => ({ ...f, timezone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white cursor-pointer">
                      {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {savedLangMsg && (
                    <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-emerald-700 text-xs flex items-center gap-2 mb-3">
                      <i className="ri-checkbox-circle-line" />Préférences sauvegardées
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button onClick={handleSaveLang} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: "#125C8D" }}>
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
              {/* Exchange rates */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Taux de change actuel</h3>
                <ExchangeRateCard from="NGN" to="XOF" />
                <ExchangeRateCard from="NGN" to="USD" />
                <ExchangeRateCard from="USD" to="XOF" />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ExchangeRateCard({ from, to }) {
  const [rate, setRate] = useState(null);
  useEffect(() => {
    supabase.from('exchange_rates').select('rate, updated_at').eq('from_currency', from).eq('to_currency', to).maybeSingle()
      .then(({ data }) => { if (data) setRate(data); });
  }, [from, to]);
  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl mb-2 last:mb-0">
      <p className="text-xs font-medium text-gray-600">{from} → {to}</p>
      <p className="text-sm font-bold text-gray-900">{rate ? Number(rate.rate).toFixed(4) : '—'}</p>
    </div>
  );
}
