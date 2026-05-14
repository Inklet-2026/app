import Header from "./components/Header";
import InputBox from "./components/InputBox";

export default function App() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      padding: "36px 16px 16px",
    }}>
      <Header />
      <div style={{ height: 12 }} />
      <InputBox />
    </div>
  );
}
