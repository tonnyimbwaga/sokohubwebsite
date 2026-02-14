"use client";

import { motion } from "framer-motion";
import { FaHeart, FaStar, FaHandshake } from "react-icons/fa";
import { siteConfig } from "@/config/site";

export default function AboutClient() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Hero Section */}
            <div className="mb-16 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 text-4xl font-bold md:text-5xl"
                >
                    About {siteConfig.name}
                </motion.h1>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                    {siteConfig.description}
                </p>
            </div>

            {/* Our Story Section */}
            <section className="mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="mb-6 text-3xl font-bold text-center">About Us</h2>
                    <div className="space-y-4 text-gray-600">
                        <p>
                            Owned by Tonny Imbwaga, {siteConfig.name} was founded with a simple yet powerful vision: to provide quality products that bring
                            value and satisfaction to our customers while being accessible to families
                            across {siteConfig.localization.country}.
                        </p>
                        <p>
                            Our journey started with a dedication to reliability. What began as a
                            carefully curated collection has grown into a comprehensive range of products
                            that cater to our customers' diverse needs.
                        </p>
                        <p>
                            Today, {siteConfig.name} is a trusted destination for quality. Our
                            selection process ensures that each item meets
                            appropriate standards and contributes to your lifestyle journey.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Values Section */}
            <section className="mb-16">
                <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg bg-white p-6 text-center shadow-md"
                    >
                        <FaHeart className="mx-auto mb-4 text-4xl text-primary" />
                        <h3 className="mb-3 text-xl font-semibold">Quality & Care</h3>
                        <p className="text-gray-600">
                            We prioritize quality by selecting products
                            that provide value to our customers.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-lg bg-white p-6 text-center shadow-md"
                    >
                        <FaStar className="mx-auto mb-4 text-4xl text-primary" />
                        <h3 className="mb-3 text-xl font-semibold">Customer Value</h3>
                        <p className="text-gray-600">
                            Every item in our collection is chosen for its potential to
                            provide satisfaction to our customers.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-lg bg-white p-6 text-center shadow-md"
                    >
                        <FaHandshake className="mx-auto mb-4 text-4xl text-primary" />
                        <h3 className="mb-3 text-xl font-semibold">Reliability</h3>
                        <p className="text-gray-600">
                            We're committed to being a reliable partner for customers
                            across {siteConfig.localization.country}.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="mb-16 grid gap-8 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg bg-primary/5 p-8"
                >
                    <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
                    <p className="text-gray-600">
                        To provide quality products that bring joy
                        to daily life while ensuring accessibility and affordability for
                        customers across {siteConfig.localization.country}.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg bg-primary/5 p-8"
                >
                    <h2 className="mb-4 text-2xl font-bold">Our Vision</h2>
                    <p className="text-gray-600">
                        To be a trusted provider of quality products in {siteConfig.localization.country},
                        recognized for our commitment to reliability and the
                        evolving needs of our customers.
                    </p>
                </motion.div>
            </section>


            {/* Our Passion Section */}
            <section className="mb-16">
                <h2 className="mb-8 text-center text-3xl font-bold">Our Passion</h2>
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-xl shadow-md"
                    >
                        <p className="text-lg text-gray-600 mb-6">
                            At {siteConfig.name}, we believe that quality is essential for every
                            customer's satisfaction. Our passion drives us to carefully select
                            products that not only bring joy but also contribute to an improved lifestyle.
                        </p>
                        <p className="text-lg text-gray-600 mb-6">
                            We understand the importance of quality, safety, and value in every
                            product we offer. Our commitment to providing the best for our
                            customers in {siteConfig.localization.country} is what motivates us every day.
                        </p>
                        <p className="text-lg text-gray-600">
                            Through our carefully curated selection, we aim to support our customers
                            in creating meaningful experiences that enhance their lives every day.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Community Intent */}
            <section className="rounded-lg bg-gray-50 p-8">
                <h2 className="mb-6 text-center text-3xl font-bold">Our Commitment</h2>
                <div>
                    <p className="mb-4 text-gray-600">
                        At {siteConfig.name}, we are passionate about bringing quality and
                        value to our customers. We believe in the power of
                        excellence to inspire and improve daily life.
                    </p>
                    <ul className="list-inside list-disc space-y-3 text-gray-600">
                        <li>
                            Provide access to high-quality products for families
                            across {siteConfig.localization.country}
                        </li>
                        <li>
                            Support sustainable and ethical practices in everything we do
                        </li>
                        <li>Make premium resources more accessible to everyone</li>
                        <li>Promote the value of quality in everyday living</li>
                        <li>
                            Ensure every customer has access to safe, reliable, and high-quality items
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
