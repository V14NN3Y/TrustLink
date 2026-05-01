import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

const CITIES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon'];

export default function SettingsTab() {
  const { profile, loading, saving, saveSuccess, saveProfile } = useProfile();
  const { rate } = useExchangeRate();
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine1: '', city: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current: '', new: '', confirm: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  
  const [notifs, setNotifs] = useState({
    orders: true, escrow: true, promo: false, newsletter: false, sms: true,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        addressLine1: profile.default_address_line1 || '',
        city: profile.default_city || '',
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveProfile(form);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    setPasswordLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: passwordForm.current,
      });
      if (signInError) {
        setPasswordError('Mot de passe actuel incorrect.');
        setPasswordLoading(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });
      if (updateError) throw updateError;
      setPasswordSuccess(true);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl h-32 animate-pulse" style={{ border: '1px solid #E5E7EB' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-poppins font-bold mb-5" style={{ color: '#111827' }}>Paramètres du compte</h1>
      <div className="space-y-5">
        {/* Profil & Adresse */}
        <form onSubmit={handleSave} className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-user-3-line" style={{ color: '#125C8D' }}></i>
            <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Informations personnelles</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-poppins text-gray-500 mb-1 block">Nom complet</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]"
                placeholder="Adjoua Mensah"
              />
            </div>
            <div>
              <label className="text-xs font-poppins text-gray-500 mb-1 block">Téléphone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]"
                placeholder="+229 97 45 23 11"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-poppins text-gray-500 mb-1 block">Email</label>
            <input
              value={profile?.email || ''}
              disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-inter outline-none bg-gray-50 cursor-not-allowed"
              style={{ color: '#9CA3AF' }}
            />
            <p className="text-xs font-inter mt-1" style={{ color: '#9CA3AF' }}>L'email ne peut pas être modifié ici.</p>
          </div>
          <div className="flex items-center gap-2 mb-3 mt-4">
            <i className="ri-map-pin-line" style={{ color: '#125C8D' }}></i>
            <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Adresse de livraison principale</h3>
          </div>
          <div className="mb-3">
            <label className="text-xs font-poppins text-gray-500 mb-1 block">Quartier / Rue</label>
            <input
              value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]"
              placeholder="Quartier Cadjehoun, Rue 12.315"
            />
          </div>
          <div className="mb-4">
            <label className="text-xs font-poppins text-gray-500 mb-1 block">Ville</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]"
            >
              <option value="">Sélectionner une ville</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {saveSuccess && (
            <div className="mb-3 p-3 rounded-lg text-sm font-inter flex items-center gap-2" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              <i className="ri-checkbox-circle-line"></i> Profil mis à jour avec succès !
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg disabled:opacity-50"
            style={{ backgroundColor: '#125C8D' }}
          >
            <i className="ri-save-line"></i>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>

        {/* Taux de change */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-exchange-funds-line" style={{ color: '#125C8D' }}></i>
            <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Taux de change en vigueur</h3>
          </div>
          {rate ? (
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#EBF4FB' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#125C8D' }}>
                  <i className="ri-exchange-line text-white text-base"></i>
                </div>
                <div>
                  <p className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>
                    1 NGN = {rate.rate} FCFA
                  </p>
                  <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>
                    Mis à jour le {new Date(rate.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <span className="text-xs font-poppins font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
                En vigueur
              </span>
            </div>
          ) : (
            <div className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: '#F1F5F9' }} />
          )}
          <p className="text-xs font-inter mt-3" style={{ color: '#9CA3AF' }}>
            Le taux est géré par l&apos;équipe TrustLink et mis à jour régulièrement.
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-notification-3-line" style={{ color: '#125C8D' }}></i>
            <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Préférences de notifications</h3>
          </div>
          {[
            { key: 'orders', label: 'Mise à jour de commandes', desc: 'Statut, confirmation, livrée', icon: 'ri-shopping-bag-line' },
            { key: 'escrow', label: 'Alertes Escrow', desc: 'Paiements, confirmations, litige', icon: 'ri-shield-check-line' },
            { key: 'promo', label: 'Promotions & offres', desc: 'Réductions, ventes flash', icon: 'ri-percent-line' },
            { key: 'newsletter', label: 'Newsletter TrustLink', desc: 'Actualités et nouveautés', icon: 'ri-newspaper-line' },
            { key: 'sms', label: 'Notifications SMS', desc: 'Envoyées sur votre mobile', icon: 'ri-smartphone-line' },
          ].map(({ key, label, desc, icon }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-start gap-2.5">
                <i className={`${icon} text-sm mt-0.5 flex-shrink-0`} style={{ color: '#9CA3AF' }}></i>
                <div>
                  <p className="text-sm font-poppins font-medium" style={{ color: '#111827' }}>{label}</p>
                  <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{desc}</p>
                </div>
              </div>
              <button
                onClick={() => setNotifs({ ...notifs, [key]: !notifs[key] })}
                className="w-11 h-6 rounded-full transition-colors flex-shrink-0 relative cursor-pointer"
                style={{ backgroundColor: notifs[key] ? '#125C8D' : '#E5E7EB' }}
              >
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: notifs[key] ? '22px' : '2px' }}></span>
              </button>
            </div>
          ))}
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-lock-line" style={{ color: '#125C8D' }}></i>
            <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Sécurité du compte</h3>
          </div>
          {passwordSuccess && (
            <div className="mb-3 p-3 rounded-lg text-sm font-inter flex items-center gap-2" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              <i className="ri-checkbox-circle-line"></i> Mot de passe mis à jour avec succès !
            </div>
          )}
          {passwordError && (
            <div className="mb-3 p-3 rounded-lg text-sm font-inter" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              {passwordError}
            </div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div className="mb-3">
              <label className="text-xs font-poppins text-gray-500 mb-1 block">Mot de passe actuel</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="mb-3">
              <label className="text-xs font-poppins text-gray-500 mb-1 block">Nouveau mot de passe</label>
              <input
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-poppins text-gray-500 mb-1 block">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: '#125C8D' }}
            >
              {passwordLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <i className="ri-lock-password-line"></i>
              )}
              {passwordLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl p-5" style={{ border: '1px solid #FECDD3', backgroundColor: '#FFF1F2' }}>
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-error-warning-line text-red-500"></i>
            <h3 className="text-sm font-poppins font-semibold text-red-700">Zone de danger</h3>
          </div>
          <p className="text-xs font-inter text-red-500 mb-3">
            La suppression de votre compte est irréversible. Toutes vos données, commandes et historique seront définitivement effacés.
          </p>
          <button className="flex items-center gap-2 text-sm font-poppins font-medium px-4 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer">
            <i className="ri-delete-bin-line"></i> Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}
