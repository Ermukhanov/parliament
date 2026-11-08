import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AQL Council",
    template: "%s | AQL Council",
  },
  description: "AQL Council — Мектеп Президентінің ресми порталы | School President Official Portal",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

const splashScript = `try{if(sessionStorage.getItem('aql_splash_seen')==='1')document.documentElement.classList.add('splash-seen')}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
      </head>
      <body className="font-sans bg-[#ffffff] text-[#0f172a] antialiased">{children}</body>
    </html>
  );
}
