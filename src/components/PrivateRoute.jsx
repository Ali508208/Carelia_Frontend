import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const isAuthed = Boolean(localStorage.getItem("authToken"));
  return isAuthed ? children : <Navigate to="/login" replace />;
}
