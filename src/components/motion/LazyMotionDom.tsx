"use client"; // Ensure this is a client component

import React from "react";
import { domAnimation, LazyMotion } from "framer-motion";

interface LazyMotionDomProps {
  children: React.ReactNode;
}

const LazyMotionDom: React.FC<LazyMotionDomProps> = ({ children }) => {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
};

export default LazyMotionDom;
