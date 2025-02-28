import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import localFont from "next/font/local";
import FacebookSDK from "./facebooksdk";
import "./globals.css";
import { Providers } from "./provider";
import { authOptions } from "./services/lib/auth";
import Header from "./ui/header/page";
// import { Toaster } from "@/components/ui/toaster"
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Post Targets",
  description: "Post Targets is a social media management tool that helps you manage your social media accounts.",
};

export default    function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
const session = getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <Providers  >
            <Header/>
              <FacebookSDK/>
                {children}
                <Toaster />
                <Toaster />
                </Providers>
      </body>
    </html>
  );
}
