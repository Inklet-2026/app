import { useState, useEffect } from "react";
import Header from "./components/Header";
import InputBox from "./components/InputBox";
import ManualPopup from "./components/ManualPopup";
import LoginPopup from "./components/LoginPopup";
import SettingsPopup from "./components/SettingsPopup";
import SourcesPopup from "./components/SourcesPopup";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const popupType = params.get("popup");

  if (popupType === "manual") return <ManualPopup />;
  if (popupType === "login") return <LoginPopup />;
  if (popupType === "settings") return <SettingsPopup />;
  if (popupType === "sources") return <SourcesPopup />;

  return <MainApp />;
}

function MainApp() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (window as any).electronAPI?.authStoredUser?.().then((user: any) => {
      if (user?.username) setUsername(user.username);
    });
    (window as any).electronAPI?.authRestore?.().then((user: any) => {
      setUsername(user?.username ?? null);
    });
    (window as any).electronAPI?.onAuthChanged?.((user: any) => {
      setUsername(user?.username ?? null);
    });
  }, []);

  function handleLogout() {
    (window as any).electronAPI?.authLogout();
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
