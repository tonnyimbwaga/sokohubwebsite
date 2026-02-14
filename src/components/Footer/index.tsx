import { siteConfig } from "@/config/site";
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok, FaLock } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-600 border-t border-gray-200">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">About {siteConfig.name}</h2>
            <p className="mb-6 text-sm leading-relaxed">
              Sokohub is Kenya&apos;s premier destination for high-quality products. We are dedicated to providing excellence through a curated selection of home and lifestyle goods delivered with speed and care.
            </p>
            <div className="flex space-x-5">
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on TikTok"
              >
                <FaTiktok size={20} />
              </a>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">
              Quick Links
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm hover:text-primary transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm hover:text-primary transition-colors">
                  Latest Blog Posts
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-sm hover:text-primary transition-colors">
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Section */}
          <div>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">
              Customer Trust
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm hover:text-primary transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm hover:text-primary transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-sm hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">
              Secure Payments
            </h2>
            <p className="mb-4 text-sm leading-relaxed">
              Your security is our priority. We accept all major payment methods in Kenya.
            </p>
            <div className="flex flex-wrap gap-3 mb-6 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              {/* Payment Badges (Placeholder text/icons for common Kenyan/Global methods) */}
              <div className="h-8 w-12 bg-white rounded border border-gray-200 flex items-center justify-center font-bold text-[10px] text-green-600">M-PESA</div>
              <div className="h-8 w-12 bg-white rounded border border-gray-200 flex items-center justify-center font-bold text-[10px] text-blue-800">VISA</div>
              <div className="h-8 w-12 bg-white rounded border border-gray-200 flex items-center justify-center font-bold text-[10px] text-red-600">CARD</div>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <FaLock className="mr-2 text-green-500" />
              <span>SSL Secure & Encrypted</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Professional Retail Excellence in Kenya</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
