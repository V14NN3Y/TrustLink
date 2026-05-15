const locales = {
  fr: {
    nav: { dashboard: 'Dashboard', orders: 'Commandes', catalog: 'Catalogue', reviews: 'Avis', stats: 'Statistiques', payouts: 'Paiements', support: 'Support & KYC', messages: 'Messages', questions: 'Questions', settings: 'Paramètres', notifications: 'Notifications', help: 'Centre d\'aide', activity: 'Mon activité' },
    home: { hello: 'Bonjour', overview: 'Voici un aperçu de votre activité', newProduct: 'Nouveau Produit', ordersReceived: 'Commandes reçues', processing: 'En cours de traitement', approvedProducts: 'Produits approuvés', estimatedRevenue: 'Revenus estimés (NGN)', videos: 'Vidéos de déballage', disputes: 'Litiges', seeInOrders: 'Voir dans les commandes →', lowStock: 'Stock faible', noLowStock: 'Aucun produit en rupture', productPerf: 'Performance produits' },
    order: { title: 'Commandes', all: 'Toutes', search: 'Rechercher...', export: 'Exporter CSV', total: 'Total', noOrders: 'Aucune commande trouvée', markProcessing: 'Marquer en traitement', markTransit: 'Marquer en transit', markDelivered: 'Marquer livré', close: 'Fermer' },
    product: { title: 'Catalogue', newProduct: 'Nouveau produit', search: 'Rechercher un produit...', all: 'Tous', approved: 'Approuvés', pendingReview: 'En révision', rejected: 'Rejetés', drafts: 'Brouillons', totalProducts: 'Produits total', active: 'Actifs', totalStock: 'Stock total', totalSales: 'Ventes totales', importCSV: 'Importer CSV', exportCSV: 'Exporter CSV', quickEdit: 'Modification rapide' },
    review: { title: 'Avis clients', totalReviews: 'Total avis', averageRating: 'Note moyenne', fiveStars: '5 étoiles', noReviews: 'Aucun avis pour le moment' },
    payout: { title: 'Mes paiements', totalPaid: 'Total payé', pending: 'En attente', total: 'Total global', noPayouts: 'Aucune demande de paiement' },
    support: { title: 'Support & KYC', kyc: 'Vérification KYC', tickets: 'Mes tickets', faq: 'FAQ', kycCompletion: 'KYC complété', responseTime: 'Temps de réponse moyen' },
    settings: { profile: 'Mon Profil', boutique: 'Boutique & Marque', notifications: 'Notifications', security: 'Sécurité', language: 'Langue & Devise', save: 'Sauvegarder', logout: 'Déconnexion' },
    general: { loading: 'Chargement...', error: 'Erreur', save: 'Enregistrer', cancel: 'Annuler', confirm: 'Confirmer', search: 'Rechercher', filter: 'Filtrer', all: 'Tous', yes: 'Oui', no: 'Non', days: 'jours', ngn: 'NGN', fcfa: 'FCFA', inbox: 'Réception', inTransit: 'En transit', delivered: 'Livré' },
    help: { title: 'Centre d\'aide', subtitle: 'Guide et documentation pour bien démarrer', gettingStarted: 'Premiers pas', faq: 'Questions fréquentes', contact: 'Nous contacter' },
  },
  en: {
    nav: { dashboard: 'Dashboard', orders: 'Orders', catalog: 'Catalog', reviews: 'Reviews', stats: 'Stats', payouts: 'Payouts', support: 'Support & KYC', messages: 'Messages', questions: 'Questions', settings: 'Settings', notifications: 'Notifications', help: 'Help Center', activity: 'My Activity' },
    home: { hello: 'Hello', overview: 'Here is an overview of your activity', newProduct: 'New Product', ordersReceived: 'Orders Received', processing: 'In Processing', approvedProducts: 'Approved Products', estimatedRevenue: 'Estimated Revenue (NGN)', videos: 'Unboxing Videos', disputes: 'Disputes', seeInOrders: 'See in Orders →', lowStock: 'Low Stock', noLowStock: 'No low stock items', productPerf: 'Product Performance' },
    order: { title: 'Orders', all: 'All', search: 'Search...', export: 'Export CSV', total: 'Total', noOrders: 'No orders found', markProcessing: 'Mark Processing', markTransit: 'Mark In Transit', markDelivered: 'Mark Delivered', close: 'Close' },
    product: { title: 'Catalog', newProduct: 'New Product', search: 'Search products...', all: 'All', approved: 'Approved', pendingReview: 'Pending Review', rejected: 'Rejected', drafts: 'Drafts', totalProducts: 'Total Products', active: 'Active', totalStock: 'Total Stock', totalSales: 'Total Sales', importCSV: 'Import CSV', exportCSV: 'Export CSV', quickEdit: 'Quick Edit' },
    review: { title: 'Reviews', totalReviews: 'Total Reviews', averageRating: 'Average Rating', fiveStars: '5 Stars', noReviews: 'No reviews yet' },
    payout: { title: 'My Payouts', totalPaid: 'Total Paid', pending: 'Pending', total: 'Total', noPayouts: 'No payout requests yet' },
    support: { title: 'Support & KYC', kyc: 'KYC Verification', tickets: 'My Tickets', faq: 'FAQ', kycCompletion: 'KYC Completed', responseTime: 'Avg Response Time' },
    settings: { profile: 'My Profile', boutique: 'Store & Brand', notifications: 'Notifications', security: 'Security', language: 'Language & Currency', save: 'Save', logout: 'Logout' },
    general: { loading: 'Loading...', error: 'Error', save: 'Save', cancel: 'Cancel', confirm: 'Confirm', search: 'Search', filter: 'Filter', all: 'All', yes: 'Yes', no: 'No', days: 'days', ngn: 'NGN', fcfa: 'FCFA', inbox: 'Inbox', inTransit: 'In Transit', delivered: 'Delivered' },
    help: { title: 'Help Center', subtitle: 'Guide and documentation to get started', gettingStarted: 'Getting Started', faq: 'FAQ', contact: 'Contact Us' },
  },
};
let currentLocale = 'fr';
export function t(path) {
  const keys = path.split('.');
  let val = locales[currentLocale];
  for (const k of keys) { if (val && typeof val === 'object' && k in val) val = val[k]; else return path; }
  return val || path;
}
export function setLocale(locale) {
  if (locales[locale]) { currentLocale = locale; localStorage.setItem('trustlink_seller_locale', locale); document.documentElement.lang = locale; }
}
export function getLocale() {
  return currentLocale;
}
const saved = localStorage.getItem('trustlink_seller_locale');
if (saved && locales[saved]) { currentLocale = saved; document.documentElement.lang = saved; }
