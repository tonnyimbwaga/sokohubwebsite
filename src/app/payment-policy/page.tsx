import React from "react";
import { FaMoneyBillWave, FaMobileAlt, FaShieldAlt, FaPhoneAlt } from "react-icons/fa";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
    title: "Payment Policy",
    description: `Learn about the secure payment methods accepted at SokoHub Kenya, including M-Pesa and Cash on Delivery.`,
    canonicalPath: "/payment-policy",
});

export default function PaymentPolicyPage() {
    return (
        <div className="main-layout py-12 md:py-24 bg-white">
            <div className="container px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="text-xs font-black tracking-[0.3em] text-primary uppercase bg-primary/5 px-4 py-2 rounded-full">Secure Commerce</span>
                    <h1 className="mt-6 text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Payment Policy</h1>
                    <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        At {siteConfig.name}, we prioritize secure and convenient transactions. We've optimized our systems to support Kenya's most reliable payment channels.
                    </p>
                </div>

                {/* Payment Methods Grid */}
                <div className="grid gap-8 md:grid-cols-2 mb-20">
                    <div className="group p-10 rounded-[3rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl mb-8 group-hover:rotate-12 transition-transform">
                            <FaMobileAlt />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">M-Pesa / Mobile Money</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Kenya's preferred payment method. We accept payments via Lipa na M-Pesa Buy Goods till or Direct Transfer.
                        </p>
                        <div className="bg-slate-900 p-6 rounded-2xl text-white">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 block">Payment Instructions</span>
                            <p className="text-sm font-medium leading-relaxed">
                                Please contact our support team to verify the current Till Number or paybill details before completing your order.
                            </p>
                        </div>
                    </div>

                    <div className="group p-10 rounded-[3rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl mb-8 group-hover:rotate-12 transition-transform">
                            <FaMoneyBillWave />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Cash on Delivery</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Experience the product before paying. Available for select locations to provide you with ultimate peace of mind.
                        </p>
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Nairobi Exclusive Service</span>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white mb-20 relative overflow-hidden">
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-black mb-6">Unmatched Transaction Security</h2>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                Your financial safety is our top priority. We utilize industry-standard encryption and secure mobile protocols to protect every shilling you spend with us.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800"></div>)}
                                </div>
                                <span className="text-xs text-slate-400 font-medium">Trusted by thousands of customers nationwide.</span>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
                            <div className="flex items-start gap-4 mb-6">
                                <FaShieldAlt className="text-primary text-3xl mt-1" />
                                <div>
                                    <h3 className="font-bold mb-1">Encrypted M-Pesa Links</h3>
                                    <p className="text-sm text-slate-400">Direct integration for instant payment verification.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <FaShieldAlt className="text-primary text-3xl mt-1" />
                                <div>
                                    <h3 className="font-bold mb-1">Safe Mobile Wallets</h3>
                                    <p className="text-sm text-slate-400">Your details are never stored on our local servers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                </div>

                {/* Confirmation & Support */}
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-slate-900">Payment Verification</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">
                            After making a payment via M-Pesa, please share your M-Pesa confirmation code with us via WhatsApp. This allows our warehouse team to prioritize your order and begin dispatch immediately.
                        </p>
                        <div className="h-1 w-20 bg-primary rounded-full"></div>
                    </div>
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-xl font-bold mb-6 text-slate-900">Payment Assistance</h3>
                        <div className="space-y-4">
                            <a href={`tel:${siteConfig.contact.phone}`} className="flex items-center gap-4 text-slate-700 hover:text-primary transition-colors">
                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary"><FaPhoneAlt /></div>
                                <span className="font-bold">{siteConfig.contact.phone}</span>
                            </a>
                            <p className="text-xs text-slate-400 mt-4 italic">
                                Our support team is available {siteConfig.contact.businessHours} to help with any checkout or billing issues.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
