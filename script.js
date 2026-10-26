(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Footer year */
  $('#year').textContent = new Date().getFullYear();

  /* Sticky nav border + mobile menu */
  const nav = $('#nav'), links = $('#links'), menuBtn = $('#menuBtn');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = open => {
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  };
  menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* Highlight the nav link for the section in view */
  const navLinks = $$('a', links);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));

  /* Gallery filters */
  const cards = $$('.card');
  $$('.chip').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    cards.forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.cat !== f));
  }));

  /* Lightbox */
  const lb = $('#lightbox'), media = $('#lbMedia'), cap = $('#lbCap');
  let current = 0, opener = null;
  const visible = () => cards.filter(c => !c.classList.contains('hide'));

  function render(card) {
    const { src, type, title } = card.dataset;
    media.innerHTML = '';
    let el;
    if (src && type === 'video') {
      el = document.createElement('video');
      Object.assign(el, { src, controls: true, autoplay: true, loop: true, muted: true, playsInline: true });
    } else if (src) {
      el = document.createElement('img');
      el.src = src; el.alt = title;
    } else {
      el = document.createElement('div');
      el.className = 'ph';
      el.style.cssText = card.getAttribute('style');
      el.textContent = 'Add your ' + (type === 'video' ? 'video loop' : 'image') + ' in data-src to preview "' + title + '" here.';
    }
    media.appendChild(el);
    cap.textContent = title + ' · ' + $('em', card).textContent;
  }

  function open(card) {
    opener = card;
    current = visible().indexOf(card);
    render(card);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function close() {
    lb.hidden = true;
    media.innerHTML = '';
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  function step(dir) {
    const list = visible();
    current = (current + dir + list.length) % list.length;
    render(list[current]);
  }

  cards.forEach(c => c.addEventListener('click', () => open(c)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* Contact form */
  const form = $('#form'), status = $('#status');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('input,textarea', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    status.className = 'status ' + (ok ? 'ok' : 'err');
    if (!ok) { status.textContent = 'Please fill in every field with a valid email address.'; return; }

    /* Demo behavior: swap this block for fetch() to Formspree, Netlify Forms, or your own endpoint. */
    status.textContent = 'Message sent. Thanks, I will reply within two working days.';
    form.reset();
  });
})();
