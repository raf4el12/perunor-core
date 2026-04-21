import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: "2rem 2.25rem 3rem",
            maxWidth: "var(--content-max)",
            width: "100%",
            margin: "0 auto",
            animation: "fadeIn var(--dur-slow) var(--ease-smooth)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
