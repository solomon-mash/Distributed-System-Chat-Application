import React, { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

export default function App() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <AuthGate />;
  }

  return <Chat />;
}

function AuthGate() {
  // toggle between Login and Register
  const [showRegister, setShowRegister] = React.useState(false);
  return showRegister ? (
    <div>
      <Register onSwitch={() => setShowRegister(false)} />
    </div>
  ) : (
    <div>
      <Login onSwitch={() => setShowRegister(true)} />
    </div>
  );
}
