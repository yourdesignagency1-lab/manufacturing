/**
 * SAN Automation & Precision Engineering
 * Client Application Architecture (SPA Routing, Hero Slider, Filters, RFQ & Interactions)
 */

(function(){
  'use strict';

  // Toast Functionality
  function showToast(msg) {
    var toast = document.getElementById('site-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 3400);
  }

  // SPA Route Switcher
  function showPage(name, push) {
    var validPages = ['home', 'about', 'products', 'services', 'projects', 'contact'];
    if (validPages.indexOf(name) === -1) name = 'home';

    document.querySelectorAll('.page').forEach(function(p){
      p.classList.remove('active');
    });

    var targetPage = document.getElementById('page-' + name);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    document.querySelectorAll('.site-nav .nav-link').forEach(function(link){
      link.classList.toggle('active', link.getAttribute('data-page') === name);
    });

    if (push !== false) {
      history.pushState({ page: name }, '', '#' + name);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    var titles = {
      home: 'SAN Automation & Precision Engineering | Industrial Products, Robotics & Precision Engineering',
      about: 'About Us | SAN Automation & Precision Engineering Bengaluru',
      products: 'Industrial Products Catalog (11 Lines) | SAN Automation',
      services: 'Industrial Engineering & Rapid Breakdown Services (10 Lines) | SAN Automation',
      projects: 'Field Implementations & Turnkey Deliveries | SAN Automation',
      contact: 'Request Technical Quote & Consultation | SAN Automation'
    };
    document.title = titles[name] || titles.home;

    // Trigger intelligent scroll animations for the newly active page
    setTimeout(function(){
      if (typeof initGlobalCardScrollAnimations === 'function') {
        initGlobalCardScrollAnimations(name);
      }
    }, 60);
  }

  var initialHash = location.hash.replace('#', '') || 'home';
  showPage(initialHash, false);

  window.addEventListener('popstate', function(e){
    var target = (e.state && e.state.page) || location.hash.replace('#', '') || 'home';
    showPage(target, false);
  });

  // Global Click Delegator for Navigation
  document.addEventListener('click', function(e){
    var trigger = e.target.closest('[data-page]');
    if (!trigger) return;

    var page = trigger.getAttribute('data-page');
    if (!page) return;

    e.preventDefault();

    var prod = trigger.getAttribute('data-product');
    if (prod) {
      var selectEl = document.getElementById('rfq-item');
      if (selectEl) {
        selectEl.value = prod;
        selectEl.dispatchEvent(new Event('change'));
      }
    }

    showPage(page);

    var scrollTarget = trigger.getAttribute('data-scroll');
    if (scrollTarget) {
      setTimeout(function(){
        var targetEl = document.getElementById(scrollTarget);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }

    // Close mobile nav drawer + release scroll lock when any nav triggers page change
    var siteNav = document.getElementById('site-nav');
    var menuBtn = document.getElementById('menu-toggle');
    if (siteNav) siteNav.classList.remove('open');
    if (menuBtn) menuBtn.classList.remove('open');
    document.body.style.overflow = '';
  });

  // Quick Diagnostic Fault Selector on Home
  document.addEventListener('click', function(e){
    var chip = e.target.closest('.fault-chip');
    if (!chip) return;
    var faultText = chip.getAttribute('data-fault');
    var selectEl = document.getElementById('rfq-item');
    var urgencyEl = document.getElementById('rfq-urgency');
    var msgEl = document.getElementById('rfq-msg');

    if (selectEl) {
      selectEl.value = 'INDUSTRIAL MACHINE BREAKDOWN SERVICE';
      selectEl.dispatchEvent(new Event('change'));
    }
    if (urgencyEl) {
      urgencyEl.value = 'Emergency (Within 24 Hours)';
      urgencyEl.dispatchEvent(new Event('change'));
    }
    if (msgEl) msgEl.value = 'EMERGENCY BREAKDOWN: Diagnosed Fault: ' + faultText + '.\nPlease dispatch mobile team immediately.';

    showToast('Breakdown Fault Selected: ' + faultText);
    showPage('contact');
  });

  // Filter Setup for Products & Services
  function setupFilter(filterContainerId, gridContainerId) {
    var container = document.getElementById(filterContainerId);
    var grid = document.getElementById(gridContainerId);
    if (!container || !grid) return;

    container.addEventListener('click', function(e){
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      var filter = btn.getAttribute('data-filter');

      container.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');

      var cards = grid.querySelectorAll('.catalog-card');
      cards.forEach(function(card){
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  setupFilter('products-filter', 'products-grid');
  setupFilter('services-filter', 'services-grid');

  // RFQ Form & Direct WhatsApp Dispatch with Details
  var form = document.getElementById('rfq-form');
  var feedback = document.getElementById('form-feedback');

  function transmitRFQToWhatsApp() {
    if (!form) return;
    var f = form.elements;
    var name = (f['name'] ? f['name'].value.trim() : '');
    var company = (f['company'] ? f['company'].value.trim() : '');
    var email = (f['email'] ? f['email'].value.trim() : '');
    var phone = (f['phone'] ? f['phone'].value.trim() : '');
    var item = (f['item'] ? f['item'].value : '') || 'General Industrial RFQ';
    var urgency = (f['urgency'] ? f['urgency'].value : 'Standard Requirement (1-2 Weeks)');
    var quantity = (f['quantity'] ? f['quantity'].value.trim() : '');
    var message = (f['message'] ? f['message'].value.trim() : '');

    if (!name || !company || !item) {
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.background = '#FEF2F2';
        feedback.style.color = '#DC2626';
        feedback.style.border = '1px solid #FECACA';
        feedback.textContent = 'Please fill in required fields (Name, Company, and Product/Service) before transmitting to WhatsApp.';
      }
      return;
    }

    var rawDigits = phone.replace(/\D/g, '');
    if (!phone || rawDigits.length < 10) {
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.background = '#FEF2F2';
        feedback.style.color = '#DC2626';
        feedback.style.border = '1px solid #FECACA';
        feedback.textContent = 'Please enter a valid 10-digit phone or WhatsApp number.';
      }
      var pInput = document.getElementById('rfq-phone');
      if (pInput) pInput.focus();
      return;
    }

    var textLines = [
      '★ *SAN Automation & Precision Engineering — Technical RFQ*',
      '• *Client Name:* ' + name,
      '• *Company:* ' + company,
      '• *Business Email:* ' + (email || 'Not specified'),
      '• *Phone / WhatsApp:* ' + (phone || 'Not specified'),
      '• *Requirement:* ' + item,
      '• *Urgency / Timeline:* ' + urgency,
      '• *Scope / Quantity:* ' + (quantity || 'To be specified'),
      '• *Technical Notes:* ' + (message || 'Please provide quotation, lead time and engineering drawings.')
    ];

    var url = 'https://wa.me/919741482809?text=' + encodeURIComponent(textLines.join('\n'));

    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#ECFDF5';
      feedback.style.color = '#059669';
      feedback.style.border = '1px solid #A7F3D0';
      feedback.innerHTML = '<strong>✓ Opening WhatsApp!</strong> Transferring your quotation request details to our engineering desk...';
    }
    if (typeof showToast === 'function') {
      showToast('Opening WhatsApp with RFQ details...');
    }

    var submitBtn = document.getElementById('rfq-submit-btn');
    if (submitBtn) {
      var origHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Opening WhatsApp...</span>';
      setTimeout(function(){
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHTML;
      }, 2000);
    }

    window.open(url, '_blank', 'noopener');
  }

  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      transmitRFQToWhatsApp();
    });

    var waBtn = document.getElementById('rfq-whatsapp-btn');
    if (waBtn && waBtn !== document.getElementById('rfq-submit-btn')) {
      waBtn.addEventListener('click', function(e){
        e.preventDefault();
        transmitRFQToWhatsApp();
      });
    }

    // Phone / WhatsApp Number Restriction & Formatter
    var phoneInput = document.getElementById('rfq-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function(){
        var val = this.value;
        var hasPlus = val.trim().startsWith('+');
        var digits = val.replace(/\D/g, '');

        if (hasPlus) {
          // International format: max 12 digits (e.g. +91 98765 43210)
          digits = digits.slice(0, 12);
          if (digits.startsWith('91') && digits.length > 2) {
            var nat = digits.slice(2);
            if (nat.length > 5) {
              this.value = '+91 ' + nat.slice(0, 5) + ' ' + nat.slice(5, 10);
            } else {
              this.value = '+91 ' + nat;
            }
          } else {
            this.value = '+' + digits;
          }
        } else {
          // National standard: strictly max 10 digits (e.g. 98765 43210)
          digits = digits.slice(0, 10);
          if (digits.length > 5) {
            this.value = digits.slice(0, 5) + ' ' + digits.slice(5, 10);
          } else {
            this.value = digits;
          }
        }
      });

      phoneInput.addEventListener('keydown', function(e){
        // Allow navigation/editing keys
        if ([8, 9, 13, 27, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            (e.ctrlKey || e.metaKey)) {
          return;
        }
        // Allow '+' only at the beginning
        if (e.key === '+' && this.selectionStart === 0 && !this.value.includes('+')) {
          return;
        }
        // Disallow non-numeric characters
        if (!/^\d$/.test(e.key)) {
          e.preventDefault();
        }
      });
    }
  }

  // ====================================================
  // High-Tech Industrial Custom Select Component
  // ====================================================
  function initCustomSelect(selectId) {
    var select = document.getElementById(selectId);
    if (!select || select.dataset.customized === 'true') return;
    select.dataset.customized = 'true';

    var parent = select.parentElement;
    parent.classList.add('custom-select-container');
    select.classList.add('custom-select-native');

    var customWrapper = document.createElement('div');
    customWrapper.className = 'custom-select-wrap';
    customWrapper.id = 'custom-select-' + selectId;

    // Trigger Button
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    var labelSpan = document.createElement('span');
    labelSpan.className = 'custom-select-label';

    var arrow = document.createElement('span');
    arrow.className = 'custom-select-chevron';
    arrow.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>';

    trigger.appendChild(labelSpan);
    trigger.appendChild(arrow);
    customWrapper.appendChild(trigger);

    // Dropdown Menu
    var menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');

    function createOptionElement(opt) {
      var optDiv = document.createElement('div');
      optDiv.className = 'custom-select-option';
      optDiv.setAttribute('role', 'option');
      optDiv.setAttribute('data-value', opt.value);

      if (select.value === opt.value) {
        optDiv.classList.add('selected');
      }

      var optText = opt.textContent.trim();
      if (opt.value === '') {
        optDiv.classList.add('is-placeholder');
      }

      optDiv.innerHTML = '<span class="cso-label">' + optText + '</span>' +
        '<span class="cso-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';

      optDiv.addEventListener('click', function(e){
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        updateTrigger();
        closeMenu();
      });

      return optDiv;
    }

    function renderMenu() {
      menu.innerHTML = '';
      var children = select.children;

      for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child.tagName === 'OPTGROUP') {
          var groupWrap = document.createElement('div');
          groupWrap.className = 'custom-select-group';

          var groupHeader = document.createElement('div');
          groupHeader.className = 'custom-select-group-header';
          var groupLabel = child.getAttribute('label') || '';
          var isProduct = groupLabel.toUpperCase().indexOf('PRODUCT') !== -1;
          groupHeader.innerHTML = '<span class="cs-group-pill ' + (isProduct ? 'cs-group-pill--blue' : 'cs-group-pill--rust') + '">' + groupLabel + '</span>';
          groupWrap.appendChild(groupHeader);

          var options = child.children;
          for (var j = 0; j < options.length; j++) {
            groupWrap.appendChild(createOptionElement(options[j]));
          }
          menu.appendChild(groupWrap);
        } else if (child.tagName === 'OPTION') {
          menu.appendChild(createOptionElement(child));
        }
      }
    }

    function updateTrigger() {
      var selectedOpt = select.options[select.selectedIndex];
      if (selectedOpt && selectedOpt.value !== '') {
        labelSpan.textContent = selectedOpt.textContent.trim();
        labelSpan.classList.add('has-value');
      } else {
        labelSpan.textContent = (selectedOpt ? selectedOpt.textContent.trim() : '-- Please select an item --');
        labelSpan.classList.remove('has-value');
      }

      var allOptions = menu.querySelectorAll('.custom-select-option');
      allOptions.forEach(function(item){
        if (item.getAttribute('data-value') === select.value) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
    }

    function openMenu() {
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(function(el){
        if (el !== customWrapper) {
          el.classList.remove('is-open');
          var tr = el.querySelector('.custom-select-trigger');
          if (tr) tr.setAttribute('aria-expanded', 'false');
        }
      });

      customWrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');

      var selectedItem = menu.querySelector('.custom-select-option.selected');
      if (selectedItem) {
        setTimeout(function(){
          selectedItem.scrollIntoView({ block: 'nearest' });
        }, 50);
      }
    }

    function closeMenu() {
      customWrapper.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      if (customWrapper.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    select.addEventListener('change', function(){
      updateTrigger();
    });

    renderMenu();
    updateTrigger();
    customWrapper.appendChild(menu);
    parent.appendChild(customWrapper);
  }

  // Close when clicking outside
  document.addEventListener('click', function(e){
    if (!e.target.closest('.custom-select-wrap')) {
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(function(el){
        el.classList.remove('is-open');
        var tr = el.querySelector('.custom-select-trigger');
        if (tr) tr.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(function(el){
        el.classList.remove('is-open');
        var tr = el.querySelector('.custom-select-trigger');
        if (tr) tr.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Initialize custom dropdowns for RFQ form
  initCustomSelect('rfq-item');
  initCustomSelect('rfq-urgency');

  // Pre-filter support via footer links
  document.addEventListener('click', function(e){
    var filterTrigger = e.target.closest('[data-filter]');
    if (!filterTrigger || filterTrigger.classList.contains('filter-btn')) return;
    var filterVal = filterTrigger.getAttribute('data-filter');
    var pageVal = filterTrigger.getAttribute('data-page');
    if (filterVal && pageVal) {
      setTimeout(function(){
        var targetBtn = document.querySelector('#' + pageVal + '-filter [data-filter="' + filterVal + '"]');
        if (targetBtn) targetBtn.click();
      }, 100);
    }
  });


  // ====================================================
  // Image Lightbox Preview Controller
  // ====================================================
  var modalEl = document.getElementById('image-preview-modal');
  var modalImg = document.getElementById('modal-preview-img');
  var modalBadge = document.getElementById('modal-preview-badge');
  var modalTitle = document.getElementById('modal-preview-title');
  var modalDesc = document.getElementById('modal-preview-desc');
  var modalInquireBtn = document.getElementById('modal-inquire-btn');
  var modalCloseBtn = document.getElementById('modal-close-btn');
  var modalDismissBtn = document.getElementById('modal-dismiss-btn');
  var modalBackdrop = document.getElementById('modal-backdrop');

  var currentModalItemName = '';

  function openImageModal(imgSrc, title, badge, desc) {
    if (!modalEl || !modalImg) return;
    modalImg.src = imgSrc || '';
    modalImg.alt = title || 'Engineering System';
    if (modalBadge) modalBadge.textContent = badge || 'PRECISION ENGINEERING';
    if (modalTitle) modalTitle.textContent = title || 'Industrial System';
    if (modalDesc) modalDesc.textContent = desc || 'Engineered and manufactured at SAN Automation Bangalore Facility.';
    currentModalItemName = title || '';
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeImageModal() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeImageModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeImageModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeImageModal);

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && modalEl && modalEl.classList.contains('open')) {
      closeImageModal();
    }
  });

  if (modalInquireBtn) {
    modalInquireBtn.addEventListener('click', function(){
      closeImageModal();
      if (currentModalItemName) {
        var cleanName = currentModalItemName.replace(/^[0-9]+\.\s*/, '').trim();
        var selectEl = document.getElementById('rfq-item');
        if (selectEl) {
          for (var i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].text.toUpperCase().indexOf(cleanName.toUpperCase()) !== -1 ||
                cleanName.toUpperCase().indexOf(selectEl.options[i].text.toUpperCase()) !== -1) {
              selectEl.selectedIndex = i;
              selectEl.dispatchEvent(new Event('change'));
              break;
            }
          }
        }
      }
      showPage('contact');
      setTimeout(function(){
        var contactSec = document.getElementById('page-contact');
        if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    });
  }

  // Click handler on card preview buttons and images
  document.addEventListener('click', function(e){
    var previewBtn = e.target.closest('.card-preview-btn');
    var imgWrap = e.target.closest('.catalog-img-wrap, .industry-img-wrap');
    
    // Ignore clicks if clicking an RFQ button inside the card body
    if (e.target.closest('.catalog-btn, a[data-page], button[data-page]')) return;

    if (previewBtn) {
      e.preventDefault();
      e.stopPropagation();
      var src = previewBtn.getAttribute('data-preview-img');
      var title = previewBtn.getAttribute('data-preview-title');
      var badge = previewBtn.getAttribute('data-preview-badge');
      var desc = previewBtn.getAttribute('data-preview-desc');
      openImageModal(src, title, badge, desc);
    } else if (imgWrap) {
      var btnInside = imgWrap.querySelector('.card-preview-btn');
      var imgInside = imgWrap.querySelector('img');
      if (btnInside) {
        var src = btnInside.getAttribute('data-preview-img');
        var title = btnInside.getAttribute('data-preview-title');
        var badge = btnInside.getAttribute('data-preview-badge');
        var desc = btnInside.getAttribute('data-preview-desc');
        openImageModal(src, title, badge, desc);
      } else if (imgInside) {
        var card = imgWrap.closest('.catalog-card, .industry-card');
        var t = card ? card.querySelector('.catalog-title, .industry-title') : null;
        var d = card ? card.querySelector('.catalog-desc, .industry-desc') : null;
        var b = card ? card.querySelector('.catalog-category') : null;
        openImageModal(
          imgInside.getAttribute('src'),
          t ? t.textContent.trim() : 'Engineering System',
          b ? b.textContent.trim() : 'PRECISION ENGINEERING',
          d ? d.textContent.trim() : ''
        );
      }
    }
  });

  // ====================================================
  // Indux Full-Bleed Background Slideshow Controller
  // ====================================================
  (function initInduxHeroSlider(){
    var section = document.getElementById('hero-slider-section');
    if (!section) return;

    var slides = section.querySelectorAll('.hero-bg-slide');
    var prevBtn = document.getElementById('hero-bg-prev');
    var nextBtn = document.getElementById('hero-bg-next');
    var currNumEl = document.getElementById('hero-bg-curr-num');
    var tagTextEl = document.getElementById('hero-bg-tag-text');
    var progressFill = document.getElementById('hero-progress-fill');

    if (!slides.length) return;

    // Preload all hero slide images into memory immediately for instant 5-second rendering
    slides.forEach(function(s){
      var img = s.querySelector('img');
      if (img && img.src) {
        var preloader = new Image();
        preloader.src = img.src;
      }
    });

    var currentIndex = 0;
    var totalSlides = slides.length;
    var duration = 5000; // Exact 5 seconds per slide
    var timer = null;
    var startTime = Date.now();
    var isPaused = false;

    function stepProgress() {
      if (isPaused) return;
      var elapsed = Date.now() - startTime;
      var pct = Math.min(100, (elapsed / duration) * 100);
      if (progressFill) {
        progressFill.style.width = pct + '%';
      }
      if (elapsed >= duration) {
        goToSlide(currentIndex + 1);
      }
    }

    function startSliderTimer() {
      startTime = Date.now();
      if (progressFill) progressFill.style.width = '0%';
      clearInterval(timer);
      timer = setInterval(stepProgress, 30);
    }

    function goToSlide(targetIdx) {
      if (targetIdx < 0) {
        targetIdx = totalSlides - 1;
      } else if (targetIdx >= totalSlides) {
        targetIdx = 0;
      }

      slides.forEach(function(s, idx){
        s.classList.toggle('active', idx === targetIdx);
      });

      if (currNumEl) {
        currNumEl.textContent = '0' + (targetIdx + 1);
      }

      var currentSlide = slides[targetIdx];
      var tag = currentSlide.getAttribute('data-tag') || 'INDUSTRIAL & MANUFACTURING';
      if (tagTextEl) {
        tagTextEl.textContent = tag;
      }

      currentIndex = targetIdx;
      startSliderTimer();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function(e){
        e.preventDefault();
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function(e){
        e.preventDefault();
        goToSlide(currentIndex + 1);
      });
    }

    // Pause only when actively interacting with manual controls
    var navControls = section.querySelector('.hero-slider-nav-btns');
    if (navControls) {
      navControls.addEventListener('mouseenter', function(){
        isPaused = true;
      });
      navControls.addEventListener('mouseleave', function(){
        isPaused = false;
        var currentWidth = parseFloat(progressFill ? progressFill.style.width : 0) || 0;
        startTime = Date.now() - (currentWidth / 100 * duration);
      });
    }

    // Page Visibility change pause
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) {
        isPaused = true;
        clearInterval(timer);
      } else {
        isPaused = false;
        startSliderTimer();
      }
    });

    // Touch swipe support
    var touchStartX = 0;
    section.addEventListener('touchstart', function(e){
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].clientX;
      }
    }, { passive: true });

    section.addEventListener('touchend', function(e){
      if (e.changedTouches && e.changedTouches[0]) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) goToSlide(currentIndex + 1);
          else goToSlide(currentIndex - 1);
        }
      }
    }, { passive: true });

    // Keyboard support
    document.addEventListener('keydown', function(e){
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    startSliderTimer();
  })();



  // ====================================================
  // High-Performance Animated Number Counters (Stats Band)
  // ====================================================
  (function initAnimatedCounters(){
    var statsBand = document.querySelector('.stats-band');
    if (!statsBand) return;

    var counters = statsBand.querySelectorAll('.counter-value');
    if (!counters.length) return;

    var isRunning = false;
    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateCounter(el, target, decimals, duration) {
      if (prefersReduced) {
        el.textContent = decimals > 0 ? target.toFixed(decimals) : Math.round(target).toString();
        return;
      }

      var start = 0;
      var startTime = null;

      function frame(now) {
        if (!startTime) startTime = now;
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = easeOutCubic(progress);
        var current = start + (target - start) * eased;

        el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

        if (progress < 1) {
          window.requestAnimationFrame(frame);
        } else {
          el.textContent = decimals > 0 ? target.toFixed(decimals) : Math.round(target).toString();
        }
      }

      window.requestAnimationFrame(frame);
    }

    function runCounters() {
      if (isRunning) return;
      isRunning = true;

      counters.forEach(function(counter, idx){
        var target = parseFloat(counter.getAttribute('data-target')) || 0;
        var decimals = parseInt(counter.getAttribute('data-decimals'), 10) || 0;
        counter.textContent = decimals > 0 ? (0).toFixed(decimals) : '0';
        setTimeout(function(){
          animateCounter(counter, target, decimals, 1500);
        }, idx * 75);
      });

      setTimeout(function(){
        isRunning = false;
      }, 1600);
    }

    // Set initial 0 text before scroll
    counters.forEach(function(counter){
      var decimals = parseInt(counter.getAttribute('data-decimals'), 10) || 0;
      counter.textContent = decimals > 0 ? (0).toFixed(decimals) : '0';
    });

    // IntersectionObserver triggers counting animation on scroll into viewport
    if ('IntersectionObserver' in window) {
      var hasTriggered = false;
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            statsBand.classList.add('in-view');
            if (!hasTriggered) {
              runCounters();
              hasTriggered = true;
            }
          } else {
            // Reset trigger when scrolled out so re-scrolling animates again!
            statsBand.classList.remove('in-view');
            hasTriggered = false;
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

      observer.observe(statsBand);
    } else {
      runCounters();
    }

    // Re-trigger smoothly when user navigates back to 'home' via SPA router
    window.addEventListener('hashchange', function(){
      var page = location.hash.replace('#', '') || 'home';
      if (page === 'home') {
        var rect = statsBand.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          runCounters();
        }
      }
    });
  })();

  // ====================================================
  // Intelligent Scroll-Driven Capabilities Switcher
  // ====================================================
  (function initScrollCapabilities(){
    var section = document.querySelector('.capabilities-section');
    if (!section) return;

    var rows = section.querySelectorAll('.cap-row');
    var slides = section.querySelectorAll('.cap-slide');
    var badgeEl = document.getElementById('cap-current-badge');
    var titleEl = document.getElementById('cap-current-title');

    if (!rows.length || !slides.length) return;

    var activeIndex = 0;
    var isUserHovering = false;
    var hoverTimeout = null;

    function activateRow(targetIndex, updateHash) {
      if (targetIndex < 0 || targetIndex >= rows.length) return;
      if (targetIndex === activeIndex && rows[targetIndex].classList.contains('active')) return;

      // Update rows
      rows.forEach(function(r, idx){
        r.classList.toggle('active', idx === targetIndex);
      });

      // Update visual slides
      slides.forEach(function(s, idx){
        s.classList.toggle('active', idx === targetIndex);
      });

      // Update overlay texts with smooth subtle fade
      var activeRow = rows[targetIndex];
      var badgeText = activeRow.getAttribute('data-badge') || 'PRECISION ENGINEERING';
      var titleText = activeRow.getAttribute('data-title') || '';

      if (badgeEl && titleEl) {
        badgeEl.style.opacity = '0.3';
        titleEl.style.opacity = '0.3';
        setTimeout(function(){
          badgeEl.textContent = badgeText;
          titleEl.textContent = titleText;
          badgeEl.style.opacity = '1';
          titleEl.style.opacity = '1';
        }, 120);
      }

      activeIndex = targetIndex;
    }

    // High-performance scroll tracking
    var isTicking = false;

    function onScrollCheck() {
      if (isUserHovering) return;

      // Target trigger line at 45% of viewport height (natural reading eye level)
      var targetY = window.innerHeight * 0.44;
      var closestIndex = activeIndex;
      var minDistance = Infinity;

      rows.forEach(function(row, idx){
        var rect = row.getBoundingClientRect();
        var rowCenter = rect.top + (rect.height / 2);
        var dist = Math.abs(rowCenter - targetY);

        // Check if row is currently visible on screen
        if (rect.bottom > 100 && rect.top < window.innerHeight - 100) {
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        }
      });

      activateRow(closestIndex);
      isTicking = false;
    }

    window.addEventListener('scroll', function(){
      if (!isTicking) {
        window.requestAnimationFrame(onScrollCheck);
        isTicking = true;
      }
    }, { passive: true });

    // Initial check on page load / route
    setTimeout(onScrollCheck, 200);

    // Hover interaction support
    rows.forEach(function(row){
      row.addEventListener('mouseenter', function(){
        isUserHovering = true;
        clearTimeout(hoverTimeout);
        var idx = parseInt(row.getAttribute('data-index'), 10);
        if (!isNaN(idx)) activateRow(idx);
      });

      row.addEventListener('mouseleave', function(){
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(function(){
          isUserHovering = false;
        }, 600);
      });
    });

  })();



  // Distinct Global Contact Console Interactive Controller
  // ====================================================
  (function initDistinctContactCard(){
    var card = document.getElementById('distinct-contact-card');
    if (!card) return;

    // Viewport intersection reveal animation
    if ('IntersectionObserver' in window) {
      var cardObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            card.classList.add('in-view');
          }
        });
      }, { threshold: 0.15 });

      cardObserver.observe(card);
    } else {
      card.classList.add('in-view');
    }

    // Interactive One-Click Email Copy
    var copyBtn = document.getElementById('dcc-copy-btn');
    var emailText = document.getElementById('dcc-email-text');
    if (copyBtn && emailText) {
      copyBtn.addEventListener('click', function(e){
        e.preventDefault();
        var email = emailText.textContent.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(function(){
            copyBtn.textContent = 'Copied! ✓';
            copyBtn.style.color = '#22C55E';
            showToast('RFQ email copied to clipboard: ' + email);
            setTimeout(function(){
              copyBtn.textContent = 'Copy Email 📋';
              copyBtn.style.color = '';
            }, 2500);
          });
        } else {
          showToast('Direct RFQ Email: ' + email);
        }
      });
    }

    // Re-check animation on page transitions
    window.addEventListener('hashchange', function(){
      setTimeout(function(){
        var rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95) {
          card.classList.add('in-view');
        }
      }, 100);
    });
  })();



  // Senior Mobile Navigation Drawer Controller
  var menuBtn = document.getElementById('menu-toggle');
  var siteNav = document.getElementById('site-nav');
  if (menuBtn && siteNav) {
    menuBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var isOpen = siteNav.classList.toggle('open');
      menuBtn.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close drawer when clicking any link
    siteNav.querySelectorAll('.nav-link, button').forEach(function(link){
      link.addEventListener('click', function(){
        siteNav.classList.remove('open');
        menuBtn.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close drawer on click outside
    document.addEventListener('click', function(e){
      if (!siteNav.contains(e.target) && !menuBtn.contains(e.target)) {
        if (siteNav.classList.contains('open')) {
          siteNav.classList.remove('open');
          menuBtn.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  }


  // ====================================================
  // Mobile Snap Carousel Dots & Card Navigation Controller
  // ====================================================
  function initHomeCarousels() {
    var carousels = document.querySelectorAll('.home-cards-carousel');
    carousels.forEach(function(carousel){
      var carouselId = carousel.id;
      var dotsWrap = document.querySelector('.home-carousel-dots[data-carousel="' + carouselId + '"]');
      if (!dotsWrap) return;

      var dots = dotsWrap.querySelectorAll('.carousel-dot');
      var cards = carousel.querySelectorAll('.home-card-v2');
      if (!cards.length) return;

      // Update active dot on scroll
      var scrollTimeout;
      carousel.addEventListener('scroll', function(){
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function(){
          var scrollLeft = carousel.scrollLeft;
          var cardWidth = cards[0].offsetWidth + 14; // gap is 14px
          var activeIndex = Math.round(scrollLeft / cardWidth);
          activeIndex = Math.max(0, Math.min(activeIndex, dots.length - 1));

          dots.forEach(function(dot, idx){
            if (idx === activeIndex) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }, 35);
      }, { passive: true });

      // Click dot to scroll smoothly to that card
      dots.forEach(function(dot, idx){
        dot.addEventListener('click', function(){
          if (cards[idx]) {
            var targetScroll = cards[idx].offsetLeft - carousel.offsetLeft - 16;
            carousel.scrollTo({
              left: Math.max(0, targetScroll),
              behavior: 'smooth'
            });
          }
        });
      });
    });

    // Make entire home-card-v2 clickable with smooth transition
    document.addEventListener('click', function(e){
      var card = e.target.closest('.home-card-v2, .cap-card');
      if (card) {
        var page = card.getAttribute('data-page');
        var product = card.getAttribute('data-product');
        if (page) {
          if (typeof navigateTo === 'function') {
            navigateTo(page);
          } else {
            location.hash = '#' + page;
          }
          if (product && page === 'contact') {
            setTimeout(function(){
              var textarea = document.getElementById('rfq-msg') || document.getElementById('rfq-notes') || document.querySelector('textarea[name="message"], textarea[name="notes"]');
              if (textarea) textarea.value = 'Inquiry for ' + product;
            }, 100);
          }
        }
      }
    });
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeCarousels);
  } else {
    initHomeCarousels();
  }


  // ====================================================
  // Global Intelligent Scroll-Driven Multi-Page Animations
  // Handles: Products, About, Projects, Services, Contact & Home
  // ====================================================
  var globalScrollObserver = null;

  function initGlobalCardScrollAnimations(activePageName) {
    if (!activePageName) {
      var activeEl = document.querySelector('.page.active');
      activePageName = activeEl ? activeEl.id.replace('page-', '') : 'home';
    }

    var activePage = document.getElementById('page-' + activePageName);
    if (!activePage) return;

    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cleanly disconnect any previous observer on route change
    if (globalScrollObserver) {
      globalScrollObserver.disconnect();
      globalScrollObserver = null;
    }

    var animElements = [];

    // 1. Inner Hero Headers (Fade up on entrance)
    var innerHero = activePage.querySelector('.inner-hero-content');
    if (innerHero) {
      innerHero.classList.add('animate-fade-up');
      animElements.push(innerHero);
    }

    // 2. Products / Services / Projects Catalog Grids & Cards
    var catalogGrids = activePage.querySelectorAll('.catalog-grid');
    catalogGrids.forEach(function(grid){
      var cards = grid.querySelectorAll('.catalog-card');
      cards.forEach(function(card, idx){
        card.classList.remove('animate-from-left', 'animate-from-right', 'animate-fade-up');
        if (idx % 3 === 0) {
          card.classList.add('animate-from-left');
        } else if (idx % 3 === 1) {
          card.classList.add('animate-fade-up');
        } else {
          card.classList.add('animate-from-right');
        }
        animElements.push(card);
      });
    });

    // 3. About Page Industrial Narrative & Infrastructure Cards
    var aboutVCards = activePage.querySelectorAll('.about-vcard');
    aboutVCards.forEach(function(card, idx){
      card.classList.remove('animate-from-left', 'animate-from-right', 'animate-fade-up');
      card.classList.add(idx % 2 === 0 ? 'animate-from-left' : 'animate-from-right');
      animElements.push(card);
    });

    var facilityCards = activePage.querySelectorAll('.facility-card');
    facilityCards.forEach(function(card, idx){
      card.classList.remove('animate-from-left', 'animate-from-right', 'animate-fade-up');
      card.classList.add(idx % 2 === 0 ? 'animate-from-left' : 'animate-from-right');
      animElements.push(card);
    });

    var quoteBox = activePage.querySelector('.aeb-quote-box');
    if (quoteBox) {
      quoteBox.classList.add('animate-fade-up');
      animElements.push(quoteBox);
    }

    var pillarItems = activePage.querySelectorAll('.aeb-pillar-item');
    pillarItems.forEach(function(item, idx){
      item.classList.add('animate-fade-up');
      item.style.transitionDelay = (idx * 0.08) + 's';
      animElements.push(item);
    });

    // 4. Contact Page Cards & Form Elements
    var rfqCard = activePage.querySelector('#contact-rfq-card');
    if (rfqCard) {
      rfqCard.classList.remove('animate-from-left', 'animate-from-right');
      rfqCard.classList.add('animate-fade-up');
      animElements.push(rfqCard);
    }

    var solidFacilityCard = activePage.querySelector('.solid-facility-card');
    if (solidFacilityCard) {
      solidFacilityCard.classList.remove('animate-from-right');
      solidFacilityCard.classList.add('animate-from-left');
      animElements.push(solidFacilityCard);
    }

    var solidMapCard = activePage.querySelector('.solid-map-card');
    if (solidMapCard) {
      solidMapCard.classList.remove('animate-from-left');
      solidMapCard.classList.add('animate-from-right');
      animElements.push(solidMapCard);
    }

    var channelCards = activePage.querySelectorAll('.channel-card');
    channelCards.forEach(function(channel, idx){
      channel.classList.add('animate-fade-up');
      channel.style.transitionDelay = (idx * 0.06) + 's';
      animElements.push(channel);
    });

    var assessmentCard = activePage.querySelector('.assessment-card');
    if (assessmentCard) {
      assessmentCard.classList.add('animate-fade-up');
      animElements.push(assessmentCard);
    }

    // 5. Home Page Cards (Capabilities, Industries, Why Choose Us)
    var homeCards = activePage.querySelectorAll('.home-card-v2, .cap-card, .ref-ind-card, .ref-why-card');
    homeCards.forEach(function(card, idx){
      card.classList.remove('animate-from-left', 'animate-from-right', 'animate-fade-up');
      card.classList.add(idx % 2 === 0 ? 'animate-from-left' : 'animate-from-right');
      animElements.push(card);
    });

    // 6. Global CTA Cards on active page
    var ctaCards = activePage.querySelectorAll('.san-cta-card, .premium-contact-card, .simple-cta-box');
    ctaCards.forEach(function(cta){
      cta.classList.add('animate-fade-up');
      animElements.push(cta);
    });

    // If user prefers reduced motion or browser lacks IntersectionObserver, reveal immediately
    if (prefersReduced || !('IntersectionObserver' in window)) {
      animElements.forEach(function(el){
        el.classList.add('in-view');
      });
      return;
    }

    // Initialize IntersectionObserver with a gentle margin
    globalScrollObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          // Re-trigger animation when scrolled out and back in
          entry.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    var windowHeight = window.innerHeight;
    animElements.forEach(function(el, idx){
      var rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 40 && rect.bottom > 0) {
        // Element is visible above the fold on landing: reveal with progressive micro-stagger
        setTimeout(function(){
          el.classList.add('in-view');
        }, idx * 40);
      } else {
        // Element is further down: observe for scroll entrance
        el.classList.remove('in-view');
        globalScrollObserver.observe(el);
      }
    });
  }

  // Also re-apply when page tab changes (for single-page navigation)
  window.addEventListener('hashchange', function(){
    var hash = location.hash.replace('#', '') || 'home';
    setTimeout(function(){
      initGlobalCardScrollAnimations(hash);
    }, 100);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      initGlobalCardScrollAnimations();
    });
  } else {
    initGlobalCardScrollAnimations();
  }

})();
