import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState("");
  const fullText = "HOGOLY0 INC";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(onComplete, 1500);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#130922] flex flex-col items-center justify-center z-50 scanlines">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 
          className="text-5xl md:text-7xl font-bold text-white glitch-text tracking-widest"
          data-text={text}
        >
          {text}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-4 text-[#20e0e0] font-mono text-sm uppercase tracking-widest cyber-text"
        >
          Initializing System...
        </motion.p>
      </motion.div>
    </div>
  );
}
