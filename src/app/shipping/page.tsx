import { constructMetadata } from "@/utils/seo";
import { siteConfig } from "@/config/site";
import { FaTruck, FaMapMarkerAlt, FaClock, FaShieldAlt } from "react-icons/fa";

export const metadata = constructMetadata({
  title: "Shipping Information",
  description: `Learn about ${siteConfig.name} shipping policies, delivery times, and costs. We offer reliable delivery services across ${siteConfig.localization.country}.`,
});

export default function ShippingPage() {
  const shippingInfo = [
    {
      icon: <FaTruck className="h-8 w-8 text-primary" />,
      title: "Nationwide Delivery",
      description: `Reliable delivery across ${siteConfig.localization.country} for all our products.`,
    },
    {
      icon: <FaMapMarkerAlt className="h-8 w-8 text-primary" />,
      title: "Delivery Areas",
      description: `We deliver across ${siteConfig.localization.country} to all major towns and cities.`,
    },
    {
      icon: <FaClock className="h-8 w-8 text-primary" />,
      title: "Fast Delivery",
      description: "Quick and efficient delivery service to get your orders to you promptly.",
    },
    {
      icon: <FaShieldAlt className="h-8 w-8 text-primary" />,
      title: "Safe Handling",
      description: "All items are carefully packed to ensure they arrive in perfect condition.",
    },
  ];

  const deliveryRates = [
    {
      area: "Nairobi Area",
      time: "Within 3 Hours",
      cost: `${siteConfig.localization.currency} 400`
    },
    {
      area: "Outside Nairobi (Countrywide)",
      time: "Within 24 Hours",
      cost: `${siteConfig.localization.currency} 400`
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="mb-6 text-4xl font-bold">Shipping Information</h1>
          <p className="mb-12 text-lg text-gray-600">
            At {siteConfig.name}, we provide reliable shipping services. We ship countrywide to ensure your orders reach you wherever you are.
          </p>

          {/* Shipping Features */}
          <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {shippingInfo.map((info, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1"
              >
                <div className="mb-4">{info.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{info.title}</h3>
                <p className="text-gray-600">{info.description}</p>
              </div>
            ))}
          </div>

          {/* Delivery Rates Table */}
          <div className="mb-16">
            <h2 className="mb-6 text-2xl font-bold">Delivery Rates</h2>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full bg-white">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4 text-left font-semibold">
                      Delivery Area
                    </th>
                    <th className="p-4 text-left font-semibold">
                      Estimated Time
                    </th>
                    <th className="p-4 text-left font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryRates.map((rate, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">Shipping within Nairobi</td>
                      <td className="p-4">{rate.time}</td>
                      <td className="p-4">{rate.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Information */}
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Important Information</h2>
            <ul className="list-inside list-disc space-y-3 text-gray-600">
              <li>
                We ship countrywide using trusted courier services to ensure reliable and safe delivery.
              </li>
              <li>
                Orders are processed and shipped Monday through Friday,
                excluding public holidays.
              </li>
              <li>
                You will receive updates once your order has been
                dispatched.
              </li>
              <li>
                Delivery times may be affected during peak seasons or adverse
                weather conditions.
              </li>
              <li>
                Standard delivery rates apply to all locations within {siteConfig.localization.country}.
              </li>
            </ul>
          </div>


          <div className="mt-12 rounded-lg bg-primary/5 p-8">
            <h2 className="mb-4 text-2xl font-bold">Need Help?</h2>
            <p className="mb-4">
              For any shipping-related queries or to track your order, please
              contact our customer service team:
            </p>
            <ul className="space-y-2">
              <li>Phone: {siteConfig.contact.phone}</li>
              {siteConfig.contact.businessHours && (
                <li>Business Hours: {siteConfig.contact.businessHours}</li>
              )}
            </ul>

          </div>
        </div>
      </div>
    </div>
  );
}
