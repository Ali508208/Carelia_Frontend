// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ADMIN_TOKEN_COOKIE_KEY } from "../utils/httpClient";

export default function PrivateRoute({ children }) {
  const token = Cookies.get(ADMIN_TOKEN_COOKIE_KEY);
  const isAuthed = Boolean(token); // or also check localStorage("adminUser")

  return isAuthed ? children : <Navigate to="/login" replace />;
}
