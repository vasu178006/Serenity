import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Music, MessageSquare, BookOpen, Settings, User, LogOut, Home, Wind } from 'lucide-react';

// Helper function to render icons safely
const renderIcon = (IconComponent, className) => {
  if (typeof IconComponent === 'string') {
    return IconComponent;
  }
  return React.createElement(IconComponent, { className });
};

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/zen', icon: Wind, label: 'Breathing' },
    { path: '/visual', icon: Moon, label: 'Mindset' },
    { path: '/music', icon: Music, label: 'Music' },
    { path: '/reframe', icon: MessageSquare, label: 'Journal' },
    { path: '/journal', icon: BookOpen, label: 'Articles' }
  ];

  return (
    <motion.div
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="sidebar-logo flex items-center space-x-3 px-4 py-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.span 
          className="text-3xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Moon className="w-8 h-8 text-pink-400" />
        </motion.span>
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          Serenity
        </motion.h1>
      </motion.div>
      
      <nav className="flex-1 py-8">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <motion.li 
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-white/20 text-white border-l-4 border-purple-400 shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <motion.span 
                  className="text-xl"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderIcon(item.icon, "w-5 h-5")}
                </motion.span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link 
            to="/settings" 
            className={`sidebar-nav-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              location.pathname === '/settings' 
                ? 'bg-white/20 text-white border-l-4 border-purple-400' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <motion.span 
              className="text-xl"
              whileHover={{ scale: 1.2, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Settings className="w-5 h-5" />
            </motion.span>
            <span className="font-medium">Settings</span>
          </Link>
        </motion.div>
        
        <motion.div 
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link 
            to="/profile" 
            className={`sidebar-nav-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              location.pathname === '/profile' 
                ? 'bg-white/20 text-white border-l-4 border-blue-400' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <motion.span 
              className="text-xl"
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.3 }}
            >
              <User className="w-5 h-5" />
            </motion.span>
            <span className="font-medium">Profile</span>
          </Link>
        </motion.div>
        
        <motion.div 
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <motion.button 
            onClick={onLogout}
            className="sidebar-nav-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full text-left border-none bg-transparent cursor-pointer"
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span 
              className="text-xl"
              whileHover={{ scale: 1.2, x: 3 }}
              transition={{ duration: 0.3 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.span>
            <span className="font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;