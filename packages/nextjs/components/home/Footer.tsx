import Link from "next/link";

export const Footer = () => (
  <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
    <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between">
      <p className="text-xs text-muted-foreground">© 2023 MeowMeow Pad. All rights reserved.</p>
      <nav className="flex gap-4 sm:gap-6">
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Privacy
        </Link>
      </nav>
    </div>
  </footer>
);
