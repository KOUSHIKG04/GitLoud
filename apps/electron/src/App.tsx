import { useState } from "react";
import { Home, History, PlusCircle, Settings } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import "./App.css";
import TopBar from "./components/topBar";

type Tab = "home" | "generate" | "history" | "settings";

declare global {
  interface Window {
    gitloud?: {
      platform:
        | "aix"
        | "darwin"
        | "freebsd"
        | "linux"
        | "openbsd"
        | "sunos"
        | "win32"
        | "cygwin"
        | "netbsd";
      windowControls: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
    };
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <main className="app-shell">
      <TopBar />

      <section className="screen">
        {tab === "home" && <h1>Home</h1>}
        {tab === "generate" && <h1>Generate</h1>}
        {tab === "history" && <h1>History</h1>}
        {tab === "settings" && <h1>Settings</h1>}
      </section>

      <nav className="bottom-tabs">
        <Button
          variant="ghost"
          onClick={() => setTab("home")}
          className={tab === "home" ? "active" : ""}
        >
          <Home size={20} />
          Home
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTab("generate")}
          className={tab === "generate" ? "active" : ""}
        >
          <PlusCircle size={20} />
          Generate
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTab("history")}
          className={tab === "history" ? "active" : ""}
        >
          <History size={20} />
          History
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTab("settings")}
          className={tab === "settings" ? "active" : ""}
        >
          <Settings size={20} />
          Settings
        </Button>
      </nav>
    </main>
  );
}
