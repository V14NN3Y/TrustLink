// Mock base44 client since we are removing the SDK dependency
export const buyer = {
  auth: {
    me: async () => ({ id: 1, name: 'Buyer User', role: 'buyer', email: 'buyer@trustlink.com' }),
    logout: (url) => { if(url) window.location.href = url; },
    redirectToLogin: (url) => { if(url) window.location.href = url; }
  }
};
