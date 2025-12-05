import React from "react";
import { motion } from "framer-motion";

const ModernLoader = () => (
  <div className="flex justify-center items-center h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
    />
  </div>
);

export default ModernLoader;
