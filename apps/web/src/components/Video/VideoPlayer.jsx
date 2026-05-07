import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const VideoPlayer = ({ user, isCameraEnabled }) => {
  const ref = useRef();

  useEffect(() => {
    if (user.videoTrack) {
      user.videoTrack.play(ref.current);
    }
  }, [user.videoTrack, isCameraEnabled]);

  const containerSize = 300;

  return (
    <motion.div
      style={{ cursor: "grab" }}
      drag
      dragConstraints={{
        top: -containerSize,
        right: containerSize,
        bottom: containerSize,
        left: -containerSize,
      }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      dragElastic={0.56}
      whileTap={{ cursor: "grabbing" }}
      className="overflow-hidden"
    >
      <div
        className="rounded-[1rem] overflow-hidden md:h[12vw] lg:h-[11vw] lg:w-[16vw]"
        ref={ref}
      ></div>
    </motion.div>
  );
};