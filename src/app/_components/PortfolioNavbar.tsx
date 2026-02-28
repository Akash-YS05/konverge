"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Github, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { authClient } from "@/server/better-auth/client";

const navigationLinks = [
  { name: "Features", href: "#features" },
  { name: "Rooms", href: "#rooms" },
  { name: "Pricing", href: "#pricing" },
  { name: "Docs", href: "#docs" },
];

export const PortfolioNavbar = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] =
    useState<Awaited<ReturnType<typeof authClient.getSession>>>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    setMounted(true);

    const fetchSession = async () => {
      const data = await authClient.getSession();
      setSession(data);
      setIsLoadingSession(false);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ✅ Handles ONLY anchor links
  const handleScrollLink = (href: string) => {
    closeMobileMenu();

    if (!href.startsWith("#")) return;

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleScrollLink("#home")}
            className="text-foreground hover:text-primary text-2xl font-bold transition-colors duration-200"
            style={{ fontFamily: "Figtree", fontWeight: 800 }}
          >
            DevRoom
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden items-baseline space-x-8 md:flex">
            {navigationLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleScrollLink(link.href)}
                className="text-foreground hover:text-primary group relative px-3 py-2 text-base font-medium transition-colors duration-200"
                style={{ fontFamily: "Figtree" }}
              >
                {link.name}
                <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"></div>
              </button>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-secondary rounded-md p-2 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="text-foreground h-5 w-5" />
              ) : (
                <Moon className="text-foreground h-5 w-5" />
              )}
            </button>

            {isLoadingSession ? (
              <div className="bg-secondary h-10 w-20 animate-pulse rounded-md" />
            ) : session?.user ? (
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#156d95] text-sm font-medium text-white">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await authClient.signOut();
                    router.push("/");
                    router.refresh();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-md bg-[#156d95] px-[18px] py-[15px] text-base leading-4 font-semibold whitespace-nowrap text-white shadow-sm transition-all duration-200 hover:bg-[#156d95]/90 hover:shadow-md"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Start Coding
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-foreground hover:text-primary rounded-md p-2 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background/95 border-border border-t backdrop-blur-md md:hidden"
          >
            <div className="space-y-4 px-6 py-6">
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleScrollLink(link.href)}
                  className="text-foreground hover:text-primary block w-full py-3 text-left text-lg font-medium transition-colors duration-200"
                  style={{ fontFamily: "Figtree" }}
                >
                  {link.name}
                </button>
              ))}

              <div className="border-border border-t pt-4">
                <Link
                  href="/rooms"
                  onClick={closeMobileMenu}
                  className="block w-full rounded-md px-[18px] py-[15px] text-base font-semibold text-white transition-all duration-200"
                  style={{
                    background: "#156d95",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Start Coding
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
