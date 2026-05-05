import ProductsTable from './components/ProductsTable';
export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Catalogue Produits
      </h1>
      <ProductsTable />
    </div>
  );
}
