"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaTimes, FaRegPaperPlane } from "react-icons/fa";
import { siteConfig } from "@/config/site";

export default function WhatsAppWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState("");

    const phoneNumber = siteConfig.contact.whatsapp || "254707874828";
    // Clean phone number for URL
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    useEffect(() => {
        // Show widget after a short delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleSendMessage = () => {
        const text = message.trim() || "Hi! I need help with an order.";
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        setMessage("");
        setIsOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-[#25D366] p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <FaWhatsapp className="text-3xl" />
                                <div>
                                    <h3 className="font-bold text-lg">Sokohub Chat</h3>
                                    <p className="text-xs opacity-90">Typically replies instanly</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="bg-[#E5DDD5] bg-opacity-30 p-4 h-64 flex flex-col gap-3 overflow-y-auto">
                            {/* Bot Message */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm self-start max-w-[80%] text-sm text-gray-800"
                            >
                                Hi there! 👋 <br />
                                Welcome to Sokohub Kenya. How can we help you today?
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm self-start max-w-[80%] text-sm text-gray-800"
                            >
                                You can order directly via WhatsApp!
                            </motion.div>
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white transition-all text-gray-900"
                                autoFocus
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-[#25D366] text-white p-2.5 rounded-full hover:bg-[#128C7E] transition-colors shadow-md flex items-center justify-center"
                            >
                                <FaRegPaperPlane className="text-sm translate-x-[-1px] translate-y-[1px]" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                className="pointer-events-auto bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <AnimatePresence>
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </AnimatePresence>

                {isOpen ? (
                    <FaTimes className="text-2xl" />
                ) : (
                    <FaWhatsapp className="text-3xl" />
                )}

                {/* Tooltip */}
                <AnimatePresence>
                    {isHovered && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.8 }}
                            className="absolute right-full mr-4 bg-white text-gray-800 px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap text-sm font-medium border border-gray-100"
                        >
                            Chat with us!
                            {/* Arrow */}
                            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white transform -translate-y-1/2 rotate-45 border-r border-t border-gray-100"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
