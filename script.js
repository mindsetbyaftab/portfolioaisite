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

// Keep UI-only form submission friendly while no backend is connected yet.
const contactForm = document.querySelector(".contact-form form");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button");
  const originalText = button.innerHTML;

  button.innerHTML = '<i class="fa-solid fa-check"></i> Message Draft Ready';
  button.disabled = true;

  setTimeout(() => {
    button.innerHTML = originalText;
    button.disabled = false;
  }, 1800);
});
