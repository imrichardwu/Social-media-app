import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, Users, Star, Server } from "lucide-react";
import { useCreatePost } from "../context/CreatePostContext";

export const Footer: React.FC = () => {
  const location = useLocation();
  const { openCreatePost } = useCreatePost();

  const navItems = [
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: PlusCircle, label: "Create", path: null, action: openCreatePost },
    { icon: Star, label: "Liked", path: "/liked" },
    { icon: Server, label: "Nodes", path: "/node-management" },
  ];

  const isActive = (path: string | null) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-dropdown glass-card-prominent border-t border-glass-prominent">
      <nav className="container mx-auto px-4">
        <ul className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            const content = (
              <motion.div
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  active
                    ? "text-[var(--primary-purple)]"
                    : "text-text-2 hover:text-text-1"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={active ? { y: [0, -2, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon size={22} />
                </motion.div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    className="absolute -bottom-1 w-6 h-0.5 rounded-full bg-[var(--primary-purple)] shadow-sm"
                    layoutId="footerIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            );

            if (item.path) {
              return (
                <li key={item.label}>
                  <Link to={item.path} className="relative">
                    {content}
                  </Link>
                </li>
              );
            } else {
              return (
                <li key={item.label}>
                  <button
                    onClick={() => item.action?.()}
                    className="relative"
                    aria-label={item.label}
                  >
                    {content}
                  </button>
                </li>
              );
            }
          })}
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
