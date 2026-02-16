import React from "react";
import { FaShieldAlt, FaGavel, FaRegListAlt, FaUserShield } from "react-icons/fa";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
    title: "Privacy Policy & Terms of Service",
    description: `Read the combined Privacy Policy and Terms of Service for ${siteConfig.name}. We are committed to protecting your data and providing clear terms for a smooth shopping experience.`,
    canonicalPath: "/privacy-and-terms",
});

export default function PrivacyAndTerms() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Privacy Policy & Terms of Service
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    At {siteConfig.name}, we value your trust. This document outlines our commitment to your privacy and the terms governing your relationship with our platform.
                </p>
            </div>

            {/* Quick Access Icons */}
            <div className="grid gap-6 md:grid-cols-4 mb-16">
                {[
                    { icon: <FaShieldAlt />, title: "Data Protection", desc: "Your personal info is safe with us." },
                    { icon: <FaGavel />, title: "Legal Agreement", desc: "Binding terms for all users." },
                    { icon: <FaUserShield />, title: "Secure Access", desc: "Authorized personnel only." },
                    { icon: <FaRegListAlt />, title: "Clear Rules", desc: "Transparent guidelines for shopping." }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <div className="text-primary text-3xl mb-4 flex justify-center">{item.icon}</div>
                        <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-16">
                {/* PRIVACY SECTION */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary text-2xl">
                            <FaShieldAlt />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Part I: Privacy Policy</h2>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-8">
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                            <h3 className="text-xl font-bold mb-4 text-slate-800">1. Information We Collect</h3>
                            <p className="text-gray-600 mb-4">
                                We collect information to provide better services to all our users. This includes:
                            </p>
                            <ul className="grid md:grid-cols-2 gap-4 list-none pl-0">
                                <li className="flex items-start gap-2 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="text-primary font-bold">●</span>
                                    <div>
                                        <strong className="block text-slate-800">Personal Details</strong>
                                        <span className="text-sm text-gray-500">Name, delivery address, and phone number for order fulfillment.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="text-primary font-bold">●</span>
                                    <div>
                                        <strong className="block text-slate-800">Payment Data</strong>
                                        <span className="text-sm text-gray-500">Transaction details processed through secure partners (M-Pesa, etc).</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="text-primary font-bold">●</span>
                                    <div>
                                        <strong className="block text-slate-800">Usage Information</strong>
                                        <span className="text-sm text-gray-500">Shopping history and product preferences to improve our catalog.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="text-primary font-bold">●</span>
                                    <div>
                                        <strong className="block text-slate-800">Communication</strong>
                                        <span className="text-sm text-gray-500">Correspondence files when you reach out for support.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-bold mb-4 text-slate-800">2. Data Usage and Security</h3>
                            <p className="text-gray-600 mb-4">
                                Your data is used strictly to process orders, communicate status, and improve our services. We implement:
                            </p>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                    <strong className="text-green-800 block mb-2 text-sm">Encryption</strong>
                                    <p className="text-xs text-green-700">SSL encryption for all web traffic and payment data.</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <strong className="text-blue-800 block mb-2 text-sm">Access Control</strong>
                                    <p className="text-xs text-blue-700">Data is restricted to authorized personnel only.</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <strong className="text-purple-800 block mb-2 text-sm">Regular Audits</strong>
                                    <p className="text-xs text-purple-700">Periodic security reviews of our infrastructure.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TERMS SECTION */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary text-2xl">
                            <FaGavel />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Part II: Terms of Service</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                            <h3 className="text-xl font-bold mb-6 text-slate-800">3. General Guidelines</h3>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    <strong>Eligibility:</strong> By using {siteConfig.name}, you confirm you are at least 18 years old or are using the site under adult supervision.
                                </p>
                                <p>
                                    <strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                                </p>
                                <p>
                                    <strong>Product Availability:</strong> All orders are subject to acceptance and availability. We reserve the right to refuse service to anyone at any time.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 text-slate-800">4. Orders and Payments</h3>
                                <ul className="space-y-3 text-sm text-gray-600 list-disc pl-5">
                                    <li>Prices are listed in {siteConfig.localization.currencyCode} ({siteConfig.localization.currency}).</li>
                                    <li>Payments via M-Pesa must be verified before dispatch.</li>
                                    <li>Cash on Delivery is only available for eligible Nairobi zones.</li>
                                    <li>Order cancellations are only possible before dispatch.</li>
                                </ul>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 text-slate-800">5. Intellectual Property</h3>
                                <p className="text-sm text-gray-600">
                                    All content, including graphics, text, and code, is the exclusive property of {siteConfig.name}. Unauthorized reproduction or redistribution is strictly prohibited and protected by Kenyan and International laws.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-primary p-8 md:p-12 rounded-[2rem] text-white overflow-hidden relative">
                    <div className="relative z-10 text-center">
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-widest">Questions about our policies?</h2>
                        <p className="mb-8 font-medium opacity-90 max-w-xl mx-auto">
                            Our legal and support teams are available to clarify any aspect of our privacy practices or terms.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="bg-white text-primary px-8 py-3 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform">
                                Call Us
                            </a>
                            <a href="/contact" className="bg-black/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-2xl font-black uppercase text-sm hover:bg-black/30 transition-all">
                                Support Center
                            </a>
                        </div>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </section>

                <div className="text-center text-sm text-gray-400">
                    Last updated: {currentDate} | {siteConfig.name} Legal Dept.
                </div>
            </div>
        </div>
    );
}
