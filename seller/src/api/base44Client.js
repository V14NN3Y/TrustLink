export const base44 = {
  auth: {
    me: async () => {
      const storedUser = localStorage.getItem('trustlink_seller_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      const defaultUser = {
        id: 'usr_123',
        name: 'Seller User',
        email: 'seller@trustlink.com',
        role: 'seller'
      };
      localStorage.setItem('trustlink_seller_user', JSON.stringify(defaultUser));
      return defaultUser;
    },
    logout: (redirectUrl) => {
      localStorage.removeItem('trustlink_seller_token');
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    }
  }
};
