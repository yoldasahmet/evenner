import type { Metadata, Viewport } from "next";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evenner — Your agentic event planner",
  description:
    "Plan, organise and run events with an AI agent that learns what you need.",
};

// Mobile-first: lock the viewport to the device width.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5b21b6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
