import { createContext, useContext, useState, useEffect } from 'react';

const locales = {
  fr: {
    nav: { dashboard: 'Dashboard', orders: 'Commandes', catalog: 'Catalogue', reviews: 'Avis', stats: 'Statistiques', payouts: 'Paiements', support: 'Support & KYC', messages: 'Messages', questions: 'Questions', settings: 'Paramètres', notifications: 'Notifications', help: 'Centre d\'aide', activity: 'Mon activité' },
    home: { hello: 'Bonjour', overview: 'Voici un aperçu de votre activité', newProduct: 'Nouveau Produit', ordersReceived: 'Commandes reçues', processing: 'En cours de traitement', approvedProducts: 'Produits approuvés', estimatedRevenue: 'Revenus estimés', videos: 'Vidéos de déballage', disputes: 'Litiges', seeInOrders: 'Voir dans les commandes →', lowStock: 'Stock faible', productPerf: 'Performance produits' },
    order: { title: 'Commandes', all: 'Toutes', search: 'Rechercher...', export: 'Exporter CSV', total: 'Total', noOrders: 'Aucune commande trouvée' },
    product: { title: 'Catalogue', newProduct: 'Nouveau produit', search: 'Rechercher un produit...', all: 'Tous', approved: 'Approuvés', pendingReview: 'En révision', rejected: 'Rejetés', drafts: 'Brouillons', importCSV: 'Importer CSV', exportCSV: 'Exporter CSV' },
    general: { loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', search: 'Rechercher', all: 'Tous' },
  },
  en: {
    nav: { dashboard: 'Dashboard', orders: 'Orders', catalog: 'Catalog', reviews: 'Reviews', stats: 'Stats', payouts: 'Payouts', support: 'Support & KYC', messages: 'Messages', questions: 'Questions', settings: 'Settings', notifications: 'Notifications', help: 'Help Center', activity: 'My Activity' },
    home: { hello: 'Hello', overview: 'Here is an overview of your activity', newProduct: 'New Product', ordersReceived: 'Orders Received', processing: 'In Processing', approvedProducts: 'Approved Products', estimatedRevenue: 'Estimated Revenue', videos: 'Unboxing Videos', disputes: 'Disputes', seeInOrders: 'See in Orders →', lowStock: 'Low Stock', productPerf: 'Product Performance' },
    order: { title: 'Orders', all: 'All', search: 'Search...', export: 'Export CSV', total: 'Total', noOrders: 'No orders found' },
    product: { title: 'Catalog', newProduct: 'New Product', search: 'Search products...', all: 'All', approved: 'Approved', pendingReview: 'Pending Review', rejected: 'Rejected', drafts: 'Drafts', importCSV: 'Import CSV', exportCSV: 'Export CSV' },
    general: { loading: 'Loading...', save: 'Save', cancel: 'Cancel', search: 'Search', all: 'All' },
  },
};

const LocaleContext = createContext();

export function LocaleProvider({ children }) {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('trustlink_seller_locale') : null;
  const [locale, setLocaleState] = useState(saved && locales[saved] ? saved : 'fr');

  const setLocale = (l) => {
    if (locales[l]) {
      setLocaleState(l);
      localStorage.setItem('trustlink_seller_locale', l);
      document.documentElement.lang = l;
    }
  };

  const t = (path) => {
    const keys = path.split('.');
    let val = locales[locale];
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) val = val[k];
      else return path;
    }
    return val || path;
  };

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) return { locale: 'fr', setLocale: () => {}, t: (s) => s };
  return ctx;
}

// Module-level helpers for non-reactive components
let _currentLocale = typeof window !== 'undefined' ? localStorage.getItem('trustlink_seller_locale') || 'fr' : 'fr';

export function t(path) {
  const locale = typeof window !== 'undefined' ? localStorage.getItem('trustlink_seller_locale') || 'fr' : 'fr';
  const keys = path.split('.');
  let val = locales[locale];
  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) val = val[k];
    else return path;
  }
  return val || path;
}

export function getLocale() {
  return _currentLocale;
}
