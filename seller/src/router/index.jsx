import { useRoutes } from "react-router-dom";
import routes from "./config";

export default function AppRoutes() {
  return useRoutes(routes);
}
