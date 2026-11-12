// Prix "tout compris" = prix article + transport/douane + séquestre.
//
// Transport et douane peuvent être pilotés par variables d'environnement (Vite) :
//   VITE_TRANSPORT_FEE_XOF : transport par article, en FCFA (défaut 2500)
//   VITE_CUSTOMS_PCT       : douane en % du prix article (défaut 0)
// Ordre de priorité : variable d'environnement > table escrow_config > valeur par défaut.
// Le séquestre (spread_pct) reste lu dans escrow_config.
export const DEFAULT_PRICING = { spread_pct: 3, delivery_fee: 2500, customs_pct: 0 };

// Retourne un nombre >= 0, ou null si la variable est absente ou invalide.
const readEnvNumber = (raw) => {
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export const ENV_PRICING = {
  delivery_fee: readEnvNumber(import.meta.env.VITE_TRANSPORT_FEE_XOF),
  customs_pct: readEnvNumber(import.meta.env.VITE_CUSTOMS_PCT),
};

// Fusionne la config issue de la base (peut être partielle ou null) avec l'env et les défauts.
export function resolvePricing(dbCfg) {
  const db = dbCfg || {};
  return {
    spread_pct: Number(db.spread_pct ?? DEFAULT_PRICING.spread_pct),
    delivery_fee: ENV_PRICING.delivery_fee ?? Number(db.delivery_fee ?? DEFAULT_PRICING.delivery_fee),
    customs_pct: ENV_PRICING.customs_pct ?? Number(db.customs_pct ?? DEFAULT_PRICING.customs_pct),
  };
}

export function computeAllInclusive(price, cfg = resolvePricing(null)) {
  const item = Math.round(Number(price) || 0);
  const transport = Math.round(Number(cfg.delivery_fee) || 0);
  const customs = Math.round((item * (Number(cfg.customs_pct) || 0)) / 100);
  const escrow = Math.round((item * (Number(cfg.spread_pct) || 0)) / 100);
  return {
    item,
    transportCustoms: transport + customs,
    escrow,
    total: item + transport + customs + escrow,
  };
}
