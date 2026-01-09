// Dependencies
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Modal from "react-modal";

// Routes
import Login from "./routes/user/Login";
import Register from "./routes/user/Register";
import PasswordRecovery from "./routes/user/PasswordRecovery";
import RecoverPassword from "./routes/user/RecoverPassword";
import UploadExcel from "./routes/chat/UploadExcel";
import { NotFound } from "./routes/Error";
import User from "./routes/admin/User";
import Debtor from "./routes/chat/Debtor";
import Chat from "./routes/chat/Chat";
import CallChat from "./routes/chat/CallChat";
import Settings from "./routes/user/Settings";
import Client from "./routes/chat/Client";
import Agentes from "./routes/user/Agents";
import Cost from "./routes/admin/Cost";
import SetAgents from "./routes/admin/SetAgents";
import SendSupportTicket from "./routes/user/SendSupportTicket";
import GetSupportTickets from "./routes/admin/GetSupportTickets";
import GetRequestTickets from "./routes/admin/GetRequestTickets";
import { Dashboard } from "./routes/user/Dashboard";
import TermsPage from "./routes/Terms";
import RealTimeDashboardPage from "./routes/dashboard/RealTimeDashboard";
import EnhancedChatPage from "./routes/chat/EnhancedChat";
import CostTrackingPage from "./routes/billing/CostTracking";
import CollectionManagementPage from "./routes/dashboard/CollectionManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/password-recovery",
    element: <PasswordRecovery />,
  },
  {
    path: "/password-recovery/:token",
    element: <RecoverPassword />,
  },
  {
    path: "/upload-excel",
    element: <UploadExcel />,
  },
  {
    path: "/user",
    element: <User />,
  },
  {
    path: "/debtor",
    element: <Debtor />,
  },
  {
    path: "/client",
    element: <Client />,
  },
  {
    path: "/agents",
    element: <Agentes />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
  {
    path: "/enhanced-chat",
    element: <EnhancedChatPage />,
  },
  {
    path: "/call-chat",
    element: <CallChat />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/cost",
    element: <Cost />,
  },
  {
    path: "/set-agents",
    element: <SetAgents />,
  },
  {
    path: "/support-ticket",
    element: <SendSupportTicket />,
  },
  {
    path: "/all-support-tickets",
    element: <GetSupportTickets />,
  },
  {
    path: "/all-request-tickets",
    element: <GetRequestTickets />,
  },
  {
    path: "/report",
    element: <Dashboard />,
  },
  {
    path: "/real-time-dashboard",
    element: <RealTimeDashboardPage />,
  },
  {
    path: "/terms",
    element: <TermsPage />,
  },
  {
    path: "/cost-tracking",
    element: <CostTrackingPage />,
  },
  {
    path: "/collection-management",
    element: <CollectionManagementPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

// Set the app element for react-modal
Modal.setAppElement('#root');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
