import { RxDotFilled } from "react-icons/rx";

interface SlideNavigationProps {
  slides: Array<{
    id: number;
    title: string;
    image_url: string;
    link_url: string;
    active: boolean;
  }>;
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export default function SlideNavigation({
  slides,
  currentSlide,
  onSlideChange,
}: SlideNavigationProps) {
  return (
    <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center space-x-1 sm:space-x-2">
      {slides.map((_, index) => (
        <button
          key={index}
          onClick={() => onSlideChange(index)}
          className={`transition-all duration-300 ${
            index === currentSlide
              ? "text-primary scale-105 sm:scale-110 md:scale-125"
              : "text-gray-600 hover:text-primary"
          }`}
        >
          <RxDotFilled size={12} className="sm:size-14 md:size-18" />
        </button>
      ))}
    </div>
  );
}
