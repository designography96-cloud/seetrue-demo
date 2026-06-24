// SEETRUE — main.js
// nav, side menu, search panel, wishlist panel, product card image arrows, F-key feedback

(function () {
  'use strict';

  var body = document.body;
  var overlay = document.getElementById('overlay');

  /* ---------- header border on scroll ---------- */
  var header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  });

  /* ---------- side menu (left) ---------- */
  var menuPanel = document.getElementById('menuPanel');

  function openMenu() {
    menuPanel.classList.add('is-open');
    overlay.classList.add('is-visible');
  }
  function closeMenu() {
    menuPanel.classList.remove('is-open');
    var otherOpen = (searchPanel && searchPanel.classList.contains('is-open')) ||
                    (wishlistPanel && wishlistPanel.classList.contains('is-open'));
    if (!otherOpen) overlay.classList.remove('is-visible');
  }

  if (document.getElementById('menuOpen')) document.getElementById('menuOpen').addEventListener('click', openMenu);
  if (document.getElementById('menuClose')) document.getElementById('menuClose').addEventListener('click', closeMenu);

  // accordion submenus
  document.querySelectorAll('.menu-item__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.menu-item').classList.toggle('is-expanded');
    });
  });

  /* ---------- search panel (right) ---------- */
  var searchPanel = document.getElementById('searchPanel');
  var searchInput = document.getElementById('searchInput');

  function openSearch() {
    searchPanel.classList.add('is-open');
    overlay.classList.add('is-visible');
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 450);
  }
  function closeSearch() {
    if (!searchPanel) return;
    searchPanel.classList.remove('is-open');
    var otherOpen = (menuPanel && menuPanel.classList.contains('is-open')) ||
                    (wishlistPanel && wishlistPanel.classList.contains('is-open'));
    if (!otherOpen) overlay.classList.remove('is-visible');
  }

  if (document.getElementById('searchOpen')) document.getElementById('searchOpen').addEventListener('click', openSearch);
  if (document.getElementById('searchClose')) document.getElementById('searchClose').addEventListener('click', closeSearch);
  if (document.getElementById('searchReset')) document.getElementById('searchReset').addEventListener('click', function () {
    if (searchInput) { searchInput.value = ''; searchInput.focus(); }
  });

  /* ---------- wishlist panel (right, narrower than search) ---------- */
  var wishlistPanel = document.getElementById('wishlistPanel');
  var wishlistBody = document.getElementById('wishlistBody');

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem('seetrue-wishlist') || '[]'); } catch(e) { return []; }
  }
  function setWishlist(arr) {
    localStorage.setItem('seetrue-wishlist', JSON.stringify(arr));
  }

  function renderWishlist() {
    if (!wishlistBody) return;
    var list = getWishlist();
    if (!list.length) {
      wishlistBody.innerHTML = '<div class="wishlist-empty"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>your wishlist is empty</p></div>';
      return;
    }
    wishlistBody.innerHTML = list.map(function(item) {
      return '<div class="wishlist-item">' +
        '<div class="wishlist-item__img">' + (item.img ? '<img src="' + item.img + '" alt="' + item.name + '" />' : '') + '</div>' +
        '<div class="wishlist-item__info"><span class="wishlist-item__name">' + item.name + '</span><span class="wishlist-item__price">' + item.price + '</span></div>' +
        '<button class="wishlist-item__remove" data-id="' + item.id + '" aria-label="remove"><svg viewBox="0 0 24 24"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button>' +
        '</div>';
    }).join('');
    wishlistBody.querySelectorAll('.wishlist-item__remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var wl = getWishlist().filter(function(x) { return x.id !== id; });
        setWishlist(wl);
        document.querySelectorAll('.card-wish-btn[data-wish-id="' + id + '"]').forEach(function(b) { b.classList.remove('is-active'); });
        renderWishlist();
      });
    });
  }

  function openWishlist() {
    if (!wishlistPanel) return;
    renderWishlist();
    wishlistPanel.classList.add('is-open');
    overlay.classList.add('is-visible');
  }
  function closeWishlist() {
    if (!wishlistPanel) return;
    wishlistPanel.classList.remove('is-open');
    var otherOpen = (menuPanel && menuPanel.classList.contains('is-open')) ||
                    (searchPanel && searchPanel.classList.contains('is-open'));
    if (!otherOpen) overlay.classList.remove('is-visible');
  }

  if (document.getElementById('wishlistOpen')) document.getElementById('wishlistOpen').addEventListener('click', openWishlist);
  if (document.getElementById('wishlistClose')) document.getElementById('wishlistClose').addEventListener('click', closeWishlist);

  /* inject heart buttons into every product card */
  document.querySelectorAll('.product-card').forEach(function(card) {
    var frame = card.querySelector('.product-card__frame');
    if (!frame) return;
    var nameEl = card.querySelector('.product-card__name');
    var priceEl = card.querySelector('.product-card__price');
    var imgEl = card.querySelector('.product-card__img-wrap img');
    var name = nameEl ? nameEl.textContent.trim() : '';
    var price = priceEl ? priceEl.textContent.trim() : '';
    var img = imgEl ? imgEl.getAttribute('src') : '';
    var id = name.replace(/\s+/g, '-').toLowerCase();

    var btn = document.createElement('button');
    btn.className = 'card-wish-btn';
    btn.setAttribute('aria-label', 'add to wishlist');
    btn.setAttribute('data-wish-id', id);
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

    var wl = getWishlist();
    if (wl.some(function(x) { return x.id === id; })) btn.classList.add('is-active');

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var list = getWishlist();
      var idx = list.findIndex(function(x) { return x.id === id; });
      if (idx > -1) {
        list.splice(idx, 1);
        document.querySelectorAll('.card-wish-btn[data-wish-id="' + id + '"]').forEach(function(b) { b.classList.remove('is-active'); });
      } else {
        list.push({ id: id, name: name, price: price, img: img });
        document.querySelectorAll('.card-wish-btn[data-wish-id="' + id + '"]').forEach(function(b) { b.classList.add('is-active'); });
      }
      setWishlist(list);
    });

    frame.appendChild(btn);
  });

  /* ---------- product card click → navigate ---------- */
  document.querySelectorAll('.product-card[data-href]').forEach(function (card) {
    var href = card.dataset.href;
    card.style.cursor = 'pointer';
    card.querySelector('.product-card__frame').addEventListener('click', function (e) {
      if (e.target.closest('.card-wish-btn') || e.target.closest('.card-arrow') || e.target.closest('.swatches__more')) return;
      window.location.href = href;
    });
  });

  /* ---------- overlay + escape close everything ---------- */
  if (overlay) overlay.addEventListener('click', function () {
    closeMenu();
    closeSearch();
    closeWishlist();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
      closeSearch();
      closeWishlist();
      closeFeedbackModal();
    }
  });

  /* ---------- product card image arrows (slide transition) ---------- */
  document.querySelectorAll('.product-card').forEach(function (card) {
    var images;
    try { images = JSON.parse(card.dataset.images); } catch (err) { return; }
    if (!images || images.length < 2) return;

    var wrap = card.querySelector('.product-card__img-wrap');
    var img = wrap.querySelector('img');
    var index = 0;
    var animating = false;

    // dir: +1 = next (slides in from the right), -1 = prev (from the left)
    function slide(dir) {
      if (animating) return;
      animating = true;
      index = (index + dir + images.length) % images.length;

      var incoming = document.createElement('img');
      incoming.src = images[index];
      incoming.alt = img.alt;
      incoming.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;' +
        'transform:translateX(' + (dir * 100) + '%);transition:transform .45s cubic-bezier(.4,0,.2,1);z-index:2;';
      wrap.insertBefore(incoming, img.nextSibling);

      img.style.transition = 'transform .45s cubic-bezier(.4,0,.2,1)';

      // next frame: slide both
      setTimeout(function () {
        incoming.style.transform = 'translateX(0)';
        img.style.transform = 'translateX(' + (-dir * 100) + '%)';
      }, 20);

      setTimeout(function () {
        img.src = images[index];
        img.style.transition = 'none';
        img.style.transform = 'none';
        wrap.removeChild(incoming);
        animating = false;
      }, 500);
    }

    card.querySelector('.card-arrow--prev').addEventListener('click', function (e) {
      e.preventDefault();
      slide(-1);
    });
    card.querySelector('.card-arrow--next').addEventListener('click', function (e) {
      e.preventDefault();
      slide(1);
    });
  });

  /* ---------- swatch paging (> arrow cycles color sets) ---------- */
  document.querySelectorAll('.product-card').forEach(function (card) {
    var sets;
    try { sets = JSON.parse(card.dataset.swatchSets); } catch (err) { return; }
    if (!sets || sets.length < 2) return;

    var dots = card.querySelectorAll('.swatches i');
    var more = card.querySelector('.swatches__more');
    if (!more) return;
    var setIndex = 0;

    more.addEventListener('click', function (e) {
      e.preventDefault();
      setIndex = (setIndex + 1) % sets.length;
      sets[setIndex].forEach(function (color, i) {
        if (dots[i]) dots[i].style.background = color;
      });
    });
  });

  /* ---------- header hides at page bottom ---------- */
  (function () {
    var hdr = document.querySelector('.header');
    if (!hdr) return;
    window.addEventListener('scroll', function () {
      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      hdr.classList.toggle('is-hidden-bottom', atBottom);
    }, { passive: true });
  }());

  /* ---------- newsletter (design only for now) ---------- */
  var newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  /* =============================================
     FEEDBACK MODE — press F
     ============================================= */
  var feedbackModal = document.getElementById('feedbackModal');
  var feedbackSectionName = document.getElementById('feedbackSectionName');
  var feedbackText = document.getElementById('feedbackText');
  var currentSection = null;

  if (!feedbackModal) return; // pages without feedback UI bail out early

  var STORAGE_KEY = 'seetrue-feedback';

  function getFeedback() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (err) { return []; }
  }
  function setFeedback(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function toggleFeedbackMode() {
    body.classList.toggle('feedback-mode');
  }

  document.addEventListener('keydown', function (e) {
    // ignore F while typing in inputs/textareas
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'f' || e.key === 'F') toggleFeedbackMode();
  });

  // click a section while in feedback mode
  document.querySelectorAll('[data-feedback]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (!body.classList.contains('feedback-mode')) return;
      e.preventDefault();
      e.stopPropagation();
      currentSection = el.dataset.feedback;
      if (feedbackSectionName) feedbackSectionName.textContent = 'section: ' + currentSection;
      if (feedbackText) feedbackText.value = '';
      feedbackModal.classList.add('is-open');
      setTimeout(function () { if (feedbackText) feedbackText.focus(); }, 100);
    }, true);
  });

  function closeFeedbackModal() {
    feedbackModal.classList.remove('is-open');
  }

  var feedbackCancel = document.getElementById('feedbackCancel');
  if (feedbackCancel) feedbackCancel.addEventListener('click', closeFeedbackModal);
  feedbackModal.addEventListener('click', function (e) {
    if (e.target === feedbackModal) closeFeedbackModal();
  });

  var feedbackSave = document.getElementById('feedbackSave');
  if (feedbackSave) feedbackSave.addEventListener('click', function () {
    var text = feedbackText ? feedbackText.value.trim() : '';
    if (!text) return;
    var list = getFeedback();
    list.push({
      section: currentSection,
      feedback: text,
      time: new Date().toISOString()
    });
    setFeedback(list);
    closeFeedbackModal();
  });

  function copyToClipboard(text) {
    // clipboard api needs a secure context and can be blocked in iframes —
    // fall back to a hidden textarea + execCommand when it fails
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      return ok ? Promise.resolve() : Promise.reject();
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(fallback);
    }
    return fallback();
  }

  document.getElementById('feedbackCopy').addEventListener('click', function () {
    var text = feedbackText.value.trim();
    if (!text) return;
    var pageFile = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    var pageName = pageFile === 'index' ? 'homepage' : pageFile + ' page';
    var prompt = 'feedback for the "' + currentSection + '" section of the seetrue ' + pageName + ': ' + text;
    var btn = document.getElementById('feedbackCopy');
    var original = btn.textContent;
    copyToClipboard(prompt).then(function () {
      btn.textContent = 'copied!';
      setTimeout(function () { btn.textContent = original; }, 1500);
    }).catch(function () {
      // last resort: show the prompt so it can be copied manually
      btn.textContent = 'copy blocked — text selected below';
      feedbackText.value = prompt;
      feedbackText.focus();
      feedbackText.select();
      setTimeout(function () { btn.textContent = original; }, 2500);
    });
  });

  document.getElementById('feedbackDownload').addEventListener('click', function () {
    // include the note currently in the box (even if not saved yet)
    var list = getFeedback();
    var text = feedbackText.value.trim();
    if (text) {
      list.push({ section: currentSection, feedback: text, time: new Date().toISOString() });
      setFeedback(list);
    }
    var blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'feedback.json';
    a.click();
    URL.revokeObjectURL(a.href);
    closeFeedbackModal();
  });

})();
