import { Providers } from "~/components/providers";
import "~/styles/globals.css";

export const metadata = {
  title: "BlueSky Follower Manager",
  description: "Manage your BlueSky followers efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background">
        <Providers>
          <main className="container mx-auto p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
