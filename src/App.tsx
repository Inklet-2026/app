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
      overflow: "visible",
    }}>
      <Header />
      <div style={{ padding: "4px 12px 4px", overflow: "visible" }}>
        <InputBox />
      </div>
    </div>
  );
}
