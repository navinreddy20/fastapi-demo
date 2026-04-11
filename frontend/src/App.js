import React, { useCallback, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import ProductDashboard from "./components/ProductDashboard";
import { getAccessToken } from "./api/client";
import "./App.css";

function App() {
  const [authed, setAuthed] = useState(() => !!getAccessToken());

  const onAuthenticated = useCallback(() => setAuthed(true), []);
  const onLogout = useCallback(() => setAuthed(false), []);

  if (!authed) {
    return <AuthScreen onAuthenticated={onAuthenticated} />;
  }

  return <ProductDashboard onLogout={onLogout} />;
}

export default App;
