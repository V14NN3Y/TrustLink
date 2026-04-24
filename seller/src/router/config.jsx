import Home from "@/pages/home/page";
import OrdersPage from "@/pages/orders/page";
import CatalogPage from "@/pages/catalog/page";
import NewProductPage from "@/pages/catalog/new/page";
import WalletPage from "@/pages/wallet/page";
import SupportPage from "@/pages/support/page";
import SettingsPage from "@/pages/settings/page";

const routes = [
  { path: "/", element: <Home /> },
  { path: "/orders", element: <OrdersPage /> },
  { path: "/catalog", element: <CatalogPage /> },
  { path: "/catalog/new", element: <NewProductPage /> },
  { path: "/wallet", element: <WalletPage /> },
  { path: "/support", element: <SupportPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/settings/:section", element: <SettingsPage /> },
];

export default routes;
