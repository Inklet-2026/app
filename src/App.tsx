import Header from "./components/Header";
import InputBox from "./components/InputBox";
import ManualPopup from "./components/ManualPopup";

export default function App() {
  const isPopup = window.location.search.includes("popup=manual");

  if (isPopup) return <ManualPopup />;

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      paddingTop: 2,
      overflow: "visible",
    }}>
      <Header />
      <div style={{ padding: "0px 12px 0px", overflow: "visible" }}>
        <InputBox />
      </div>
    </div>
  );
}
