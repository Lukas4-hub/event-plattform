import "./globals.css";
import Navbar from "../components/Navbar";
import AppSessionProvider from "../components/SessionProvider";

export const metadata = {
  title: "Event Platform",
  description: "Full stack app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AppSessionProvider>
          <Navbar />
          {children}
        </AppSessionProvider>
      </body>
    </html>
  );
}
