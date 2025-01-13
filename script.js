// JavaScript to handle the slider functionality
document.addEventListener("DOMContentLoaded", function() {
    let currentIndex = 0; // Initialize the index for the current slide
    const slides = document.querySelectorAll('.slide'); // Get all the slide elements
    const prevButton = document.querySelector('.prev'); // Get the previous button
    const nextButton = document.querySelector('.next'); // Get the next button

    // Function to hide all slides
    function hideSlides() {
        slides.forEach(slide => slide.classList.remove('active'));
    }

    // Function to show the current slide
    function showSlide(index) {
        hideSlides(); // Hide all slides first
        slides[index].classList.add('active'); // Add the 'active' class to the current slide
    }

    // Show the first slide by default
    showSlide(currentIndex);

    // Event listener for the previous button
    prevButton.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length; // Go to previous slide
        showSlide(currentIndex);
    });

    // Event listener for the next button
    nextButton.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % slides.length; // Go to next slide
        showSlide(currentIndex);
    });

    // Optional: Auto slide change every 5 seconds
    setInterval(function() {
        currentIndex = (currentIndex + 1) % slides.length; // Go to next slide automatically
        showSlide(currentIndex);
    }, 5000); // Change slide every 5 seconds
});