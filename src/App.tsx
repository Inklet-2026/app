import Header from "./components/Header";
import InputBox from "./components/InputBox";

export default function App() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      paddingTop: 6,
    }}>
      <Header />
      <div style={{ flex: 1, padding: "6px 12px 12px", display: "flex", flexDirection: "column" }}>
        <InputBox />
      </div>
    </div>
  );
}
