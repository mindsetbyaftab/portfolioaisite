// Reveal sections and cards with a subtle slide-up as they enter the viewport.
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px"
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

// Auto-sliding recent work carousel with responsive visible card counts.
const carouselTrack = document.querySelector("[data-carousel-track]");
const carouselViewport = document.querySelector("[data-carousel-viewport]");
const carouselDots = document.querySelector("[data-carousel-dots]");

if (carouselTrack && carouselViewport && carouselDots) {
  const autoplayDelay = 2600;
  let autoplayId = null;
  let currentIndex = 0;
  let visibleCount = 1;
  let originalSlides = [];

  const getVisibleCount = () => {
    if (window.matchMedia("(min-width: 960px)").matches) {
      return 4;
    }

    if (window.matchMedia("(min-width: 700px)").matches) {
      return 2;
    }

    return 1;
  };

  const getSlides = () => Array.from(carouselTrack.children);

  const getSlideStep = () => {
    const firstSlide = carouselTrack.querySelector(".recent-card");
    if (!firstSlide) {
      return 0;
    }

    const gap = parseFloat(window.getComputedStyle(carouselTrack).gap) || 0;
    return firstSlide.getBoundingClientRect().width + gap;
  };

  const updateDots = () => {
    const activeIndex = (currentIndex - visibleCount + originalSlides.length) % originalSlides.length;
    Array.from(carouselDots.children).forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  };

  const moveToCurrentSlide = (withTransition = true) => {
    carouselTrack.style.transition = withTransition ? "transform 0.65s ease" : "none";
    carouselTrack.style.transform = `translateX(-${getSlideStep() * currentIndex}px)`;
    updateDots();
  };

  const buildDots = () => {
    carouselDots.innerHTML = "";

    originalSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to recent work slide ${index + 1}`);
      dot.addEventListener("click", () => {
        currentIndex = index + visibleCount;
        moveToCurrentSlide();
        restartAutoplay();
      });
      carouselDots.appendChild(dot);
    });
  };

  const rebuildCarousel = () => {
    const safeIndex = originalSlides.length
      ? (currentIndex - visibleCount + originalSlides.length) % originalSlides.length
      : 0;

    getSlides()
      .filter((slide) => slide.hasAttribute("data-clone"))
      .forEach((slide) => slide.remove());

    originalSlides = getSlides();
    visibleCount = getVisibleCount();

    const clonesBefore = originalSlides.slice(-visibleCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-clone", "true");
      return clone;
    });

    const clonesAfter = originalSlides.slice(0, visibleCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-clone", "true");
      return clone;
    });

    clonesBefore.forEach((clone) => {
      carouselTrack.insertBefore(clone, carouselTrack.firstChild);
    });

    clonesAfter.forEach((clone) => {
      carouselTrack.appendChild(clone);
    });

    currentIndex = visibleCount + safeIndex;
    buildDots();
    moveToCurrentSlide(false);
  };

  const nextSlide = () => {
    currentIndex += 1;
    moveToCurrentSlide();
  };

  const stopAutoplay = () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayId = window.setInterval(nextSlide, autoplayDelay);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  carouselTrack.addEventListener("transitionend", () => {
    if (currentIndex >= originalSlides.length + visibleCount) {
      currentIndex = visibleCount;
      moveToCurrentSlide(false);
    }
  });

  carouselViewport.addEventListener("mouseenter", stopAutoplay);
  carouselViewport.addEventListener("mouseleave", startAutoplay);
  carouselViewport.addEventListener("focusin", stopAutoplay);
  carouselViewport.addEventListener("focusout", startAutoplay);
  window.addEventListener("resize", rebuildCarousel);

  rebuildCarousel();
  startAutoplay();
}
