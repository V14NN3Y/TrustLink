// Mock Base44 client — provides a stub so the app can run standalone without the Base44 platform.

const mockUser = {
  id: 'admin-001',
  email: 'admin@trustlink.bj',
  name: 'Admin Principal',
  role: 'admin',
};

export const base44 = {
  auth: {
    me: async () => mockUser,
    logout: (redirectUrl) => {
      console.log('[mock] logout called', redirectUrl);
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: (redirectUrl) => {
      console.log('[mock] redirectToLogin called', redirectUrl);
    },
  },
  entities: {
    Notification: {
      create: async (data) => {
        console.log('[mock] Notification.create', data);
        return { id: 'notif-' + Date.now(), ...data };
      },
    },
  },
};
