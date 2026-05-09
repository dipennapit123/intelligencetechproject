"use client";

import { motion, AnimatePresence } from "framer-motion";

export function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence mode="wait">
      {message ? (
        <motion.p
          key={message}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
