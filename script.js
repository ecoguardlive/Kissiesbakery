/* ==========================================================================
   Kissie's Bakery — Scripts
   Sections: Gallery data, Shuffle utility, Carousel builder,
             Carousel controls (pause/prev/next), Lightbox, Contact form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Gallery data ----------
     Real bakery photos supplied by the client. Add/remove items here and
     the carousel, shuffle and lightbox all update automatically. */
  const galleryImages = [
    { src: 'images/gallery-doughnut-stacks.jpg',        alt: 'Stacked trays of fresh glazed doughnuts',        caption: 'Doughnuts, stacked and ready to go' },
    { src: 'images/gallery-oreo-loaf-cake.jpg',          alt: 'Loaf cake topped with crushed cookie pieces',    caption: 'Cookies & cream loaf cake' },
    { src: 'images/gallery-pink-rosette-mini-cake.jpg',  alt: 'Small pink rosette cake with butterfly toppers', caption: 'Mini rosette cake with butterflies' },
    { src: 'images/gallery-football-boys-cake.jpg',      alt: 'White drip cake with football-themed toppers',   caption: 'Football-themed birthday cake' },
    { src: 'images/gallery-pink-birthday-cake.jpg',      alt: 'Pink buttercream cake with Happy Birthday topper', caption: 'Pink buttercream birthday cake' },
    { src: 'images/gallery-gold-leaf-drip-cake.jpg',     alt: 'Cake with chocolate drip and gold leaf flakes',  caption: 'Chocolate drip cake with gold leaf' },
    { src: 'images/gallery-meat-pies-tray.jpg',          alt: 'Tray of freshly baked golden meat pies',         caption: 'Fresh-baked meat pies' },
    { src: 'images/gallery-white-gold-cake.jpg',         alt: 'White cake with gold sphere decorations',        caption: 'White cake, gold sphere accents' },
    { src: 'images/gallery-red-gold-queen-cake.jpg',     alt: 'Cake plaque reading Happy Birthday Queen with red and gold decor', caption: '"Happy Birthday Queen" cake plaque' }
  ];

  /* ---------- 2. Shuffle utility (Fisher–Yates) ---------- */
  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /* ---------- 3. Build the carousel ---------- */
  const track = document.getElementById('carouselTrack');
  if (!track) return; // gallery markup not on this page

  const shuffled = shuffle(galleryImages);

  function buildCard(item) {
    const card = document.createElement('figure');
    card.className = 'carousel-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'View larger photo: ' + item.caption);

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';

    const cap = document.createElement('figcaption');
    cap.className = 'cap';
    cap.textContent = item.caption;

    card.appendChild(img);
    card.appendChild(cap);
    return card;
  }

  // Render the shuffled set TWICE back-to-back so the CSS animation
  // (translateX -50%) loops seamlessly with no visible jump/reset.
  [shuffled, shuffled].forEach(function (set) {
    set.forEach(function (item) {
      track.appendChild(buildCard(item));
    });
  });

  /* ---------- 4. Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCap = document.getElementById('lightboxCap');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(item) {
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCap.textContent = item.caption;
    lightbox.classList.add('is-open');
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
  }

  track.addEventListener('click', function (e) {
    const card = e.target.closest('.carousel-card');
    if (!card) return;
    const img = card.querySelector('img');
    openLightbox({ src: img.src, alt: img.alt, caption: card.querySelector('.cap').textContent });
  });
  track.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.carousel-card');
    if (!card) return;
    e.preventDefault();
    const img = card.querySelector('img');
    openLightbox({ src: img.src, alt: img.alt, caption: card.querySelector('.cap').textContent });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- 5. Carousel controls: pause/play + manual nudge ---------- */
  const carousel = document.getElementById('carousel');
  const pauseBtn = document.getElementById('carouselPause');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      const paused = carousel.classList.toggle('is-paused');
      pauseBtn.textContent = paused ? '▶' : '❚❚';
      pauseBtn.setAttribute('aria-label', paused ? 'Play the photo carousel' : 'Pause the photo carousel');
    });
  }

  // Manual nudge: briefly pause the auto-scroll and nudge the track by
  // one card width, so users who want manual control still can.
  function nudge(direction) {
    carousel.classList.add('is-paused');
    if (pauseBtn) {
      pauseBtn.textContent = '▶';
      pauseBtn.setAttribute('aria-label', 'Play the photo carousel');
    }
    const cardWidth = track.querySelector('.carousel-card').offsetWidth + 22; // + gap
    const current = parseFloat(track.dataset.offset || '0');
    const next = current + (direction * cardWidth * -1);
    track.dataset.offset = next;
    track.style.transform = 'translateX(' + next + 'px)';
    track.style.animation = 'none';
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { nudge(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { nudge(1); });

});

/* ---------- 6. Contact form ----------
   Submits to Formspree (https://formspree.io/f/xbgjwakj) via fetch so the
   visitor never leaves the page. Falls back to a mailto link if the
   request fails (offline, endpoint disabled, etc.) so a message is never
   silently lost. */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    if (status) { status.textContent = ''; status.className = 'form-status'; }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (response.ok) {
        if (status) {
          status.textContent = "Message sent — Kissie's Bakery will get back to you soon.";
          status.className = 'form-status show ok';
        }
        form.reset();
      } else {
        throw new Error('Formspree responded with an error');
      }
    } catch (err) {
      // Network failure or the endpoint rejected the request — fall back
      // to opening the visitor's email client with the message pre-filled.
      if (status) {
        status.textContent = "Couldn't send automatically — opening your email app instead.";
        status.className = 'form-status show err';
      }
      const subject = encodeURIComponent('Order enquiry from ' + name);
      const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')');
      window.location.href = 'mailto:hello@kissiesbakery.com?subject=' + subject + '&body=' + body;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
});
