import "./globals.css";
import { StoreProvider } from "@/components/StoreContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: {
    default: "Olive & Dreams | Premium Ready-To-Wear Nigerian Fashion",
    template: "%s | Olive & Dreams",
  },
  description: "A sophisticated Nigerian women's fashion boutique. Discover our ready-to-wear dresses and tops from our debut collection, 'Do me nice, do me jeje'. Many good things.",
  keywords: ["Nigerian Fashion", "Ready-to-Wear", "Olive and Dreams", "Nigerian Women's Clothing", "Dresses", "Tops", "Abuja Fashion"],
  openGraph: {
    title: "Olive & Dreams | Premium Ready-To-Wear",
    description: "Discover 'Do me nice, do me jeje' — premium, elegant silhouettes handcrafted in Nigeria.",
    url: "https://oliveanddreams.com",
    siteName: "Olive & Dreams",
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-brand-cream text-brand-charcoal">
        <StoreProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
