import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute, type Role } from "@/components/router/protected-route";

// ========= Layout =========
const AppShell = lazy(() =>
  import("@/components/layout/app-shell").then((m) => ({ default: m.AppShell }))
);

// ========= Auth pages =========
const SignIn = lazy(() => import("@/app/auth/sign-in/page"));

// ========= Error pages =========
const Unauthorized = lazy(() => import("@/app/errors/unauthorized/page"));
const Forbidden = lazy(() => import("@/app/errors/forbidden/page"));
const NotFound = lazy(() => import("@/app/errors/not-found/page"));

// ========= POS pages =========
const Dashboard = lazy(() => import("@/app/pos/dashboard/page"));
const Inventory = lazy(() => import("@/app/pos/inventory/page"));
const AddInventoryPhone = lazy(() => import("@/app/pos/inventory/addPhone/page"));
const EditInventoryPhone = lazy(() => import("@/app/pos/inventory/edit/page"));
const InventoryDetails = lazy(() => import("@/app/pos/inventory/details/page"));
const Sales = lazy(() => import("@/app/pos/sales/page"));
const NewSale = lazy(() => import("@/app/pos/sales/new/page"));
const EditSale = lazy(() => import("@/app/pos/sales/new/page"));
const SaleDetails = lazy(() => import("@/app/pos/sales/details/page"));
const Debts = lazy(() => import("@/app/pos/customers/debts/page"));
const DebtDetails = lazy(() => import("@/app/pos/customers/debts/details/page"));
const Credits = lazy(() => import("@/app/pos/customers/credits/page"));
const CustomerDetails = lazy(
  () => import("@/app/pos/customers/customer-details/page"),
);
const Workers = lazy(() => import("@/app/pos/workers/page"));
const NewWorker = lazy(() => import("@/app/pos/workers/new/page"));
const EditWorker = lazy(() => import("@/app/pos/workers/edit/page"));
const WorkerDetails = lazy(() => import("@/app/pos/workers/details/page"));
const Settings = lazy(() => import("@/app/pos/settings/page"));
const Help = lazy(() => import("@/app/pos/help/page"));
const User = lazy(() => import("@/app/pos/user/page"));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

// Helper: wrap protected/public pages
function P(
  node: React.ReactNode,
  allowedRoles?: Role[],
  requireAuth: boolean = true
) {
  return (
    <ProtectedRoute requireAuth={requireAuth} allowedRoles={allowedRoles}>
      {node}
    </ProtectedRoute>
  );
}

// ========= Role groups =========
const ALL: Role[] = ["ADMIN", "CASHIER", "TECHNICIAN"];
const STAFF: Role[] = ["ADMIN", "TECHNICIAN", "CASHIER"]; // sales/customers
const ADMIN: Role[] = ["ADMIN"];

export const routes: RouteConfig[] = [
  // Default -> dashboard
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  // Auth (public)
  // login bo‘lgan user kirsa dashboardga ketadi (ProtectedRoute ichida bor)
  { path: "/auth/sign-in", element: P(<SignIn />, undefined, false) },

  // Errors (public)
  { path: "/errors/unauthorized", element: <Unauthorized /> },
  { path: "/errors/forbidden", element: <Forbidden /> },

  // POS layout (protected)
  // AppShell hamma staff uchun ochiq, ichida outlet orqali children chiqadi
  {
    path: "/",
    element: P(<AppShell />, ALL, true),
    children: [
      // Main pages (ALL)
      { path: "dashboard", element: P(<Dashboard />, ALL, true) },
      { path: "inventory", element: P(<Inventory />, ALL, true) },
      { path: "inventory/addPhone", element: P(<AddInventoryPhone />, ALL, true) },
      { path: "inventory/:id/edit", element: P(<EditInventoryPhone />, ALL, true) },
      { path: "inventory/:id", element: P(<InventoryDetails />, ALL, true) },
      { path: "user", element: P(<User />, ALL, true) },
      { path: "help", element: P(<Help />, ALL, true) },

      // Cashier ops (STAFF)
      { path: "sales", element: P(<Sales />, STAFF, true) },
      { path: "sales/new", element: P(<NewSale />, STAFF, true) },
      { path: "sales/:id/edit", element: P(<EditSale />, STAFF, true) },
      { path: "sales/:id", element: P(<SaleDetails />, STAFF, true) },
      { path: "debts", element: P(<Debts />, STAFF, true) },
      { path: "debts/:purchaseId", element: P(<DebtDetails />, STAFF, true) },
      { path: "credits", element: P(<Credits />, STAFF, true) },
      {
        path: "customers/customer-details/:id",
        element: P(<CustomerDetails />, STAFF, true),
      },

      // Admin only
      { path: "workers", element: P(<Workers />, ADMIN, true) },
      { path: "workers/new", element: P(<NewWorker />, ADMIN, true) },
      { path: "workers/:id/edit", element: P(<EditWorker />, ADMIN, true) },
      { path: "workers/:id", element: P(<WorkerDetails />, ADMIN, true) },
      { path: "settings", element: P(<Settings />, ADMIN, true) },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
];

