"use client";

import "@aws-amplify/ui-react/styles.css";
import "stream-chat-react/dist/css/v2/index.css";
import "./globals.css";

import Analytics from "components/Analytics";
import ConfigureAmplifyClientSide from "components/ConfigureAmplify";
import Provider from "components/Provider";
import { ClientProvider } from "contexts/ClientContext";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "FOMO.ai",
  description: "Large-scale, critical AI marketing services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      </head>
      <body className="bg-gray-100 overscroll-none">
        <ConfigureAmplifyClientSide>
          <ClientProvider>
            <Provider>{children}</Provider>
          </ClientProvider>
          <Analytics />
        </ConfigureAmplifyClientSide>
      </body>
    </html>
  );
}
