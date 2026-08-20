/**
 * Consciousness Retreat 2026 – Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Day Filter & Thematic Circles
  initDayFilter();

  // Initialize Circular Carousel
  initCarousel();

  // Initialize Reading Time Day-Based Filtering
  initReadingDayFilter();
});

/* ==========================================================================
   Day Filter & Thematic Circles Click Handlers (Day 1 to Day 7)
   ========================================================================== */
function initDayFilter() {
  const dayTabButtons = document.querySelectorAll('.day-tab-btn');
  const dayContainers = document.querySelectorAll('.day-container');
  const circleCards = document.querySelectorAll('.circle-card');

  function setActiveDay(targetDay) {
    // Update Tab Buttons
    dayTabButtons.forEach(btn => {
      if (btn.dataset.day === targetDay) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Circle Cards
    circleCards.forEach(card => {
      if (card.dataset.day === targetDay) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Show/Hide Containers
    dayContainers.forEach(container => {
      if (container.id === `day-${targetDay}`) {
        container.classList.add('active');
      } else {
        container.classList.remove('active');
      }
    });
  }

  // Tab click listeners
  dayTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.dataset.day;
      setActiveDay(day);
    });
  });

  // Thematic Circle click listeners
  circleCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const day = card.dataset.day;
      setActiveDay(day);

      // Smooth scroll to program section
      const programElement = document.getElementById('program');
      if (programElement) {
        const targetPosition = programElement.getBoundingClientRect().top + window.pageYOffset - 40;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Ensure Day 1 is active on initial load
  setActiveDay('1');

  // Expose for carousel sync
  window.setActiveDayExternal = setActiveDay;
}

/* ==========================================================================
   Reading Time Day-Based Filtering
   ========================================================================== */
function initReadingDayFilter() {
  const filterPills = document.querySelectorAll('.filter-pill-btn');
  const dayClusters = document.querySelectorAll('.day-reading-cluster');

  function filterByDay(selectedDay) {
    dayClusters.forEach(cluster => {
      const clusterDay = cluster.dataset.day;
      if (selectedDay === 'all' || clusterDay === selectedDay) {
        cluster.style.display = 'block';
      } else {
        cluster.style.display = 'none';
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const selectedDay = pill.dataset.filter;
      filterByDay(selectedDay);
    });
  });

  // Default: show Day 1 only
  filterByDay('1');
}
/* ==========================================================================
   Circular Carousel
   ========================================================================== */
function initCarousel() {
  const cards  = Array.from(document.querySelectorAll('.circle-carousel .circle-card'));
  const dots   = Array.from(document.querySelectorAll('.carousel-dot'));
  const prev   = document.querySelector('.carousel-prev');
  const next   = document.querySelector('.carousel-next');
  if (!cards.length) return;

  let activeIndex = 0;
  const total = cards.length;

  function updateCarousel(newIndex) {
    activeIndex = ((newIndex % total) + total) % total;

    cards.forEach((card, i) => {
      const offset = i - activeIndex;
      // Clamp to ±3 for CSS targeting
      const clamped = Math.max(-3, Math.min(3, offset));
      card.dataset.offset = String(clamped);
    });

    // Sync dots
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));

    // Sync day filter + schedule
    const day = String(activeIndex + 1);
    if (typeof setActiveDayExternal === 'function') setActiveDayExternal(day);
  }

  // Arrow navigation
  prev.addEventListener('click', () => updateCarousel(activeIndex - 1));
  next.addEventListener('click', () => updateCarousel(activeIndex + 1));

  // Dot navigation
  dots.forEach((dot, i) => dot.addEventListener('click', () => updateCarousel(i)));

  // Click on any non-active card — advance to it
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      if (i !== activeIndex) {
        updateCarousel(i);
      } else {
        // Centre card clicked — scroll to schedule
        const prog = document.getElementById('program');
        if (prog) prog.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Touch swipe
  let touchStartX = 0;
  const carousel = document.querySelector('.circle-carousel');
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) updateCarousel(activeIndex + (delta > 0 ? 1 : -1));
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') updateCarousel(activeIndex + 1);
    if (e.key === 'ArrowLeft')  updateCarousel(activeIndex - 1);
  });

  // Init
  updateCarousel(0);
}
