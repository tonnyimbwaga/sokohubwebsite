"use client";

import { FaRuler, FaChild, FaBaby } from "react-icons/fa";
import { motion } from "framer-motion";

export default function SizeGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold md:text-4xl"
      >
        Size Guide
      </motion.h1>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-gray-600">
          Finding the right size for your child's toys is crucial for both
          safety and enjoyment. Use our comprehensive size guide to ensure you
          choose age-appropriate and properly sized toys for your little ones.
        </p>
      </div>

      {/* Key Categories */}
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <FaBaby className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">
            Infant Toys (0-12 months)
          </h2>
          <p className="text-gray-600">
            Soft, lightweight toys with no small parts. Ideal for tiny hands and
            early development stages.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <FaChild className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">
            Toddler Toys (1-3 years)
          </h2>
          <p className="text-gray-600">
            Larger, sturdier toys that encourage exploration and basic motor
            skills development.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg bg-white p-6 shadow-md"
        >
          <FaRuler className="mb-4 text-4xl text-primary" />
          <h2 className="mb-3 text-xl font-semibold">
            Preschool & Up (3+ years)
          </h2>
          <p className="text-gray-600">
            More complex toys with appropriate sizing for developing fine motor
            skills.
          </p>
        </motion.div>
      </div>

      {/* Size Charts */}
      <div className="space-y-12">
        <section>
          <h2 className="mb-6 text-2xl font-semibold">
            Ride-On Toys Size Chart
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Age Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Height Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Weight Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Recommended Size
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">1-2 years</td>
                  <td className="whitespace-nowrap px-6 py-4">75-90 cm</td>
                  <td className="whitespace-nowrap px-6 py-4">Up to 20 kg</td>
                  <td className="whitespace-nowrap px-6 py-4">Small</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">2-3 years</td>
                  <td className="whitespace-nowrap px-6 py-4">85-100 cm</td>
                  <td className="whitespace-nowrap px-6 py-4">Up to 25 kg</td>
                  <td className="whitespace-nowrap px-6 py-4">Medium</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">3-5 years</td>
                  <td className="whitespace-nowrap px-6 py-4">95-115 cm</td>
                  <td className="whitespace-nowrap px-6 py-4">Up to 30 kg</td>
                  <td className="whitespace-nowrap px-6 py-4">Large</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">
            Building Blocks Size Guide
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Age Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Block Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Safety Features
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">6-12 months</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Extra Large (4+ cm)
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Soft, rounded edges
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">1-3 years</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Large (2-4 cm)
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Rounded corners
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">3+ years</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Standard (1-2 cm)
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Standard safety features
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Measuring Tips</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <ul className="list-inside list-disc space-y-3 text-gray-600">
              <li>
                Always measure your child's height and weight before purchasing
                size-specific toys
              </li>
              <li>Consider growth spurts when choosing adjustable toys</li>
              <li>Check weight limits carefully for ride-on toys</li>
              <li>
                When in doubt, choose a slightly larger size that your child can
                grow into
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Safety Note */}
      <div className="mt-12 rounded-lg bg-primary/5 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-primary">
          Safety First
        </h2>
        <p className="text-gray-600">
          Always supervise children during play and ensure toys are
          age-appropriate. When in doubt about sizing, please contact our
          customer service team for guidance. Remember that age recommendations
          are for safety and developmental appropriateness.
        </p>
      </div>
    </div>
  );
}
