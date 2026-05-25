import { createContext, useContext, useState, useEffect } from 'react';

const locales = {
  fr: {
    nav: {
      dashboard: 'Dashboard', orders: 'Commandes', catalog: 'Catalogue',
      reviews: 'Avis', stats: 'Statistiques', support: 'Support & KYC',
      messages: 'Messages', questions: 'Questions', help: 'Centre d\'aide',
      activity: 'Activité', notifications: 'Notifications',
    },
    home: {
      hello: 'Bonjour', overview: 'Voici un aperçu de votre activité',
      newProduct: 'Nouveau Produit', ordersReceived: 'Commandes reçues',
      processing: 'En cours de traitement', approvedProducts: 'Produits approuvés',
      estimatedRevenue: 'Revenus estimés (NGN)',
      unboxingVideos: 'Vidéos de déballage', videosSub: 'Vidéos soumises par les acheteurs',
      disputes: 'Litiges', disputesSub: 'Litiges ouverts sur vos commandes',
      openDispute: 'ouvert', openDisputePlural: 'ouverts', none: 'Aucun',
      lowStock: 'Stock faible', lowStockSub: 'Tous vos produits ont un stock suffisant',
      seeInOrders: 'Voir dans les commandes →', manageCatalog: 'Gérer le catalogue →',
      productPerf: 'Performance des produits',
      total: 'total', active: 'actifs', delivered: 'livrées', toProcess: 'à traiter',
      product: 'Produit', views: 'Vues', sales: 'Ventes',
      conversion: 'Conversion', stock: 'Stock',
    },
    orders: {
      title: 'Commandes', subtitle: 'Suivi et gestion des commandes',
      all: 'Toutes', processing: 'En cours de traitement', inTransit: 'En cours de livraison',
      delivered: 'Livrées', disputed: 'Litiges', cancelled: 'Annulées',
      search: 'Rechercher...', exportCSV: 'Exporter CSV',
      total: 'commandes · Total', noOrders: 'Aucune commande trouvée',
      colId: 'ID / Date', colBuyer: 'Acheteur', colItems: 'Articles',
      colAmount: 'Montant', colStatus: 'Statut', colActions: 'Actions',
      filteredTotal: 'Total filtré', results: 'résultats',
    },
    catalog: {
      title: 'Catalogue', newProduct: 'Nouveau produit', search: 'Rechercher un produit...',
      all: 'Tous', approved: 'Approuvés', pendingReview: 'En révision',
      rejected: 'Rejetés', drafts: 'Brouillons',
      importCSV: 'Importer CSV', exportCSV: 'Exporter CSV', noProducts: 'Aucun produit trouvé',
    },
    stats: {
      title: 'Statistiques de ventes', subtitle: 'Historique et performances de vos ventes',
      exportCSV: 'Export CSV', totalOrders: 'Commandes totales', totalSold: 'Produits vendus',
      totalRevenue: 'Revenus totaux', avgOrder: 'Panier moyen',
      revenueChart: 'Évolution des revenus', last12Months: '12 derniers mois',
      growth: 'Croissance', monthlyAvg: 'Moy. mensuelle',
      conversionRate: 'Taux de conversion', conversionSub: 'Commandes confirmées sans litige',
      disputes: 'Litiges', orderStatus: 'Statut des commandes',
      statusDist: 'Répartition des statuts', productPerf: 'Performance des produits',
      recentOrders: 'Dernières commandes', topProducts: 'Top produits',
      viewAll: 'Voir toutes', viewCatalog: 'Voir catalogue',
      noData: 'Aucune donnée disponible', noOrders: 'Aucune commande', noProducts: 'Aucun produit',
      lowStock: 'Stock faible', products: 'produits',
      colProduct: 'Produit', colPrice: 'Prix', colViews: 'Vues', colSales: 'Ventes',
      colConversion: 'Conversion', colStock: 'Stock', colStatus: 'Statut',
    },
    reviews: {
      title: 'Avis clients', subtitle: 'Retours et évaluations sur vos produits',
      total: 'Total avis', avgRating: 'Note moyenne', fiveStars: '5 étoiles',
      noReviews: 'Aucun avis pour le moment', on: 'sur',
    },
    notifications: {
      title: 'Notifications', on: 'sur',
      unread: 'non lue', unreadPlural: 'non lues', total: 'total',
      allTab: 'Toutes', unreadTab: 'Non lues',
      markAllRead: 'Tout marquer comme lu', markRead: 'Marquer comme lu',
      noNotifications: 'Aucune notification pour le moment',
      noUnread: 'Aucune notification non lue',
      recent: 'Notifications récentes', viewAll: 'Voir tout',
      markAllAsRead: 'Tout marquer comme lus',
    },
    messages: {
      title: 'Messages', subtitle: 'Échangez directement avec l\'administration TrustLink',
    },
    activity: {
      title: 'Mon activité', subtitle: 'Historique de vos actions sur la plateforme',
      noActivity: 'Aucune activité enregistrée',
      actions: {
        order_status_changed: 'Statut de commande modifié',
        product_created: 'Produit créé',
        product_updated: 'Produit mis à jour',
        product_deleted: 'Produit supprimé',
        variant_added: 'Variante ajoutée',
        variant_deleted: 'Variante supprimée',
        kyc_uploaded: 'Document KYC envoyé',
        profile_updated: 'Profil mis à jour',
        login: 'Connexion',
        password_changed: 'Mot de passe modifié',
        image_uploaded: 'Image téléversée',
        order_dispatched: 'Commande expédiée',
      },
    },
    help: {
      title: 'Centre d\'aide',
      subtitle: 'Guide et documentation pour bien démarrer sur TrustLink Seller Hub',
      gettingStarted: 'Premiers pas', gettingStartedDesc: 'Configurez votre boutique et créez vos produits',
      configure: 'Configurer →', faqTitle: 'Questions fréquentes',
      faqDesc: 'Réponses aux questions les plus courantes', consultBelow: 'Consultez ci-dessous →',
      contact: 'Nous contacter', contactDesc: 'Envoyez un message à l\'administration',
      messaging: 'Messagerie →', faqSection: 'Questions fréquentes',
      faqs: [
        { q: 'Comment créer mon premier produit ?', a: 'Rendez-vous dans Catalogue > Nouveau produit. Remplissez les informations, ajoutez une image, et soumettez à validation. Un administrateur approuvera votre produit sous 24-48h.' },
        { q: 'Comment fonctionne le paiement Escrow ?', a: 'L\'acheteur paie sur TrustLink. Les fonds sont bloqués jusqu\'à confirmation de réception. Après confirmation, le paiement est libéré et programmé pour virement.' },
        { q: 'Comment suivre mes commandes ?', a: 'Dans Commandes, vous voyez le statut de chaque article. Vous pouvez mettre à jour le statut (traitement, transit, livré) au fur et à mesure.' },
        { q: 'Comment gérer un litige ?', a: 'En cas de litige, l\'administration examine la vidéo de déballage et tranche. Vous serez notifié de la décision.' },
        { q: 'Comment modifier ma boutique ?', a: 'Dans Paramètres > Boutique & Marque, vous pouvez changer le nom, la description, le logo et les réseaux sociaux.' },
      ],
    },
    common: {
      loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler',
      search: 'Rechercher', all: 'Tous', back: 'Retour', next: 'Suivant',
      add: 'Ajouter', delete: 'Supprimer', edit: 'Modifier', publish: 'Publier',
      confirm: 'Confirmer', close: 'Fermer', download: 'Télécharger',
      total: 'Total', status: 'Statut', noData: 'Aucune donnée',
      unit: 'unité', units: 'unités',
    },
    header: { online: 'En ligne' },
    pages: {
      newProduct: { title: 'Nouveau Produit', sub: 'Ajoutez un produit à votre catalogue' },
      catalog: { title: 'Catalogue', sub: 'Gérez vos produits et votre inventaire' },
      orders: { title: 'Commandes', sub: 'Suivi et gestion des commandes' },
      stats: { title: 'Statistiques de ventes', sub: 'Historique et performances de vos ventes' },
      support: { title: 'Support & KYC', sub: 'Assistance et vérification d\'identité' },
      messages: { title: 'Messagerie', sub: 'Échangez avec le support TrustLink' },
      reviews: { title: 'Avis clients', sub: 'Consultez les avis sur vos produits' },
      notifications: { title: 'Notifications', sub: 'Historique de vos notifications' },
      profile: { title: 'Mon Profil', sub: 'Gérez vos informations personnelles' },
      boutique: { title: 'Boutique & Marque', sub: 'Gérez l\'identité de votre boutique' },
      settingsNotifs: { title: 'Notifications', sub: 'Préférences de notification' },
      securite: { title: 'Sécurité', sub: 'Mot de passe et accès' },
      langue: { title: 'Langue & Devise', sub: 'Langue et monnaie d\'affichage' },
      settings: { title: 'Paramètres', sub: 'Gérez vos préférences' },
      dashboard: { title: 'Dashboard', sub: 'Vue d\'ensemble de votre activité' },
      activity: { title: 'Mon activité', sub: 'Historique de vos actions' },
      help: { title: 'Centre d\'aide', sub: 'Documentation et FAQ' },
      questions: { title: 'Questions', sub: 'Questions posées sur vos produits' },
    },
  },
  en: {
    nav: {
      dashboard: 'Dashboard', orders: 'Orders', catalog: 'Catalog',
      reviews: 'Reviews', stats: 'Stats', support: 'Support & KYC',
      messages: 'Messages', questions: 'Questions', help: 'Help Center',
      activity: 'Activity', notifications: 'Notifications',
    },
    home: {
      hello: 'Hello', overview: 'Here is an overview of your activity',
      newProduct: 'New Product', ordersReceived: 'Orders Received',
      processing: 'In Processing', approvedProducts: 'Approved Products',
      estimatedRevenue: 'Estimated Revenue',
      unboxingVideos: 'Unboxing Videos', videosSub: 'Videos submitted by buyers',
      disputes: 'Disputes', disputesSub: 'Open disputes on your orders',
      openDispute: 'open', openDisputePlural: 'open', none: 'None',
      lowStock: 'Low Stock', lowStockSub: 'All your products have sufficient stock',
      seeInOrders: 'See in Orders →', manageCatalog: 'Manage Catalog →',
      productPerf: 'Product Performance',
      total: 'total', active: 'active', delivered: 'delivered', toProcess: 'to process',
      product: 'Product', views: 'Views', sales: 'Sales',
      conversion: 'Conversion', stock: 'Stock',
    },
    orders: {
      title: 'Orders', subtitle: 'Order tracking and management',
      all: 'All', processing: 'Processing', inTransit: 'In Transit',
      delivered: 'Delivered', disputed: 'Disputes', cancelled: 'Cancelled',
      search: 'Search...', exportCSV: 'Export CSV',
      total: 'orders · Total', noOrders: 'No orders found',
      colId: 'ID / Date', colBuyer: 'Buyer', colItems: 'Items',
      colAmount: 'Amount', colStatus: 'Status', colActions: 'Actions',
      filteredTotal: 'Filtered total', results: 'results',
    },
    catalog: {
      title: 'Catalog', newProduct: 'New Product', search: 'Search products...',
      all: 'All', approved: 'Approved', pendingReview: 'Pending Review',
      rejected: 'Rejected', drafts: 'Drafts',
      importCSV: 'Import CSV', exportCSV: 'Export CSV', noProducts: 'No products found',
    },
    stats: {
      title: 'Sales Statistics', subtitle: 'History and performance of your sales',
      exportCSV: 'Export CSV', totalOrders: 'Total Orders', totalSold: 'Products Sold',
      totalRevenue: 'Total Revenue', avgOrder: 'Avg. Order Value',
      revenueChart: 'Revenue Over Time', last12Months: 'Last 12 months',
      growth: 'Growth', monthlyAvg: 'Monthly Avg.',
      conversionRate: 'Conversion Rate', conversionSub: 'Confirmed orders without dispute',
      disputes: 'Disputes', orderStatus: 'Order Status',
      statusDist: 'Status Distribution', productPerf: 'Product Performance',
      recentOrders: 'Recent Orders', topProducts: 'Top Products',
      viewAll: 'View All', viewCatalog: 'View Catalog',
      noData: 'No data available', noOrders: 'No orders', noProducts: 'No products',
      lowStock: 'Low Stock', products: 'products',
      colProduct: 'Product', colPrice: 'Price', colViews: 'Views', colSales: 'Sales',
      colConversion: 'Conversion', colStock: 'Stock', colStatus: 'Status',
    },
    reviews: {
      title: 'Customer Reviews', subtitle: 'Feedback and ratings on your products',
      total: 'Total Reviews', avgRating: 'Average Rating', fiveStars: '5 Stars',
      noReviews: 'No reviews yet', on: 'on',
    },
    notifications: {
      title: 'Notifications', on: 'of',
      unread: 'unread', unreadPlural: 'unread', total: 'total',
      allTab: 'All', unreadTab: 'Unread',
      markAllRead: 'Mark all as read', markRead: 'Mark as read',
      noNotifications: 'No notifications yet',
      noUnread: 'No unread notifications',
      recent: 'Recent Notifications', viewAll: 'View all',
      markAllAsRead: 'Mark all as read',
    },
    messages: {
      title: 'Messages', subtitle: 'Chat directly with TrustLink administration',
    },
    activity: {
      title: 'My Activity', subtitle: 'History of your actions on the platform',
      noActivity: 'No activity recorded yet',
      actions: {
        order_status_changed: 'Order status changed',
        product_created: 'Product created',
        product_updated: 'Product updated',
        product_deleted: 'Product deleted',
        variant_added: 'Variant added',
        variant_deleted: 'Variant deleted',
        kyc_uploaded: 'KYC document submitted',
        profile_updated: 'Profile updated',
        login: 'Login',
        password_changed: 'Password changed',
        image_uploaded: 'Image uploaded',
        order_dispatched: 'Order dispatched',
      },
    },
    help: {
      title: 'Help Center',
      subtitle: 'Guide and documentation to get started on TrustLink Seller Hub',
      gettingStarted: 'Getting Started', gettingStartedDesc: 'Set up your store and create your products',
      configure: 'Configure →', faqTitle: 'FAQs',
      faqDesc: 'Answers to the most common questions', consultBelow: 'See below →',
      contact: 'Contact Us', contactDesc: 'Send a message to the administration',
      messaging: 'Messaging →', faqSection: 'Frequently Asked Questions',
      faqs: [
        { q: 'How do I create my first product?', a: 'Go to Catalog > New Product. Fill in the information, add an image, and submit for validation. An admin will approve your product within 24-48 hours.' },
        { q: 'How does Escrow payment work?', a: 'The buyer pays on TrustLink. Funds are held until delivery is confirmed. After confirmation, payment is released and scheduled for transfer.' },
        { q: 'How do I track my orders?', a: 'In Orders, you can see the status of each item. You can update the status (processing, transit, delivered) as things progress.' },
        { q: 'How do I handle a dispute?', a: 'In case of a dispute, the administration reviews the unboxing video and makes a decision. You will be notified of the outcome.' },
        { q: 'How do I edit my store?', a: 'In Settings > Store & Brand, you can change the name, description, logo, and social media links.' },
      ],
    },
    common: {
      loading: 'Loading...', save: 'Save', cancel: 'Cancel',
      search: 'Search', all: 'All', back: 'Back', next: 'Next',
      add: 'Add', delete: 'Delete', edit: 'Edit', publish: 'Publish',
      confirm: 'Confirm', close: 'Close', download: 'Download',
      total: 'Total', status: 'Status', noData: 'No data',
      unit: 'unit', units: 'units',
    },
    header: { online: 'Online' },
    pages: {
      newProduct: { title: 'New Product', sub: 'Add a product to your catalog' },
      catalog: { title: 'Catalog', sub: 'Manage your products and inventory' },
      orders: { title: 'Orders', sub: 'Order tracking and management' },
      stats: { title: 'Sales Statistics', sub: 'History and performance of your sales' },
      support: { title: 'Support & KYC', sub: 'Assistance and identity verification' },
      messages: { title: 'Messaging', sub: 'Chat with TrustLink support' },
      reviews: { title: 'Customer Reviews', sub: 'See reviews on your products' },
      notifications: { title: 'Notifications', sub: 'Your notifications history' },
      profile: { title: 'My Profile', sub: 'Manage your personal information' },
      boutique: { title: 'Store & Brand', sub: 'Manage your store identity' },
      settingsNotifs: { title: 'Notifications', sub: 'Notification preferences' },
      securite: { title: 'Security', sub: 'Password and access' },
      langue: { title: 'Language & Currency', sub: 'Display language and currency' },
      settings: { title: 'Settings', sub: 'Manage your preferences' },
      dashboard: { title: 'Dashboard', sub: 'Overview of your activity' },
      activity: { title: 'My Activity', sub: 'Your action history' },
      help: { title: 'Help Center', sub: 'Documentation and FAQ' },
      questions: { title: 'Questions', sub: 'Questions asked on your products' },
    },
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
      window.dispatchEvent(new CustomEvent('locale-change', { detail: l }));
    }
  };

  const t = (path) => {
    const keys = path.split('.');
    let val = locales[locale];
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) val = val[k];
      else return path;
    }
    return val ?? path;
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

export function t(path) {
  const locale = typeof window !== 'undefined' ? localStorage.getItem('trustlink_seller_locale') || 'fr' : 'fr';
  const keys = path.split('.');
  let val = locales[locale];
  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) val = val[k];
    else return path;
  }
  return val ?? path;
}
