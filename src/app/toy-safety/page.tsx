"use client";

import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

export default function ToySafetyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold md:text-4xl"
      >
        Toy Safety Guide
      </motion.h1>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-gray-600">
          At Sokohub Kenya, your safety is our top priority. We
          carefully select and test all our products to ensure they meet or
          exceed international safety standards. This guide will help you
          understand our safety measures and provide tips for safe play.
        </p>
      </div>

      {/* Key Safety Features */}
      <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <FaShieldAlt className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Safety Standards</h2>
          <p className="text-gray-600">
            All our toys comply with international safety standards and
            regulations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <FaCheckCircle className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Quality Testing</h2>
          <p className="text-gray-600">
            Rigorous testing processes ensure durability and safety for intended
            age groups.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <FaExclamationTriangle className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Age Guidelines</h2>
          <p className="text-gray-600">
            Clear age recommendations to ensure appropriate toy selection.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <FaInfoCircle className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">Safety Information</h2>
          <p className="text-gray-600">
            Detailed safety instructions and guidelines included with every toy.
          </p>
        </motion.div>
      </div>

      {/* Safety Guidelines */}
      <div className="space-y-8">
        <section>
          <h2 className="mb-6 text-2xl font-semibold">
            Age-Appropriate Selection
          </h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="list-inside list-disc space-y-3 text-gray-600">
              <li>Always follow age recommendations on toy packaging</li>
              <li>Consider your child's developmental stage and abilities</li>
              <li>
                Be aware of small parts in toys for children under 3 years
              </li>
              <li>Check for sharp edges or potential hazards</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">Material Safety</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-green-700">
                Safe Materials We Use
              </h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600">
                <li>Non-toxic paints and dyes</li>
                <li>BPA-free plastics</li>
                <li>Natural wood with safe finishes</li>
                <li>Lead-free materials</li>
                <li>Phthalate-free materials</li>
              </ul>
            </div>
            <div className="rounded-lg bg-red-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-red-700">
                Materials We Avoid
              </h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600">
                <li>Toxic materials and chemicals</li>
                <li>Low-quality plastics</li>
                <li>Harmful dyes and paints</li>
                <li>Materials with sharp edges</li>
                <li>Easily breakable components</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">
            Safety Tips for Parents
          </h2>
          <div className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold">
                Regular Toy Maintenance
              </h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600">
                <li>Regularly inspect toys for damage or wear</li>
                <li>Clean toys according to instructions</li>
                <li>Replace damaged toys promptly</li>
                <li>Keep battery compartments secure</li>
              </ul>
            </div>

            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold">
                Safe Play Environment
              </h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600">
                <li>Ensure proper supervision during playtime</li>
                <li>Keep play areas clean and organized</li>
                <li>Store toys safely when not in use</li>
                <li>Separate toys by age group</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">
            Certification & Testing
          </h2>
          <div className="rounded-lg bg-primary/5 p-6">
            <p className="mb-4 text-gray-600">
              All our toys undergo rigorous testing and certification processes:
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-600">
              <li>Safety testing by certified laboratories</li>
              <li>
                Compliance with KEBS (Kenya Bureau of Standards) requirements
              </li>
              <li>International safety certifications where applicable</li>
              <li>Regular quality control inspections</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Emergency Information */}
      <div className="mt-12 rounded-lg bg-red-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-red-700">
          Emergency Information
        </h2>
        <p className="mb-4 text-gray-600">
          In case of any toy-related incidents or concerns:
        </p>
        <ul className="space-y-2 text-gray-600">
          <li>Emergency Contact: (254) 707 874 828</li>
          <li>Product Safety Hotline: (254) 707 874 828</li>
        </ul>
      </div>

    </div>
  );
}
