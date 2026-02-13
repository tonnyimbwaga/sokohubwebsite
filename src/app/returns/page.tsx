import { constructMetadata } from "@/utils/seo";
import { siteConfig } from "@/config/site";
import {
  FaExchangeAlt,
  FaBoxOpen,
  FaRegClock,
  FaShieldAlt,
} from "react-icons/fa";

export const metadata = constructMetadata({
  title: "Returns & Exchanges Policy",
  description: `Review ${siteConfig.name} official returns and exchanges policy. Returns accepted only for unused items reported within our specified conditions.`,
});

export default function ReturnsPage() {
  const returnFeatures = [
    {
      icon: <FaExchangeAlt className="h-8 w-8 text-primary" />,
      title: "Return Policy",
      description:
        "Returns accepted for unused items in original condition within our specified timeframe.",
    },
    {
      icon: <FaBoxOpen className="h-8 w-8 text-primary" />,
      title: "Exchange Options",
      description:
        "Eligible returns may be exchanged for similar items, subject to availability.",
    },
    {
      icon: <FaRegClock className="h-8 w-8 text-primary" />,
      title: "Return Process",
      description:
        "Contact us to initiate returns. Return shipping costs are typical responsibility of the customer.",
    },
    {
      icon: <FaShieldAlt className="h-8 w-8 text-primary" />,
      title: "Item Condition",
      description:
        "Items must be unused, in original condition, and with all packaging and accessories.",
    },
  ];

  const returnSteps = [
    {
      title: "Contact Us",
      description:
        "Notify our customer service team about your return request within the specified timeframe.",
    },
    {
      title: "Prepare Item for Return",
      description:
        "Ensure the item is unused, in its original packaging, and includes all accessories.",
    },
    {
      title: "Arrange Shipping",
      description:
        "Coordinate with our team on how to get the item back to us safely.",
    },
    {
      title: "Processing",
      description:
        "Upon receipt and inspection, we will process your exchange or refund according to our policy.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="mb-6 text-4xl font-bold">
            Returns & Exchanges Policy
          </h1>
          <p className="mb-12 text-lg text-gray-600">
            We want to ensure you're completely satisfied with your purchase from {siteConfig.name}. If
            you're not happy with your order, we've outlined our returns and
            exchanges policy below.
          </p>

          {/* Return Features */}
          <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {returnFeatures.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Return Process */}
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold">How to Return an Item</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {returnSteps.map((step, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <div className="mb-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Return Policy Details */}
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">
              Return & Exchange Policy Details
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Eligibility for Returns
                </h3>
                <p className="text-gray-600">
                  Returns or exchanges are strictly accepted only for items that are defective, malfunctioning, or if the wrong item was delivered. Please contact us within 24 hours of delivery
                  to initiate a return request. Items must be in the same
                  condition as received and in their original packaging with
                  all accessories.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Exchanges</h3>
                <p className="text-gray-600">
                  If your return is approved due to a defect, malfunction, or error on our part, you may exchange the item for a
                  replacement, subject to availability.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">Refunds</h3>
                <p className="text-gray-600">
                  Refunds are only processed if a replacement for a defective, malfunctioning, or wrong item is unavailable. Refunds are made to the original payment method after inspection.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Shipping Cost
                </h3>
                <p className="text-gray-600">
                  Customers are responsible for return shipping costs unless the
                  item received was damaged or incorrect.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Contact</h3>
                <p className="text-gray-600">
                  To initiate a return or exchange, please contact our customer
                  service team via our provided contact channels.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
