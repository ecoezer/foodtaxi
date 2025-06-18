import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('doener');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    ['doener', '🥙', 'Spezialitäten'],
    ['pizza', '🍕', 'Pizza'],
    ['burger', '🍔', 'Hamburger'],
    ['pasta', '🍝', 'Pasta & Al Forno'],
    ['schnitzel', '🍖', 'Schnitzel'],
    ['fingerfood', '🍟', 'Finger Food'],
    ['salate', '🥗', 'Salate'],
    ['desserts', '🍰', 'Desserts'],
    ['dips', '🥄', 'Dips & Soßen'],
    ['getraenke', '🥤', 'Getränke']
  ];

  // Mobile detection with proper breakpoints
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check scroll position and update arrow visibility
  const updateArrowVisibility = () => {
    const container = scrollContainerRef.current;
    if (!container || !isMobile) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isScrollable = scrollWidth > clientWidth;
    
    setShowLeftArrow(isScrollable && scrollLeft > 5);
    setShowRightArrow(isScrollable && scrollLeft < scrollWidth - clientWidth - 5);
  };

  // Update arrow visibility on scroll and resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => updateArrowVisibility();
    const handleResize = () => {
      setTimeout(updateArrowVisibility, 100); // Delay to ensure layout is updated
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial check
    setTimeout(updateArrowVisibility, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  // Mouse tracking for desktop magnetic effect
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const nav = navRef.current;
      if (nav) {
        const rect = nav.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0.1 }
    );

    const sections = document.querySelectorAll('div[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.6;
    const currentScroll = container.scrollLeft;
    const targetScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, currentScroll + scrollAmount);
    
    container.scrollTo({ 
      left: targetScroll, 
      behavior: 'smooth' 
    });
  };

  const getMagneticOffset = (itemIndex: number) => {
    if (isMobile) return { x: 0, y: 0 };
    
    const container = scrollContainerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const itemWidth = 70;
    const itemCenterX = (itemIndex * itemWidth) + (itemWidth / 2) - container.scrollLeft;
    const distance = Math.abs(mousePosition.x - itemCenterX);
    
    if (distance < 60) {
      const strength = (60 - distance) / 60;
      return { 
        x: (mousePosition.x - itemCenterX) * strength * 0.1,
        y: (mousePosition.y - 50) * strength * 0.08
      };
    }
    return { x: 0, y: 0 };
  };

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full py-1 sm:py-2 sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <nav 
        ref={navRef}
        className="relative overflow-hidden shadow-2xl border-b-2 sm:border-b-4 border-orange-400 w-full max-w-full mx-auto"
        style={{
          background: `
            linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,248,240,0.95) 100%),
            repeating-linear-gradient(45deg, rgba(255,165,0,0.05) 0px, rgba(255,165,0,0.05) 10px, transparent 10px, transparent 20px)
          `,
          borderRadius: isMobile ? '12px' : '20px'
        }}
      >
        <div className="relative w-full">
          {/* Left arrow - Show only on mobile when scrollable and not at start */}
          {isMobile && showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)'
              }}
              aria-label="Nach links scrollen"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          )}

          {/* Right arrow - Show only on mobile when scrollable and not at end */}
          {isMobile && showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)'
              }}
              aria-label="Nach rechts scrollen"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          )}

          {/* Navigation items */}
          <div 
            ref={scrollContainerRef}
            className={`flex items-center gap-0.5 sm:gap-1 py-1 sm:py-2 transition-all duration-300 ${
              isMobile 
                ? 'overflow-x-auto scrollbar-hide px-2 sm:px-3' 
                : 'justify-center px-2 sm:px-4'
            } ${
              isMobile && (showLeftArrow || showRightArrow) 
                ? 'px-10 sm:px-12' 
                : ''
            }`}
            style={isMobile ? { 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            } : {}}
          >
            {navigationItems.map(([id, emoji, label], index) => {
              const magneticOffset = getMagneticOffset(index);
              const isActive = activeSection === id;
              
              return (
                <button
                  key={id}
                  onClick={() => handleItemClick(id)}
                  className={`flex flex-col items-center px-1.5 sm:px-2 md:px-3 py-1 sm:py-2 min-w-[50px] sm:min-w-[55px] md:min-w-[60px] transition-all duration-200 rounded-lg sm:rounded-xl flex-shrink-0 ${
                    isActive ? 'text-white font-bold' : 'text-gray-700 hover:text-white font-medium'
                  }`}
                  style={{
                    background: isActive 
                      ? 'linear-gradient(135deg, #ff6b35, #f7931e)' 
                      : 'transparent',
                    boxShadow: isActive 
                      ? '0 4px 12px rgba(255, 107, 53, 0.4)' 
                      : 'none',
                    transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px) scale(${isActive ? 1.05 : 1})`,
                    scrollSnapAlign: isMobile ? 'start' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isMobile) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 53, 0.8), rgba(247, 147, 30, 0.8))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span className={`text-sm sm:text-base md:text-lg mb-0 sm:mb-0.5 transition-all duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    {emoji}
                  </span>
                  <span className="text-xs sm:text-xs md:text-xs whitespace-nowrap leading-tight text-center">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom decoration */}
        <div 
          className="absolute bottom-0 left-0 w-full h-0.5"
          style={{
            background: 'linear-gradient(90deg, #ff6b35, #f7931e, #ffb347, #f7931e, #ff6b35)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />
      </nav>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Navigation;