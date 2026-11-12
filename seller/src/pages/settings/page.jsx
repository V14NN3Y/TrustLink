import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { useLocale } from "@/lib/i18n";
import { useCurrency } from "@/hooks/useCurrency";

const STORE_DOMAIN = import.meta.env.VITE_DOMAIN || 'trustlink.ng';
const FALLBACK_CATEGORIES = ["Mode & Vêtements", "Electronique", "Alimentation", "Beauté & Cosmétiques", "Sports"];
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
      {sub && <p className="text-sm text-gray-400">{sub}</p>}
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



export default function SettingsPage() {
  const navigate = useNavigate();
  const [notifList, setNotifList] = useState([]);
  const { section } = useParams();
  const { user, profile, logout, setProfile } = useAuth();
  const [active, setActive] = useState(section || "profile");
  const { locale, setLocale, t } = useLocale();
  const { currency, setCurrency } = useCurrency();

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [uploadMsg, setUploadMsg] = useState(null);

  useEffect(() => {
    supabase.from('categories').select('name').order('sort_order').then(({ data }) => {
      if (data?.length) setCategories(data.map(c => c.name));
    }).catch(() => {});
  }, []);

  const uploadToStorage = async (bucket, file, folderPath) => {
    if (!file || !profile?.id) return null;
    const fileExt = file.name.split(".").pop();
    const path = `${folderPath}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      if (uploadError.message?.includes('bucket')) throw new Error('Storage bucket does not exist. Contact administration.');
      throw uploadError;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const [savingProfile, setSavingProfile] = useState(false);
  const saveProfile = async () => {
    if (!profile?.id) return;
    setSavingProfile(true);
    // 1. Update the email in auth.users if it changed
    if (profileForm.email !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: profileForm.email });
      if (authError) {
        setSavingProfile(false);
        toast({ title: t('pages.settingsToast.error'), description: "Email update error: " + authError.message, variant: "destructive" });
        return;
      }
    }
    // 2. Update the profile
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
      toast({ title: t('pages.settingsToast.error'), description: "Save error: " + error.message, variant: "destructive" });
    } else {
      toast({ title: t('pages.settingsToast.success'), description: t('pages.settingsToast.profileUpdated') });
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirm || pwMismatch) return;
    if (passwords.next.length < 6) {
      setPwMessage({ type: 'error', text: t('pages.settingsToast.passwordTooShort') });
      return;
    }
    setPwSaving(true);
    setPwMessage(null);
    // Step 1: check the current password by signing in again
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email,
      password: passwords.current,
    });
    if (signInError) {
      setPwSaving(false);
      setPwMessage({ type: 'error', text: t('pages.settingsToast.passwordIncorrect') });
      return;
    }
    // Step 2: ask Supabase to update the password
    const { error } = await supabase.auth.updateUser({
      password: passwords.next,
    });
    setPwSaving(false);
    if (error) {
      setPwMessage({ type: 'error', text: error.message });
    } else {
      setPwMessage({ type: 'success', text: t('pages.settingsToast.passwordSuccess') });
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
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(25);
        setNotifList(data || []);
      } catch (err) {
        console.error("Error fetching notification list:", err);
      }
    };
    fetchNotifList();
  }, [profile]);

  const [boutiqueForm, setBoutiqueForm] = useState({
    name: profile?.business_name || t('common.myStore'),
    slug: profile?.business_slug || "",
    description: profile?.business_description || "",
    category: profile?.business_category || "Mode & Vêtements",
    website: profile?.business_website || "",
    instagram: profile?.business_instagram || "",
  });
  useEffect(() => {
    if (profile) {
      setBoutiqueForm(f => ({
        ...f,
        name: profile.business_name || t('common.myStore'),
        slug: profile.business_slug || "",
        description: profile.business_description || "",
        category: profile.business_category || "Mode & Vêtements",
        website: profile.business_website || "",
        instagram: profile.business_instagram || "",
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
      toast({ title: t('pages.settingsToast.error'), description: "Store save error: " + error.message, variant: "destructive" });
    } else {
      toast({ title: t('pages.settingsToast.success'), description: t('pages.settingsToast.storeUpdated') });
    }
  };

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);
  const [twoFA, setTwoFA] = useState(true);
  const notifRows = [
    { section: t('pages.settingsNotifs.sectionOrders'), items: [
      { key: 'new_order', label: t('pages.settingsNotifs.notifNewOrder'), sub: t('pages.settingsNotifs.notifNewOrderSub'), email: true, sms: true, push: true },
      { key: 'dispatch_ready', label: t('pages.settingsNotifs.notifReadyShip'), sub: t('pages.settingsNotifs.notifReadyShipSub'), email: true, sms: false, push: true },
      { key: 'order_update', label: t('pages.settingsNotifs.notifDelivered'), sub: t('pages.settingsNotifs.notifDeliveredSub'), email: true, sms: false, push: false },
    ] },
    { section: t('pages.settingsNotifs.sectionSecurity'), items: [
      { key: 'security_alert', label: t('pages.settingsNotifs.notifNewDevice'), sub: t('pages.settingsNotifs.notifNewDeviceSub'), email: true, sms: true, push: true },
      { key: 'dispute_update', label: t('pages.settingsNotifs.notifKycUpdate'), sub: t('pages.settingsNotifs.notifKycUpdateSub'), email: true, sms: false, push: true },
    ] },
  ];
  const [notifs, setNotifs] = useState(() => {
    const map = {};
    notifRows.forEach(s => s.items.forEach(item => {
      map[item.key] = { email: item.email, sms: item.sms, push: item.push };
    }));
    return map;
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSavedMsg, setNotifSavedMsg] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.from('notification_preferences').select('type, channel, enabled').eq('user_id', profile.id).then(({ data }) => {
      if (!data) return;
      const newNotifs = { ...notifs };
      data.forEach(p => {
        if (newNotifs[p.type]) {
          newNotifs[p.type] = { ...newNotifs[p.type], [p.channel]: p.enabled };
        }
      });
      setNotifs(newNotifs);
    }).catch(err => console.error("Error fetching notification preferences:", err));
  }, [profile?.id]);

  const saveNotifPrefs = async () => {
    if (!profile?.id) return;
    setNotifSaving(true);
    try {
      for (const [type, channels] of Object.entries(notifs)) {
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
      setUploadMsg({ type: 'error', text: err.message || t('pages.settingsToast.saveError') });
    } finally {
      setNotifSaving(false);
    }
  };
  const [langTimezone, setLangTimezone] = useState("Africa/Lagos (GMT+1)");

  const pwMismatch = passwords.next && passwords.confirm && passwords.next !== passwords.confirm;

  const [savedLangMsg, setSavedLangMsg] = useState(false);

  const handleSaveLang = async () => {
    setLocale(locale);
    setCurrency(currency);
    try {
      await supabase.from('profiles').update({ locale }).eq('id', user?.id);
    } catch (err) {
      console.error("Error saving language preference:", err);
    }
    setSavedLangMsg(true);
    setTimeout(() => setSavedLangMsg(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {sideNav.map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left border-b border-gray-50 last:border-0 ${active === item.id ? "text-[#125C8D] font-semibold bg-[#125C8D]/5" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <i className={`${item.icon} text-base w-4 text-center ${active === item.id ? "text-[#125C8D]" : "text-gray-400"}`}></i>
                  {t(`pages.${item.id}.title`)}
                </button>
              );
            })}
            <div className="border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all text-left"
              >
                <i className="ri-logout-box-r-line text-base w-4 text-center"></i>
                {t('common.signOut')}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* My profile */}
          {active === "profile" && (
            <div>
              {uploadMsg && (
                <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${uploadMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <i className={`${uploadMsg.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}`} />{uploadMsg.text}
                </div>
              )}
              <SectionTitle
                title={t('pages.profile.title')}
                sub={t('pages.profile.sub')}
              />
              {/* Photo */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('pages.profile.photoTitle')}</h3>
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
                    <p className="text-sm font-semibold text-gray-800">{profile?.full_name || t('common.seller')}</p>
                    <p className="text-xs text-gray-400">{t('common.verifiedSeller')} · {profile?.default_city || t('common.hub')}</p>
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
                          if (!url) throw new Error('URL not generated');
                          const { error } = await supabase
                            .from("profiles")
                            .update({ avatar_url: url })
                            .eq("id", profile.id);
                          if (error) throw error;
                          setProfile({ ...profile, avatar_url: url });
                          setUploadMsg({ type: 'success', text: t('pages.settingsToast.photoUpdated') });
                        } catch (err) {
                          setUploadMsg({ type: 'error', text: err.message });
                        }
                      }}
                    />
                    <label htmlFor="avatar-upload" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <i className="ri-upload-2-line text-xs"></i>{t('pages.profile.changePhoto')}
                    </label>
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">{t('pages.profile.personalInfo')}</h3>
                  <button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#125C8D] px-3 py-1.5 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    <i className="ri-save-line text-xs"></i>
                    {savingProfile ? t('pages.profile.saving') : t('pages.profile.save')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label={t('pages.profile.fieldPrenom')} value={profileForm.prenom} onChange={v => setProfileForm(f => ({ ...f, prenom: v }))} />
                  <FieldRow label={t('pages.profile.fieldNom')} value={profileForm.nom} onChange={v => setProfileForm(f => ({ ...f, nom: v }))} />
                  <div className="col-span-2">
                    <FieldRow label={t('pages.profile.fieldEmail')} value={profileForm.email} onChange={v => setProfileForm(f => ({ ...f, email: v }))} type="email" />
                  </div>
                  <div className="col-span-2">
                    <FieldRow label={t('pages.profile.fieldPhone')} value={profileForm.phone} onChange={v => setProfileForm(f => ({ ...f, phone: v }))} />
                  </div>
                  <div className="col-span-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{t('pages.profile.fieldLocation')}</label>
                      <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-100">
                        {profileForm.location || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">{t('pages.profile.fieldBio')}</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#125C8D] bg-gray-50 transition-colors resize-none"
                    />
                  </div>
                  {/* Default address */}
                  <div className="col-span-2 mt-2">
                    <p className="text-xs font-semibold text-gray-800 mb-2">{t('pages.profile.defaultAddress')}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldRow label={t('pages.profile.fieldAddress1')} value={profileForm.address1} onChange={v => setProfileForm(f => ({ ...f, address1: v }))} />
                      <FieldRow label={t('pages.profile.fieldAddress2')} value={profileForm.address2} onChange={v => setProfileForm(f => ({ ...f, address2: v }))} />
                      <FieldRow label={t('pages.profile.fieldCity')} value={profileForm.city} onChange={v => setProfileForm(f => ({ ...f, city: v }))} />
                      <FieldRow label={t('pages.profile.fieldCountry')} value={profileForm.country} onChange={v => setProfileForm(f => ({ ...f, country: v }))} />
                      <FieldRow label={t('pages.profile.fieldPostal')} value={profileForm.postal} onChange={v => setProfileForm(f => ({ ...f, postal: v }))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shop & brand */}
          {active === "boutique" && (
            <div>
              <SectionTitle
                title={t('pages.boutique.title')}
                sub={t('pages.boutique.sub')}
              />
              {/* Logo */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('pages.boutique.logoTitle')}</h3>
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
                    <p className="text-sm font-semibold text-gray-800">{profile?.business_name || t('common.myStore')}</p>
                    <p className="text-xs text-gray-400">{t('pages.boutique.logoFormat')}</p>
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
                          if (!url) throw new Error('URL not generated');
                          const { error } = await supabase
                            .from("profiles")
                            .update({ business_logo_url: url })
                            .eq("id", profile.id);
                          if (error) throw error;
                          setProfile({ ...profile, business_logo_url: url });
                          setUploadMsg({ type: 'success', text: t('pages.settingsToast.logoUpdated') });
                        } catch (err) {
                          setUploadMsg({ type: 'error', text: err.message });
                        }
                      }}
                    />
                    <label htmlFor="logo-upload" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <i className="ri-upload-2-line text-xs"></i>{t('pages.boutique.uploadLogo')}
                    </label>
                  </div>
                </div>
              </div>
              {/* Shop info */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('pages.boutique.infoTitle')}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FieldRow label={t('pages.boutique.fieldName')} value={boutiqueForm.name} onChange={v => setBoutiqueForm(f => ({ ...f, name: v }))} />
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{t('pages.boutique.fieldUrl')}</label>
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
                    <label className="text-xs text-gray-500 block mb-1">{t('pages.boutique.fieldDescription')}</label>
                    <textarea
                      value={boutiqueForm.description}
                      onChange={e => setBoutiqueForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] bg-gray-50 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{t('pages.boutique.fieldCategory')}</label>
                      <select
                        value={boutiqueForm.category}
                        onChange={e => setBoutiqueForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] bg-gray-50 cursor-pointer"
                      >
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <FieldRow label={t('pages.boutique.fieldWebsite')} value={boutiqueForm.website} onChange={v => setBoutiqueForm(f => ({ ...f, website: v }))} />
                  </div>
                  <FieldRow label={t('pages.boutique.fieldInstagram')} value={boutiqueForm.instagram} onChange={v => setBoutiqueForm(f => ({ ...f, instagram: v }))} />
                  <div className="flex justify-end pt-2">
                    <button onClick={saveBoutique} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: "#125C8D" }}>
                      {t('pages.boutique.saveChanges')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {active === "notifications" && (
            <div>
              <SectionTitle
                title={t('pages.settingsNotifs.title')}
                sub={t('pages.settingsNotifs.sub')}
              />
              <div className="mb-4">
                <button
                  onClick={() => navigate("/notifications")}
                  className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer"
                >
                  {t('pages.settingsNotifs.seeHistory')}
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
                      <div key={item.key} className="grid grid-cols-[1fr_60px_60px_60px] items-center px-6 py-4 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                        {["email", "sms", "push"].map(type => (
                          <div key={type} className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={notifs[item.key]?.[type] ?? false}
                              onChange={e => setNotifs(n => ({ ...n, [item.key]: { ...n[item.key], [type]: e.target.checked } }))}
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
                  <i className="ri-checkbox-circle-line"></i> {t('pages.settingsNotifs.saved')}
                </div>
              )}
              <button
                onClick={saveNotifPrefs}
                disabled={notifSaving}
                className="mt-3 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#125C8D" }}
              >
                {notifSaving ? t('pages.settingsNotifs.saving') : t('pages.settingsNotifs.savePrefs')}
              </button>
            </div>
          )}

          {/* Security */}
          {active === "securite" && (
            <div>
              <SectionTitle
                title={t('pages.securite.title')}
                sub={t('pages.securite.sub')}
              />
              {/* Password */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('pages.securite.changePassword')}</h3>
                <div className="space-y-3 max-w-lg">
                  {[
                    { label: t('pages.securite.fieldCurrent'), key: "current" },
                    { label: t('pages.securite.fieldNew'), key: "next" },
                    { label: t('pages.securite.fieldConfirm'), key: "confirm" },
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
                  {pwMismatch && <p className="text-xs text-red-500"><i className="ri-close-circle-line mr-1"></i>{t('pages.securite.mismatch')}</p>}
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
                      {pwSaving ? t('pages.securite.updating') : t('pages.securite.updateBtn')}
                    </button>
                  </div>
                </div>
              </div>
              {/* 2FA */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('pages.securite.twoFATitle')}</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#125C8D]/10 flex items-center justify-center">
                      <i className="ri-smartphone-line text-[#125C8D]"></i>
                    </div>
                    <div>
                    <p className="text-sm font-semibold text-gray-800">{t('pages.securite.smsAuth')}</p>
                    <p className="text-xs text-gray-400">{profile?.phone || t('pages.securite.noPhone')}</p>
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
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('pages.securite.sessionsTitle')}</h3>
                <p className="text-xs text-gray-400">{t('pages.securite.sessionsDesc')}</p>
              </div>
            </div>
          )}

          {/* Language & currency */}
          {active === "langue" && (
            <div>
              <SectionTitle
                title={t('pages.langue.title')}
                sub={t('pages.langue.sub')}
              />
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
                <div className="space-y-6 max-w-lg">
                  {/* Language toggle */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      {t('pages.langue.interfaceLang')}
                    </p>
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit gap-1">
                      {[{ val: 'fr', label: 'Français' }, { val: 'en', label: 'English' }].map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => setLocale(val)}
                          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${locale === val ? 'bg-[#125C8D] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {t('pages.langue.effectImmediate')}
                    </p>
                  </div>

                  {/* Currency toggle */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      {t('pages.langue.displayCurrency')}
                    </p>
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit gap-1">
                      {[{ val: 'NGN', label: 'Naira (₦ NGN)' }, { val: 'XOF', label: 'Franc CFA (FCFA)' }].map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => setCurrency(val)}
                          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${currency === val ? 'bg-[#10B981] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {t('pages.langue.pricesUpdate')}
                    </p>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                      {t('pages.langue.timezone')}
                    </label>
                    <select value={langTimezone} onChange={e => setLangTimezone(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] bg-gray-50 cursor-pointer">
                      {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {savedLangMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-emerald-700 text-xs flex items-center gap-2">
                      <i className="ri-checkbox-circle-line" />
                      {t('pages.langue.savedProfile')}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button onClick={handleSaveLang} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: "#125C8D" }}>
                      {t('pages.langue.saveProfile')}
                    </button>
                  </div>
                </div>
              </div>
              {/* Exchange rates */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('pages.langue.exchangeTitle')}</h3>
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
