// SEETRUE — main.js
// nav, side menu, search panel, product card image arrows, F-key feedback

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
    if (!searchPanel.classList.contains('is-open')) overlay.classList.remove('is-visible');
  }

  document.getElementById('menuOpen').addEventListener('click', openMenu);
  document.getElementById('menuClose').addEventListener('click', closeMenu);

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
    setTimeout(function () { searchInput.focus(); }, 450);
  }
  function closeSearch() {
    searchPanel.classList.remove('is-open');
  }

  document.getElementById('searchOpen').addEventListener('click', openSearch);
  document.getElementById('searchClose').addEventListener('click', closeSearch);
  document.getElementById('searchReset').addEventListener('click', function () {
    searchInput.value = '';
    searchInput.focus();
  });

  /* ---------- overlay + escape close everything ---------- */
  overlay.addEventListener('click', function () {
    closeMenu();
    closeSearch();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
      closeSearch();
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

  /* ---------- newsletter (design only for now) ---------- */
  document.getElementById('newsletterForm').addEventListener('submit', function (e) {
    e.preventDefault();
  });

  /* =============================================
     FEEDBACK MODE — press F
     ============================================= */
  var feedbackModal = document.getElementById('feedbackModal');
  var feedbackSectionName = document.getElementById('feedbackSectionName');
  var feedbackText = document.getElementById('feedbackText');
  var currentSection = null;

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
      feedbackSectionName.textContent = 'section: ' + currentSection;
      feedbackText.value = '';
      feedbackModal.classList.add('is-open');
      setTimeout(function () { feedbackText.focus(); }, 100);
    }, true);
  });

  function closeFeedbackModal() {
    feedbackModal.classList.remove('is-open');
  }

  document.getElementById('feedbackCancel').addEventListener('click', closeFeedbackModal);
  feedbackModal.addEventListener('click', function (e) {
    if (e.target === feedbackModal) closeFeedbackModal();
  });

  document.getElementById('feedbackSave').addEventListener('click', function () {
    var text = feedbackText.value.trim();
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
