"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#F5F7FA] z-50 flex items-center justify-center"
    >
      <div className="flex flex-col items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Image
            src="/logo_votamatch.png"
            alt="Votamatch Perú 2026"
            width={150}
            height={75}
            className="mb-8"
          />
        </motion.div>

        {/* Spinner */}
        <div className="relative w-20 h-20 mb-8">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[#5B8FCB]/20"
          />
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#5B8FCB] border-r-[#5B8FCB]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner pulsing dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-[#5B8FCB] rounded-full" />
          </motion.div>
        </div>

        {/* Progress steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#5B8FCB]"
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
