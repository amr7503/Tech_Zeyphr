import { Link, useLocation } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const { isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("light");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/discover", label: "Discover Skills" },
    { path: "/projects", label: "Projects" },
    { path: "/credits", label: "Credits" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-lg" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30 -z-10" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">Urban Skill Exchange</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="glow">Sign Up</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;