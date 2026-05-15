const locales = {
  fr: {
    nav: { home: 'Accueil', account: 'Mon Compte', cart: 'Panier', support: 'Support', login: 'Connexion', register: 'Inscription', logout: 'Déconnexion', search: 'Rechercher...', orders: 'Mes commandes', wishlist: 'Ma wishlist', settings: 'Paramètres' },
    product: { addToCart: 'Ajouter au panier', buyNow: 'Acheter maintenant', outOfStock: 'Rupture de stock', inStock: 'En stock', quantity: 'Quantité', description: 'Description', reviews: 'Avis clients', similar: 'Vous aimerez aussi', askQuestion: 'Poser une question', notifyMe: 'Prévenez-moi', days: 'jours', seller: 'Vendeur', verified: 'Vérifié', delivery: 'Livraison estimée' },
    cart: { title: 'Mon Panier', empty: 'Votre panier est vide', checkout: 'Passer la commande', subtotal: 'Sous-total', shipping: 'Frais de livraison', total: 'Total', continue: 'Continuer mes achats' },
    checkout: { title: 'Finaliser ma commande', address: 'Adresse de livraison', payment: 'Paiement', confirm: 'Confirmer', guestCheckout: 'Commander en tant qu\'invité', loginRequired: 'Connectez-vous ou continuez en tant qu\'invité' },
    order: { title: 'Mes commandes', status: { pending: 'En attente', paid: 'Payée', processing: 'En cours', in_transit: 'En transit', delivered: 'Livrée', confirmed: 'Confirmée', disputed: 'Litige', cancelled: 'Annulée', refunded: 'Remboursée' }, tracking: 'Suivi de commande', confirmDelivery: 'Confirmer la réception', openDispute: 'Ouvrir un litige', invoice: 'Facture' },
    general: { save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', loading: 'Chargement...', error: 'Erreur', close: 'Fermer', back: 'Retour', next: 'Suivant', search: 'Rechercher', filter: 'Filtrer', sort: 'Trier', all: 'Tous', yes: 'Oui', no: 'Non', cookieConsent: 'Ce site utilise des cookies pour améliorer votre expérience.', cookieAccept: 'Accepter', cookieDecline: 'Refuser' },
    auth: { login: 'Connexion', register: 'Inscription', email: 'Email', password: 'Mot de passe', forgotPassword: 'Mot de passe oublié ?', noAccount: 'Pas encore de compte ?', hasAccount: 'Déjà un compte ?', name: 'Nom complet', createAccount: 'Créer un compte' },
    support: { title: 'Support', kyc: 'Vérification KYC', tickets: 'Mes tickets', faq: 'FAQ', contact: 'Nous contacter' },
  },
  en: {
    nav: { home: 'Home', account: 'My Account', cart: 'Cart', support: 'Support', login: 'Login', register: 'Register', logout: 'Logout', search: 'Search...', orders: 'My Orders', wishlist: 'My Wishlist', settings: 'Settings' },
    product: { addToCart: 'Add to Cart', buyNow: 'Buy Now', outOfStock: 'Out of Stock', inStock: 'In Stock', quantity: 'Quantity', description: 'Description', reviews: 'Reviews', similar: 'You May Also Like', askQuestion: 'Ask a Question', notifyMe: 'Notify Me', days: 'days', seller: 'Seller', verified: 'Verified', delivery: 'Estimated Delivery' },
    cart: { title: 'My Cart', empty: 'Your cart is empty', checkout: 'Checkout', subtotal: 'Subtotal', shipping: 'Shipping', total: 'Total', continue: 'Continue Shopping' },
    checkout: { title: 'Checkout', address: 'Shipping Address', payment: 'Payment', confirm: 'Confirm', guestCheckout: 'Checkout as Guest', loginRequired: 'Login or continue as guest' },
    order: { title: 'My Orders', status: { pending: 'Pending', paid: 'Paid', processing: 'Processing', in_transit: 'In Transit', delivered: 'Delivered', confirmed: 'Confirmed', disputed: 'Dispute', cancelled: 'Cancelled', refunded: 'Refunded' }, tracking: 'Order Tracking', confirmDelivery: 'Confirm Delivery', openDispute: 'Open Dispute', invoice: 'Invoice' },
    general: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', loading: 'Loading...', error: 'Error', close: 'Close', back: 'Back', next: 'Next', search: 'Search', filter: 'Filter', sort: 'Sort', all: 'All', yes: 'Yes', no: 'No', cookieConsent: 'This site uses cookies to improve your experience.', cookieAccept: 'Accept', cookieDecline: 'Decline' },
    auth: { login: 'Login', register: 'Register', email: 'Email', password: 'Password', forgotPassword: 'Forgot Password?', noAccount: "Don't have an account?", hasAccount: 'Already have an account?', name: 'Full Name', createAccount: 'Create Account' },
    support: { title: 'Support', kyc: 'KYC Verification', tickets: 'My Tickets', faq: 'FAQ', contact: 'Contact Us' },
  },
};

let currentLocale = 'fr';

export function t(path) {
  const keys = path.split('.');
  let val = locales[currentLocale];
  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) val = val[k];
    else return path;
  }
  return val || path;
}

export function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale;
    localStorage.setItem('trustlink_locale', locale);
    document.documentElement.lang = locale;
  }
}

export function getLocale() {
  return currentLocale;
}

const saved = localStorage.getItem('trustlink_locale');
if (saved && locales[saved]) {
  currentLocale = saved;
  document.documentElement.lang = saved;
}
