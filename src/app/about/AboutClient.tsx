"use client";

import { motion } from "framer-motion";
import { FaHeart, FaStar, FaHandshake, FaBullseye, FaLightbulb } from "react-icons/fa";
import { siteConfig } from "@/config/site";

export default function AboutClient() {
    return (
        <div className="main-layout bg-white py-12 md:py-24">
            {/* Hero Section */}
            <div className="container px-4 max-w-6xl mb-24">
                <div className="text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-black tracking-[0.3em] text-primary uppercase bg-primary/5 px-4 py-2 rounded-full mb-8 inline-block"
                    >
                        Our Journey
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-5xl md:text-7xl font-black text-slate-900 tracking-tight"
                    >
                        About {siteConfig.name}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed"
                    >
                        More than just a store. We are a team dedicated to redefining the shopping landscape in {siteConfig.localization.country} through quality, trust, and excellence.
                    </motion.p>
                </div>
            </div>

            {/* Founders & Story */}
            <div className="container px-4 max-w-6xl mb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative z-10">
                            <h2 className="text-3xl font-black mb-8 tracking-tight">Our Story</h2>
                            <div className="space-y-6 text-slate-400 leading-relaxed font-medium">
                                <p>
                                    Founded by <span className="text-white font-bold">Tonny Blair Imbwaga</span>, {siteConfig.name} was born from a simple realization: high-quality lifestyle products shouldn't be a luxury of the few.
                                </p>
                                <p>
                                    What started as a small, curated collection in Nairobi has evolved into {siteConfig.localization.country}'s premier digital destination for quality goods. We've spent years building a supply chain that prioritizes reliability over shortcuts.
                                </p>
                                <p>
                                    Today, we serve thousands of satisfied customers, bringing value and smiles to homes across the nation with a commitment that never wavers.
                                </p>
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-6 -right-6 w-full h-full bg-primary rounded-[3rem] -z-10"></div>
                    </div>
                    <div>
                        <div className="space-y-12">
                            <div className="flex gap-6">
                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl flex-shrink-0">
                                    <FaLightbulb />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                                    <p className="text-slate-600 leading-relaxed">To be the most trusted and customer-centric lifestyle brand in {siteConfig.localization.country}, setting gold standards in delivery and quality.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl flex-shrink-0">
                                    <FaBullseye />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                                    <p className="text-slate-600 leading-relaxed">To deliver premium products with unmatched speed while ensuring accessibility and transparency in every transaction.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-slate-50 py-24 mb-24">
                <div className="container px-4 max-w-6xl">
                    <h2 className="text-center text-4xl font-black text-slate-900 mb-16 tracking-tight">Core Values</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            { icon: <FaHeart />, title: "Quality & Care", desc: "We handpick every item, ensuring it reflects the high standards our customers deserve." },
                            { icon: <FaStar />, title: "Customer Value", desc: "Fair pricing and genuine value are at the heart of every decision we make." },
                            { icon: <FaHandshake />, title: "Integrity", desc: "Honesty in operations and transparency in delivery are our non-negotiables." }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center hover:shadow-xl transition-shadow"
                            >
                                <div className="text-4xl text-primary mb-6 flex justify-center">{value.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final Commitment */}
            <div className="container px-4 max-w-4xl text-center">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Our Commitment to You</h2>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                    {[
                        "Premium Quality Assurance",
                        "24-Hour Return Window",
                        "Fastest Delivery in Nairobi",
                        "Secure M-Pesa Integration",
                        "Verified Business Location",
                        "Dedicated Customer Support"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            <span className="font-bold text-slate-700 text-sm">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
