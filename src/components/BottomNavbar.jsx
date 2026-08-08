// components/BottomNavbar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// 🔥 IMPORT ICON
import home from "../assets/home.png";
import wallet from "../assets/wallet.png";
import friend from "../assets/friend.png";
import hashrateIcon from "../assets/wallet.png"; // ⚡ ikon hashrate
import trophy from "../assets/wallet.png"; // 🏆 ikon leaderboard

export default function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState("/");

  useEffect(() => {
    setCurrentScreen(location.pathname);
  }, [location]);

  const navItems = [
    { path: "/", icon: home, label: "Beranda" },
    { path: "/wallet", icon: wallet, label: "Dompet" },
    { path: "/hashrate", icon: hashrateIcon, label: "Hashrate" },
    { path: "/referrals", icon: friend, label: "Referral" },
    { path: "/leaderboard", icon: trophy, label: "Peringkat" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      {/* 🔥 GLASSMORPHISM CONTAINER - DARK GRADIENT */}
      <motion.div
        className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3 }}
      >
        {/* 🔥 DECORATIVE GLOW */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="flex items-center justify-around py-2 px-1 relative">
          {navItems.map((item) => {
            const isActive = currentScreen === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center relative py-2 px-3"
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -2 }}
              >
                {/* 🔥 BACKGROUND AKTIF (FLOATING BUBBLE) */}
                {isActive && (
                  <motion.div
                    layoutId="activeBubble"
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                  />
                )}

                {/* 🔥 ICON CONTAINER */}
                <div className="relative">
                  {/* 🔥 GLOW PING ANIMATION */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-orange-500/30"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}

                  <motion.div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    animate={{
                      rotate: isActive ? [0, -5, 5, -5, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-7 h-7 transition-all duration-300"
                    />
                  </motion.div>

                  {/* 🔥 ACTIVE DOT */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full shadow-lg shadow-orange-500/50"
                    />
                  )}
                </div>

                {/* 🔥 LABEL */}
                <motion.span
                  className={`text-[10px] font-medium mt-1 transition-all duration-300 ${
                    isActive ? "text-orange-400" : "text-gray-400"
                  }`}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0,
                  }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}