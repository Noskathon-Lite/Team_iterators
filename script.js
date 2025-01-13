document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("slider");
    const slides = document.querySelectorAll(".slide");
    const totalSlides = slides.length;
    let offset = 0;
    let isTransitioning = false;

    // Create navigation dots
    const sliderWrapper = document.getElementById("slider-wrapper");
    const dotsContainer = document.createElement("div");
    dotsContainer.className = "absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10";

    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "w-3 h-3 rounded-full bg-white bg-opacity-50 hover:bg-opacity-100 transition-opacity";
        dot.addEventListener("click", () => goToSlide(index));
        if (index === 0) dot.classList.add("bg-opacity-100");
        dotsContainer.appendChild(dot);
    });

    sliderWrapper.appendChild(dotsContainer);

    // Duplicate slides for infinite loop
    const duplicatedSlides = Array.from(slides).map(slide => slide.cloneNode(true));
    duplicatedSlides.forEach(slide => slider.appendChild(slide));

    // Update navigation dots
    function updateDots() {
        const activeDotIndex = Math.abs(offset / 100) % totalSlides;
        const dots = dotsContainer.querySelectorAll("button");
        dots.forEach((dot, index) => {
            dot.classList.toggle("bg-opacity-100", index === activeDotIndex);
        });
    }

    // Go to specific slide
    function goToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        offset = -index * 100;
        slider.style.transition = "transform 1s ease-in-out";
        slider.style.transform = `translateX(${offset}%)`;
        updateDots();

        setTimeout(() => {
            isTransitioning = false;
        }, 1000);
    }

    // Move slider to next slide
    function moveSlider() {
        if (isTransitioning) return;
        isTransitioning = true;

        offset -= 100;
        slider.style.transition = "transform 1s ease-in-out";
        slider.style.transform = `translateX(${offset}%)`;
        updateDots();

        // Reset when reaching duplicated slides
        if (Math.abs(offset) >= totalSlides * 100) {
            setTimeout(() => {
                slider.style.transition = "none";
                offset = 0;
                slider.style.transform = `translateX(${offset}%)`;
                isTransitioning = false;
            }, 1000);
        } else {
            setTimeout(() => {
                isTransitioning = false;
            }, 1000);
        }
    }

    // Handle touch events
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        clearInterval(slideInterval);
    }, { passive: true });

    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX - touchEndX;

        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                moveSlider();
            } else {
                offset += 100;
                slider.style.transition = "transform 1s ease-in-out";
                slider.style.transform = `translateX(${offset}%)`;
                updateDots();
            }
        }

        slideInterval = setInterval(moveSlider, 3000);
    }, { passive: true });

    // Handle visibility change
    let slideInterval = setInterval(moveSlider, 3000);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearInterval(slideInterval);
        } else {
            slideInterval = setInterval(moveSlider, 3000);
        }
    });

    // Handle mouse hover
    sliderWrapper.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    sliderWrapper.addEventListener('mouseleave', () => {
        slideInterval = setInterval(moveSlider, 3000);
    });
});