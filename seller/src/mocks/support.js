export const mockKycDocuments = [
  {
    id: "kyc-001",
    label: "BVN (Bank Verification Number)",
    status: "verified",
    uploaded_at: "2024-03-15",
  },
  {
    id: "kyc-002",
    label: "NIN (National Identity Number)",
    status: "verified",
    uploaded_at: "2024-03-15",
  },
  {
    id: "kyc-003",
    label: "CAC (Certificate of Incorporation)",
    status: "pending",
    uploaded_at: "2026-04-10",
  },
  {
    id: "kyc-004",
    label: "Justificatif de domicile",
    status: "not_started",
    uploaded_at: null,
  },
];

export const mockTickets = [
  {
    id: "ticket-001",
    subject: "Commande TL-004821 — Retard de depot",
    status: "open",
    unread: 2,
    messages: [
      {
        id: "msg-001",
        sender: "seller",
        sender_name: "Adebayo Fashions",
        content: "Bonjour, ma commande TL-004821 est prete depuis hier mais je n'arrive pas a generer le bordereau QR. Pouvez-vous m'aider ?",
        timestamp: "2026-04-22T10:30:00Z",
        is_read: true,
      },
      {
        id: "msg-002",
        sender: "hub",
        sender_name: "TrustLink Support",
        content: "Bonjour Adebayo, nous avons identifie le probleme. Votre compte necessite une verification supplementaire. Nous traitons votre demande sous 2h.",
        timestamp: "2026-04-22T11:15:00Z",
        is_read: true,
      },
      {
        id: "msg-003",
        sender: "hub",
        sender_name: "TrustLink Support",
        content: "Mise a jour : votre bordereau est maintenant disponible. Vous pouvez le telecharger depuis la page Commandes. Desolee pour le delai.",
        timestamp: "2026-04-23T09:00:00Z",
        is_read: false,
      },
    ],
  },
  {
    id: "ticket-002",
    subject: "Question — Delai livraison vers Parakou",
    status: "resolved",
    unread: 0,
    messages: [
      {
        id: "msg-004",
        sender: "seller",
        sender_name: "Adebayo Fashions",
        content: "Quel est le delai de livraison standard pour Parakou (nord Benin) ? Mon client demande une estimation.",
        timestamp: "2026-04-20T14:00:00Z",
        is_read: true,
      },
      {
        id: "msg-005",
        sender: "hub",
        sender_name: "TrustLink Support",
        content: "Pour Parakou, le delai est de 7 a 9 jours ouvres depuis Lagos Hub. Le colis transite par Cotonou Hub avant d'etre achemine vers le nord. Nous envoyons des notifications SMS a l'acheteur a chaque etape.",
        timestamp: "2026-04-20T15:30:00Z",
        is_read: true,
      },
    ],
  },
];

export const mockFaq = [
  {
    id: "faq-1",
    question: "Quand les fonds Escrow sont-ils liberes ?",
    answer: "Les fonds sont liberes 24 a 48 heures apres confirmation de livraison par l'acheteur. En cas de litige, une mediation est ouverte sous 5 jours ouvrables. TrustLink garantit la protection des fonds pendant toute la duree du transit.",
  },
  {
    id: "faq-2",
    question: "Quel est le delai de livraison vers le Benin ?",
    answer: "Cotonou : 5-6 jours ouvrables. Parakou et nord Benin : 7-9 jours ouvrables. Le cut-off de depot au Hub est fixe a 14h. Les depots apres 14h sont traites le lendemain matin.",
  },
  {
    id: "faq-3",
    question: "Comment deposer mon colis au Hub ?",
    answer: "Presentez-vous au Hub avec votre bordereau QR (imprime ou sur telephone). Le Hub scanne le QR, pese et mesure le colis, puis vous remet un recepisse. Pas besoin d'imprimer : votre telephone suffit.",
  },
  {
    id: "faq-4",
    question: "Quels documents KYC sont acceptes ?",
    answer: "Pour les particuliers : BVN + NIN obligatoires. Pour les entreprises : CAC (Certificate of Incorporation) + BVN du gerant. Tous les documents doivent dater de moins de 6 mois. Les documents etrangers ne sont pas acceptes.",
  },
  {
    id: "faq-5",
    question: "Puis-je vendre plusieurs categories de produits ?",
    answer: "Oui, vous pouvez lister autant de categories que vous souhaitez. Chaque nouveau produit passe par une revue de 24h par notre equipe avant d'etre publie. Les produits electroniques, mode, beaute et maison sont les plus vendus.",
  },
  {
    id: "faq-6",
    question: "Que se passe-t-il si l'acheteur refuse la livraison ?",
    answer: "Les frais de retour sont a la charge de l'acheteur si le refus n'est pas justifie. Si l'acheteur signale un probleme valide (produit non conforme), une mediation est ouverte. TrustLink arbitre sous 5 jours. Le vendeur est informe a chaque etape.",
  },
  {
    id: "faq-7",
    question: "Comment est calculee la commission TrustLink ?",
    answer: "La commission est de 8% du montant NGN de chaque vente. Elle couvre la logistique Hub-to-Hub, l'assurance colis, le systeme Escrow et la conversion de devises NGN/FCFA. Aucun frais cache — tout est transparent dans votre Wallet.",
  },
];
