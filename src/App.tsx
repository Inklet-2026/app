import { useState, useEffect } from "react";
import Header from "./components/Header";
import InputBox from "./components/InputBox";
import ManualPopup from "./components/ManualPopup";
import LoginPopup from "./components/LoginPopup";
import SettingsPopup from "./components/SettingsPopup";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const popupType = params.get("popup");

  if (popupType === "manual") return <ManualPopup />;
  if (popupType === "login") return <LoginPopup />;
  if (popupType === "settings") return <SettingsPopup />;

  return <MainApp />;
}

function MainApp() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (window as any).electronAPI?.onLoginSuccess?.((data: { username: string }) => {
      setUsername(data.username);
    });
  }, []);

  function handleLogout() {
    setUsername(null);
  }

  function handleLoginClick(x: number, y: number) {
    (window as any).electronAPI?.showLoginPopup(x, y);
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      paddingTop: 2,
      overflow: "visible",
    }}>
      <Header username={username} onLogout={handleLogout} onLoginClick={handleLoginClick} />
      <div style={{ padding: "0px 12px 0px", overflow: "visible", position: "relative" }}>
        <InputBox disabled={!username} onLoginClick={handleLoginClick} />
      </div>
    </div>
  );
}
