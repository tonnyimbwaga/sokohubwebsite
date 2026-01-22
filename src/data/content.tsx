import { FiMail, FiPhone } from "react-icons/fi";
import { siteConfig } from "../config/site";
// No data here anymore - this file is a placeholder for dynamic data.
// Static data is now generated in public/api/products and public/data/homepage.json

import type { BlogType, NavItemType, Product } from "./types";

export const topNavLinks: NavItemType[] = [
  {
    id: "ee46t",
    name: "Home",
    href: "/home",
  },
  {
    id: "eerrrt",
    name: "Blog",
    href: "/blog",
  },
  {
    id: "eexct",
    name: "Collections",
    href: "/products",
  },
  {
    id: "h6ii8g",
    name: "Contact",
    href: "/contact",
  },
  {
    id: "h678ty",
    name: "FAQ",
    href: "/faqs",
  },
  {
    id: "h6i78g",
    name: "Checkout",
    href: "/checkout",
  },
  {
    id: "f678ty",
    name: "Cart",
    href: "/cart",
  },
];

export const NavLinks: NavItemType[] = [
  {
    id: "ee46t",
    name: "Home",
    href: "/home",
  },
  {
    id: "eerrrt",
    name: "Blog",
    href: "/blog",
  },
  {
    id: "eexct",
    name: "Collection",
    href: "/products",
  },

  {
    id: "h6ii8g",
    name: "Contact",
    href: "/contact",
  },
  {
    id: "h678ty",
    name: "FAQ",
    href: "/faqs",
  },
  {
    id: "h6i78g",
    name: "Checkout",
    href: "/checkout",
  },
  {
    id: "f678ty",
    name: "Cart",
    href: "/cart",
  },
];

// TODO: Replace with actual product images
const placeholder = "/images/placeholder.png";

export const categories: any[] = [];
export const products: Product[] = [];
export const featuredProducts: Product[] = [];
export const newArrivals: Product[] = [];
export const trendingProducts: Product[] = [];

export const headerSection = {
  title: `Welcome to ${siteConfig.name}`,
  heading: "Quality Products for You",
  description:
    siteConfig.description,
  image: "/images/homepage/hero-placeholder.png",
};

export const featuredSection = {
  title: "Featured Products",
  description: "Hand-picked favorites for your little ones",
};

export const newArrivalsSection = {
  title: "New Arrivals",
  description: "Just landed and ready for play",
};

export const trendingSection = {
  title: "Trending Now",
  description: "See what other parents are loving",
};

export const seoConfig = siteConfig.seo;

export const productsCollection = {
  heading: "Products Collection",
  description:
    "Explore our wide range of quality products curated for your needs.",
};

