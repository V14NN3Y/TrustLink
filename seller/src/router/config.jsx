import { Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/home/page";
import OrdersPage from "@/pages/orders/page";
import CatalogPage from "@/pages/catalog/page";
import NewProductPage from "@/pages/catalog/new/page";
import StatsPage from "@/pages/stats/page";
import SupportPage from "@/pages/support/page";
import SettingsPage from "@/pages/settings/page";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import NotificationsPage from "@/pages/notifications/page";
import MessagesPage from "@/pages/messages/page";
import ReviewsPage from "@/pages/reviews/page";

const routes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: (
      <ProtectedRoute
        unauthenticatedElement={<Navigate to="/login" replace />}
      />
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/orders", element: <OrdersPage /> },
      { path: "/catalog", element: <CatalogPage /> },
      { path: "/catalog/new", element: <NewProductPage /> },
      { path: "/stats", element: <StatsPage /> },
      { path: "/support", element: <SupportPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "/settings/:section", element: <SettingsPage /> },
      { path: "/reviews", element: <ReviewsPage /> },
    ],
  },
];

export default routes;
