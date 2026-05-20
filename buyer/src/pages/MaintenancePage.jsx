export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <i className="ri-shield-warning-line text-4xl text-amber-500" />
        </div>
        <h1 className="text-2xl font-poppins font-bold mb-3" style={{ color: '#111827' }}>
          Site en maintenance
        </h1>
        <p className="text-sm font-inter mb-6" style={{ color: '#6B7280' }}>
          TrustLink est actuellement en maintenance. Nous revenons très vite !
          Merci de votre patience.
        </p>
        <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: '#125C8D' }} />
      </div>
    </div>
  );
}
