import React from "react";

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

export default GlassCard;
