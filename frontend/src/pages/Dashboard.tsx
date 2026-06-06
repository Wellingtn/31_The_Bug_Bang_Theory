import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "./dashboards/AdminDashboard";
import ClientDashboard from "./dashboards/ClientDashboard";
import ProducerDashboard from "./dashboards/ProducerDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (user?.role === "PRODUTOR") {
    return <ProducerDashboard />;
  }

  return <ClientDashboard mode={user?.role === "EMPRESA" ? "empresa" : "cliente"} />;
}
