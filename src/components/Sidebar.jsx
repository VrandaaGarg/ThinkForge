import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: "🏠",
      label: "Dashboard",
      path: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      icon: "🎯",
      label: "Learning Paths",
      path: "/learning-path",
      active: location.pathname.includes("learning-paths"),
    },
    {
      icon: "🗂️",
      label: "Flashcards",
      path: "/flashcards",
      active: location.pathname.includes("flashcards"),
    },
    {
      icon: "📝",
      label: "Quiz",
      path: "/quiz",
      active: location.pathname.includes("quiz"),
    },
    {
      icon: "📈",
      label: "Progress",
      path: "/progress",
      active: location.pathname.includes("progress"),
    },
    {
      icon: "⚙️",
      label: "Settings",
      path: "/settings",
      active: location.pathname.includes("settings"),
    },
    {
      icon: "💬",
      label: "AI Chat",
      path: "/chat",
      active: location.pathname === "/chat",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{
        x: isOpen ? 0 : -250,
        width: isOpen ? 256 : 0,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="h-screen bg-white border-r border-blue-100 fixed left-0 top-0 z-[998] overflow-hidden"
    >
      <div className="p-4 space-y-2 pt-20 min-w-[256px]">
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              handleNavigation(item.path);
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
              ${
                item.active
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-blue-50"
              }
              sm:px-4 sm:py-3`}
          >
            <span className="text-xl sm:text-2xl">{item.icon}</span>
            <span className="font-medium text-sm sm:text-base">
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;
