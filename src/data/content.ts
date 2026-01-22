export const newArrivalsSection = {
  title: "New Arrivals",
  description: "Check out our latest toys and games",
};

export const trendingSection = {
  title: "Trending Now",
  description: "Most popular toys this season",
};

export const bestDealsSection = {
  title: "Best Deals",
  description: "Great savings on selected toys",
};

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: "educational",
    name: "Educational Toys",
    description: "Learn through play",
    image: "/images/categories/educational.jpg",
  },
  {
    id: "outdoor",
    name: "Outdoor Play",
    description: "Fun in the sun",
    image: "/images/categories/outdoor.jpg",
  },
  {
    id: "creative",
    name: "Arts & Crafts",
    description: "Spark creativity",
    image: "/images/categories/creative.jpg",
  },
];
export const headerSection = {
  title: "Premium Toys for Kids",
  heading: "Quality & Fun in Every Box",
  description: "Discover a wide range of educational and creative toys for children of all ages.",
  image: "/images/hero/hero-kids.jpg",
};

export const newsletter = {
  heading: "Join Our Newsletter",
  description: "Get updates on new arrivals and exclusive deals.",
};
