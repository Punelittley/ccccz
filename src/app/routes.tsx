import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import BookDiscussion from "./pages/BookDiscussion";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import { AdminRoute } from "./pages/admin/AdminRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/book/:id",
    Component: BookDiscussion,
  },
  {
    path: "/login",
    Component: Auth,
  },
  {
    path: "/register",
    Component: Auth,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/books",
    element: (
      <AdminRoute>
        <AdminBooks />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <AdminUsers />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/content",
    element: (
      <AdminRoute>
        <AdminContent />
      </AdminRoute>
    ),
  },
]);

