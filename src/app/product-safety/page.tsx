import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";
import {
    FaShieldAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
} from "react-icons/fa";

export const metadata = constructMetadata({
    title: "Product Safety Guide",
    description: `Learn about ${siteConfig.name} product safety commitment, testing processes, and standards.`,
});

export default function ProductSafetyPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="mb-8 text-3xl font-bold md:text-4xl">
                Product Safety Guide
            </h1>

            {/* Introduction */}
            <div className="mb-8">
                <p className="text-gray-600">
                    At {siteConfig.name}, your safety is our top priority. We
                    carefully select and test all our products to ensure they meet or
                    exceed international safety standards. This guide will help you
                    understand our safety measures and provide tips for safe usage.
                </p>
            </div>

            {/* Key Safety Features */}
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
                    <FaShieldAlt className="mb-4 text-4xl text-primary" />
                    <h2 className="mb-3 text-xl font-semibold">Safety Standards</h2>
                    <p className="text-gray-600">
                        All our products comply with international safety standards and
                        regulations.
                    </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
                    <FaCheckCircle className="mb-4 text-4xl text-primary" />
                    <h2 className="mb-3 text-xl font-semibold">Quality Testing</h2>
                    <p className="text-gray-600">
                        Rigorous testing processes ensure durability and safety for their intended use.
                    </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
                    <FaExclamationTriangle className="mb-4 text-4xl text-primary" />
                    <h2 className="mb-3 text-xl font-semibold">Usage Guidelines</h2>
                    <p className="text-gray-600">
                        Clear recommendations to ensure appropriate product selection and safe handling.
                    </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:-translate-y-1">
                    <FaInfoCircle className="mb-4 text-4xl text-primary" />
                    <h2 className="mb-3 text-xl font-semibold">Safety Information</h2>
                    <p className="text-gray-600">
                        Detailed safety instructions and guidelines included with every product.
                    </p>
                </div>
            </div>

            {/* Material Safety */}
            <div className="space-y-8">
                <section>
                    <h2 className="mb-6 text-2xl font-semibold">Material Safety</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg bg-green-50 p-6">
                            <h3 className="mb-4 text-lg font-semibold text-green-700">
                                Safe Materials We Prioritize
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600">
                                <li>Non-toxic paints and finishes</li>
                                <li>BPA-free components</li>
                                <li>Sustainable and natural materials</li>
                                <li>Lead-free testing and certification</li>
                                <li>Strict quality-controlled sourcing</li>
                            </ul>
                        </div>
                        <div className="rounded-lg bg-red-50 p-6">
                            <h3 className="mb-4 text-lg font-semibold text-red-700">
                                Materials We Avoid
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600">
                                <li>Toxic chemicals and harmful dyes</li>
                                <li>Low-quality, easily breakable materials</li>
                                <li>Sharp or unfinished components</li>
                                <li>Materials without clear safety certifications</li>
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
                            All our products undergo rigorous testing and certification processes:
                        </p>
                        <ul className="list-inside list-disc space-y-2 text-gray-600">
                            <li>Safety testing by certified laboratories</li>
                            <li>Compliance with {siteConfig.localization.country} Bureau of Standards requirements</li>
                            <li>International safety certifications where applicable</li>
                            <li>Regular quality control inspections</li>
                        </ul>
                    </div>
                </section>
            </div>

            {/* Help Information */}
            <div className="mt-12 rounded-lg bg-gray-50 p-6">
                <h2 className="mb-4 text-2xl font-semibold">
                    Need Safety Information?
                </h2>
                <p className="mb-4 text-gray-600">
                    In case of any product-related safety concerns or queries:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>Support Email: {siteConfig.contact.email}</li>
                    <li>Customer Service: {siteConfig.contact.phone}</li>
                </ul>
            </div>
        </div>
    );
}
