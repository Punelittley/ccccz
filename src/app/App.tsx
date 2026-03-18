import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  useEffect(() => {
    // Backend now handles admin user creation;
    // initialization utilities are no longer required
    // initializeAdmin();
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}