(function () {
  'use strict';

  var APPS_SCRIPT_URL = 'ВСТАВЬТЕ_URL_ВЕБ_ПРИЛОЖЕНИЯ_APPS_SCRIPT';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealItems = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      burger.classList.toggle('is-active', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  var phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var digits = phoneInput.value.replace(/\D/g, '');

      if (!digits) { phoneInput.value = ''; return; }
      if (digits[0] === '8') digits = '7' + digits.slice(1);
      if (digits[0] !== '7') digits = '7' + digits;
      digits = digits.slice(0, 11);

      var out = '+7';
      if (digits.length > 1) out += ' (' + digits.slice(1, 4);
      if (digits.length >= 5) out += ') ' + digits.slice(4, 7);
      if (digits.length >= 8) out += '-' + digits.slice(7, 9);
      if (digits.length >= 10) out += '-' + digits.slice(9, 11);

      phoneInput.value = out;
    });

    phoneInput.addEventListener('blur', function () {
      if (phoneInput.value.replace(/\D/g, '').length <= 1) phoneInput.value = '';
    });
  }

  var form = document.getElementById('applyForm');
  var formSuccess = document.getElementById('formSuccess');
  var successModal = document.getElementById('successModal');

  function openSuccessModal() {
    if (!successModal) return;
    successModal.hidden = false;
    document.body.style.overflow = 'hidden';
    var btn = successModal.querySelector('.modal__close');
    if (btn) btn.focus();
  }

  function closeSuccessModal() {
    if (!successModal) return;
    successModal.hidden = true;
    document.body.style.overflow = '';
  }

  if (successModal) {
    successModal.querySelectorAll('[data-close-success]').forEach(function (el) {
      el.addEventListener('click', closeSuccessModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !successModal.hidden) closeSuccessModal();
    });
  }

  function setError(name, message) {
    var input = document.getElementById(name);
    var errorEl = document.querySelector('[data-error-for="' + name + '"]');
    var field = input ? input.closest('.field') : null;

    if (field) field.classList.toggle('field--error', Boolean(message));
    if (errorEl) {
      errorEl.textContent = message || '';
      errorEl.classList.toggle('is-visible', Boolean(message));
    }
  }

  if (form) {
    var nameInput = document.getElementById('name');
    var consentInput = document.getElementById('consent');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var isValid = true;

      var nameValue = nameInput.value.trim();
      if (nameValue.length < 2) {
        setError('name', 'Укажите имя (минимум 2 символа)');
        isValid = false;
      } else {
        setError('name', '');
      }

      var phoneDigits = phoneInput.value.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        setError('phone', 'Введите телефон полностью');
        isValid = false;
      } else {
        setError('phone', '');
      }

      if (!consentInput.checked) {
        setError('consent', 'Отметьте согласие на обработку данных');
        isValid = false;
      } else {
        setError('consent', '');
      }

      if (!isValid) {
        var firstError = form.querySelector('.field--error .field__input, .field__error.is-visible');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('http') !== 0) {
        alert('Форма временно недоступна. Пожалуйста, позвоните нам: +7 (916) 145-29-99');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем...';

      var payload = {
        name: nameInput.value.trim(),
        phone: phoneInput.value,
        message: document.getElementById('message').value.trim(),
        page: 'Вакансия: Слесарь-сборщик',
        source: 'landing-vacancy'
      };

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        redirect: 'follow',
        body: JSON.stringify(payload)
      })
        .then(function () {
          form.hidden = true;
          if (formSuccess) formSuccess.hidden = false;
          openSuccessModal();
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          alert('Не удалось отправить заявку. Пожалуйста, позвоните нам: +7 (916) 145-29-99');
        });
    });

    [nameInput, phoneInput, consentInput].forEach(function (el) {
      if (!el) return;
      var key = el.id === 'consent' ? 'consent' : el.id;
      el.addEventListener('input', function () { setError(key, ''); });
      el.addEventListener('change', function () {
        if (el.id === 'consent') setError('consent', '');
      });
    });
  }

  var privacyModal = document.getElementById('privacyModal');

  function openPrivacy() {
    if (!privacyModal) return;
    privacyModal.hidden = false;
    document.body.style.overflow = 'hidden';
    var closeBtn = privacyModal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closePrivacy() {
    if (!privacyModal) return;
    privacyModal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-privacy]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openPrivacy();
    });
  });

  if (privacyModal) {
    privacyModal.querySelectorAll('[data-close-privacy]').forEach(function (el) {
      el.addEventListener('click', closePrivacy);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !privacyModal.hidden) closePrivacy();
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();