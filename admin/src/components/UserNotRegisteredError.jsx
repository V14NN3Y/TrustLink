// import React from 'react';
// import { AlertTriangle, Home, LogOut } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { base44 } from '@/api/base44Client';

// const UserNotRegisteredError = () => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
//       <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 space-y-6">
//         <div className="w-20 h-20 bg-brand-orange/10 rounded-3xl flex items-center justify-center mx-auto">
//           <AlertTriangle size={36} className="text-brand-orange" />
//         </div>
        
//         <div className="space-y-2">
//           <h1 className="text-2xl font-bold font-poppins text-foreground tracking-tight">Accès Restreint</h1>
//           <p className="text-muted-foreground font-inter text-sm leading-relaxed">
//             Votre compte n'est pas autorisé à accéder à cette boutique. Veuillez contacter l'administrateur TrustLink pour valider votre inscription.
//           </p>
//         </div>

//         <div className="p-4 bg-slate-50 rounded-2xl text-left space-y-3">
//           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vérifications possibles :</p>
//           <ul className="text-xs text-slate-600 space-y-2 font-inter">
//             <li className="flex items-start gap-2">
//               <div className="w-1.5 h-1.5 rounded-full bg-brand-orange/40 mt-1 shrink-0" />
//               <span>Vérifiez que vous utilisez l'adresse email correcte.</span>
//             </li>
//             <li className="flex items-start gap-2">
//               <div className="w-1.5 h-1.5 rounded-full bg-brand-orange/40 mt-1 shrink-0" />
//               <span>Attendez la confirmation d'activation de votre compte.</span>
//             </li>
//           </ul>
//         </div>

//         <div className="flex flex-col gap-3">
//           <Button 
//             className="bg-brand-blue hover:bg-brand-night text-white font-bold w-full h-12 rounded-2xl"
//             onClick={() => window.location.href = '/'}
//           >
//             Réessayer
//           </Button>
//           <Button 
//             variant="ghost" 
//             className="text-muted-foreground font-semibold flex gap-2"
//             onClick={() => base44.auth.logout()}
//           >
//             <LogOut size={16} /> Déconnexion
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserNotRegisteredError;

import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-100">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Access Restricted</h1>
          <p className="text-slate-600 mb-8">
            You are not registered to use this application. Please contact the app administrator to request access.
          </p>
          <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600">
            <p>If you believe this is an error, you can:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Verify you are logged in with the correct account</li>
              <li>Contact the app administrator for access</li>
              <li>Try logging out and back in again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
