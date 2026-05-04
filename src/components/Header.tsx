
"use client";

import Link from "next/link";
import { Shirt, DraftingCompass } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Shirt className="h-8 w-8" />
          <span>Styla</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/questionnaire" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
            <DraftingCompass className="mr-2 h-4 w-4" /> Questionnaire
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
