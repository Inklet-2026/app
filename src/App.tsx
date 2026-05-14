import Header from "./components/Header";
import InputBox from "./components/InputBox";

export default function App() {
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
      <div style={{ padding: "0px 12px 2px", overflow: "visible" }}>
        <InputBox />
      </div>
    </div>
  );
}