const demoBlogData = {
  sectionOne: {
    title: "What cleaning products are safe for different product materials?",
    paragraph1:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    points: [
      "Pretium nibh ipsum consequat nisl vel pretium. Sed vulputate mi sit",
      "Tristique nulla aliquet enim tortor at auctor urna. Sit amet aliquam id diam maer  dolore eu fugiat nulla pariatur",
      "Nam libero justo laoreet sit amet. Lacus sed viverra tellus in hac",
      "Tempus imperdiet nulla malesuada pellentesque elit eget gravida cum sociis",
    ],
    paragraph2:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
  sectionTwo: {
    title: "Can you provide a step-by-step guide to maintaining your products?",
    description:
      "Augue lacus viverra vitae congue eu consequat ac felis donec. Pellentesque pulvinar pellentesque habitant morbi tristique senectus. Morbi tristique senectus et netus et malesuada fames ac turpis. Iaculis eu non diam phasellus vestibulum lorem sed.",
    midImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  sectionThree: {
    title: "How do I prevent and remove stains from my products?",
    description:
      "Augue lacus viverra vitae congue eu consequat ac felis donec. Pellentesque pulvinar pellentesque habitant morbi tristique senectus. Morbi tristique senectus et netus et malesuada fames ac turpis. Iaculis eu non diam phasellus vestibulum lorem sed.",
  },
  sectionFour: {
    title:
      "What are the best practices for storing products without causing damage?",
    description:
      "Bibendum at varius vel pharetra vel turpis nunc. Dictumst quisque sagittis purus sit amet volutpat consequat mauris nunc. Volutpat est velit egestas dui id ornare.",
    points: [
      "Pretium nibh ipsum consequat nisl vel pretium. Sed vulputate mi sit",
      "Tristique nulla aliquet enim tortor at auctor urna. Sit amet aliquam id diam maer  dolore eu fugiat nulla pariatur",
      "Nam libero justo laoreet sit amet. Lacus sed viverra tellus in hac",
      "Tempus imperdiet nulla malesuada pellentesque elit eget gravida cum sociis",
    ],
  },
  quote:
    "“Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dolor porta rhoncus, viverra sit et auctor. Augue in volutpat sed eget in etiam.”",
  sectionFive: [
    {
      title: "How should I store my products to maintain their quality?",
      description:
        "Tincidunt nunc pulvinar sapien et ligula. Sed blandit libero volutpat sed cras ornare arcu dui vivamus. Aliquet bibendum enim facilisis gravida neque convallis a cras. Molestie nunc non blandit massa enim nec dui nunc.",
    },
    {
      title:
        "What special care should be taken to extend the lifespan of your products?",
      description:
        "Tincidunt nunc pulvinar sapien et ligula. Sed blandit libero volutpat sed cras ornare arcu dui vivamus. Aliquet bibendum enim facilisis gravida neque convallis a cras. Molestie nunc non blandit massa enim nec dui nunc.",
    },
  ],
};

export const blogs: BlogType[] = [
  {
    title: "Understanding Product Maintenance: A Historical Perspective",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "Style",
    slug: "understanding-product-maintenance-a-historical-perspective",
  },
  {
    title: "Top 10 Product Trends to Watch in 2024",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1448387473223-5c37445527e7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "Fitting",
    slug: "top-10-product-trends-to-watch-in-2024",
  },
  {
    title: "How to Clean and Maintain Your Product Collection",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1469395446868-fb6a048d5ca3?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "Style",
    slug: "how-to-clean-and-maintain-your-product-collection",
  },
  {
    title:
      "The Influence of Brand Collaborations: From Ideas to Creation",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1659614404055-670edff49a1b?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "General",
    slug: "the-influence-of-brand-collaborations-from-ideas-to-creation",
  },
  {
    title: "Product Sizing Guide: Finding the Perfect Fit",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1515396800500-75d7b90b3b94?q=80&w=1492&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "Style",
    slug: "product-sizing-guide-finding-the-perfect-fit",
  },
  {
    title:
      "Product Collecting 101: Building and Organizing Your Collection",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1556637640-2c80d3201be8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "Fitting",
    slug: "product-collecting-101-building-and-organizing-your-collection",
  },
  {
    title: "Behind the Design: Product Production Process Unveiled",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "General",
    slug: "behind-the-design-product-production-process-unveiled",
  },
  {
    title:
      "Exploring Limited Edition Drops: How to Secure Exclusive Releases",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "General",
    slug: "exploring-limited-edition-drops-how-to-secure-exclusive-releases",
  },
  {
    title: "Product Spotlight: Best Features and Styling Tips",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1421&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "Style",
    slug: "product-spotlight-best-features-and-styling-tips",
  },
  {
    title: "Sustainable Product Choices: Eco-Friendly Options in the Market",
    brief:
      "Lorem ipsum dolor sit amet, lormol amenrtol consectetur adipiscing elit, sed do eiusmod tempor.",
    date: "October 2, 2022",
    coverImage:
      "https://images.unsplash.com/flagged/photo-1552346154-21d32810aba3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    blogData: demoBlogData,
    tag: "Style",
    slug: "sustainable-product-choices-eco-friendly-options-in-the-market",
  },
];

export const siteConfigData = siteConfig.seo;

export const footerBannerData = {
  heading: `UPGRADE YOUR LIFESTYLE WITH ${siteConfig.shortName.toUpperCase()}`,
  description:
    "Explore our latest collections and find the best deals on quality products. Shop now and experience the difference.",
};

export const footerData = {
  description:
    `${siteConfig.name} is your trusted destination for quality products. We believe in bringing value and satisfaction to our customers through carefully curated items that inspire and improve your lifestyle.`,
  footerLinks: [
    {
      title: "Shop Categories",
      links: [
        { href: "/products", name: "Shop All" },
        { href: "/products?category=featured", name: "Featured" },
        { href: "/products?category=new", name: "New Arrivals" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { href: "/shipping", name: "Shipping Information" },
        { href: "/returns", name: "Returns & Exchanges" },
        { href: "/warranty", name: "Warranty" },
        { href: "/faqs", name: "FAQs" },
      ],
    },
    {
      title: "About Us",
      links: [
        { href: "/about", name: "Our Story" },
        { href: "/product-safety", name: "Product Safety" },
        { href: "/blog", name: "Blog" },
        { href: "/contact", name: "Contact Us" },
        { href: "/careers", name: "Careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy-policy", name: "Privacy Policy" },
        { href: "/terms-and-conditions", name: "Terms & Conditions" },
        { href: "/cookie-policy", name: "Cookie Policy" },
      ],
    },
  ],
};

export const newsletter = {
  heading: `Join the ${siteConfig.name} Family!`,
  description:
    "Subscribe to receive updates on new arrivals, special offers, and expert tips delivered straight to your inbox.",
};

// Legacy shoe data removed. Store now uses dynamic categories.

export const note =
  " Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vitae, est eum magnam doloremque, at adipisci debitis, similique dolores ipsa unde necessitatibus vero quibusdam nostrum numquam!";

export const contactSection = {
  heading: "Get in Touch",
  description:
    "Have a question or need assistance? We're here to help! Reach out to our friendly team for personalized support.",
  directContactInfoHeader: {
    heading: "Prefer to reach out directly?",
    description:
      "Choose the best way to connect with us. Our team is ready to assist you with any inquiries about our store, orders, or general questions.",
  },
  directContactInfo: [
    {
      icon: <FiMail className="text-5xl" />,
      title: "Email Us",
      description:
        "Get in touch with our team for any inquiries or support. We typically respond within 24 hours.",
      contactLink: {
        href: `mailto:${siteConfig.contact.email}`,
        title: siteConfig.contact.email,
      },
    },
    {
      icon: <FiMail className="text-5xl" />,
      title: "Alternative Email",
      description:
        "You can also reach us at our alternative email address for any inquiries.",
      contactLink: {
        href: `mailto:${siteConfig.contact.alternativeEmail}`,
        title: siteConfig.contact.alternativeEmail,
      },
    },
    {
      icon: <FiPhone className="text-5xl" />,
      title: "Call Us",
      description:
        "Speak directly to our team for immediate assistance during business hours (Mon-Fri, 9 AM - 5 PM EAT).",
      contactLink: {
        href: `tel:${siteConfig.contact.phone}`,
        title: siteConfig.contact.phone,
      },
    },
  ],
  instagramPhotos: [
    "/images/social/play1.jpg",
    "/images/social/play2.jpg",
    "/images/social/play3.jpg",
    "/images/social/play4.jpg",
    "/images/social/play5.jpg",
  ],
};

export const faqsData = {
  heading: "Frequently Asked Questions",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget adipiscing nibh nunc. Velit rhoncus arcu velesaed.",
  faqs: [
    {
      category: "Shipping",
      data: [
        {
          question: "How can I track my order?",
          answer:
            "You can track your order by logging into your account and checking the order status. Additionally, a tracking number will be provided in the shipping confirmation email.",
        },
        {
          question: "What is the estimated delivery time for my order?",
          answer:
            "Delivery times vary based on your location. Typically, domestic orders take 3-5 business days, while international orders may take 7-14 business days.",
        },
        {
          question: "Can I change my shipping address after placing an order?",
          answer:
            "Unfortunately, we cannot change the shipping address once the order is placed. Please double-check your information before completing the purchase.",
        },
        {
          question: "Do you offer expedited shipping options?",
          answer:
            "Yes, we offer expedited shipping at an additional cost. You can choose your preferred shipping method during the checkout process.",
        },
        {
          question: "What should I do if my order is delayed or lost?",
          answer:
            "If your order is significantly delayed or lost, please contact our customer support team, and we will investigate the issue.",
        },
      ],
    },
    {
      category: "Products",
      data: [
        {
          question: "How do I determine the right size for my products?",
          answer:
            "Refer to our size chart available on the product page. It provides measurements and guidelines to help you choose the correct size.",
        },
        {
          question: "Are your products authentic?",
          answer:
            "Yes, we guarantee the authenticity of all our products. We source them directly from authorized retailers and reputable suppliers.",
        },
        {
          question: "Can I return or exchange my products if they don't fit?",
          answer:
            "Yes, we have a hassle-free return policy. You can return or exchange unworn products within 30 days of receiving your order.",
        },
        {
          question: "Are the colors of the products accurate in the photos?",
          answer:
            "We strive to provide accurate color representation, but slight variations may occur due to monitor settings. Refer to product descriptions for additional details.",
        },
        {
          question: "Do you restock sold-out products?",
          answer:
            "We restock popular styles based on demand. You can sign up for notifications to be informed when a specific product is back in stock.",
        },
      ],
    },
    {
      category: "Payments",
      data: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept major credit cards, PayPal, and other secure payment methods. You can view the full list during the checkout process.",
        },
        {
          question: "How can I apply a discount code to my order?",
          answer:
            "Enter your discount code in the designated field during checkout. The discount will be applied to your total before payment.",
        },
        {
          question: "Can I modify or cancel my order after payment?",
          answer:
            "Once an order is placed, it cannot be modified or canceled. Please review your order carefully before completing the purchase.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Yes, we use industry-standard encryption to secure your payment information. Your data is protected and never stored on our servers.",
        },
        {
          question: "Do you offer gift cards?",
          answer:
            "Yes, we offer gift cards of various denominations. They make great presents for our customers!",
        },
      ],
    },
    {
      category: "Returns",
      data: [
        {
          question: "How do I initiate a return or exchange?",
          answer:
            'Visit the "Returns & Exchanges" page on our website, follow the instructions, and submit a request. Our team will guide you through the process.',
        },
        {
          question: "What is your return policy for defective products?",
          answer:
            "If you receive a defective product, please contact our customer support within 7 days of receiving the order. We will arrange a replacement or refund.",
        },
        {
          question: "Are there any restocking fees for returns?",
          answer:
            "We do not charge restocking fees for returns. However, please review our return policy for specific details.",
        },
        {
          question: "How long does it take to process a refund?",
          answer:
            "Refunds are typically processed within 5-7 business days after we receive the returned items and verify their condition.",
        },
        {
          question: "Can I return products if I've used them?",
          answer:
            "We only accept returns for unused products. Please ensure the item is in its original condition before returning.",
        },
      ],
    },
  ],
};
