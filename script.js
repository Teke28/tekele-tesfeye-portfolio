document.addEventListener('DOMContentLoaded', () => {
  // ==================== CONFIGURATION ====================
  const CONFIG = {
    particles: {
      count: window.innerWidth < 768 ? 30 : 100,
      color: 'rgba(255, 255, 255, 0.8)',
      connectionColor: 'rgba(255,255,255,',
      maxDistance: 100
    },
    animations: {
      skillBars: {
        duration: 1500,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
      },
      scrollReveal: {
        distance: '50px',
        duration: 1000,
        easing: 'ease-in-out',
        mobile: true,
        viewFactor: 0.1
      }
    },
    form: {
      minMessageLength: 10,
      maxNameLength: 30,
      submitDelay: 1500
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const debounce = (func, wait = 100) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const throttle = (func, limit = 100) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ==================== MOBILE NAVIGATION ====================
  const initMobileNavigation = () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!hamburger || !navMenu) return;

    // Set initial ARIA attributes
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-controls', 'nav-menu');
    navMenu.setAttribute('id', 'nav-menu');

    const toggleMenu = (shouldClose = false) => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      const willExpand = shouldClose ? false : !isExpanded;
      
      navMenu.classList.toggle('active', willExpand);
      hamburger.setAttribute('aria-expanded', willExpand.toString());
      document.body.style.overflow = willExpand ? 'hidden' : '';
      
      // Toggle hamburger icon
      const icon = hamburger.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !willExpand);
        icon.classList.toggle('fa-times', willExpand);
      }
    };

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(true));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenu(true);
      }
    });

    hamburger.addEventListener('click', () => toggleMenu());
  };

  // ==================== PARTICLES BACKGROUND ====================
  const initParticles = () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
    };

    class Particle {
      constructor() {
        this.reset();
        this.size = Math.random() * 3 + 1;
      }
      
      reset() {
        const rect = canvas.getBoundingClientRect();
        this.x = Math.random() * rect.width;
        this.y = Math.random() * rect.height;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
      }
      
      update() {
        const rect = canvas.getBoundingClientRect();
        
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x < 0 || this.x > rect.width) this.speedX *= -1;
        if (this.y < 0 || this.y > rect.height) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = CONFIG.particles.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      drawConnections(otherParticles) {
        otherParticles.forEach(p => {
          const dx = this.x - p.x;
          const dy = this.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONFIG.particles.maxDistance) {
            ctx.strokeStyle = `${CONFIG.particles.connectionColor}${1 - dist/CONFIG.particles.maxDistance}`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        });
      }
    }

    const createParticles = () => {
      particles = Array.from({ length: CONFIG.particles.count }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
        p.drawConnections(particles);
      });
      
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = debounce(() => {
      resizeCanvas();
      createParticles();
    }, 200);

    // Initialize
    resizeCanvas();
    createParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  };

  // ==================== SKILL BAR ANIMATIONS ====================
  const initSkillBars = () => {
    const skillBars = document.querySelectorAll('.skill-fill');
    if (!skillBars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            const targetWidth = entry.target.style.getPropertyValue('--fill-width') || '0%';
            
            entry.target.style.transition = `width ${CONFIG.animations.skillBars.duration}ms ${CONFIG.animations.skillBars.easing}`;
            entry.target.style.width = '0';
            
            // Force reflow
            void entry.target.offsetWidth;
            
            entry.target.style.width = targetWidth;
            entry.target.dataset.animated = 'true';
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.animations.skillBars.threshold,
        rootMargin: CONFIG.animations.skillBars.rootMargin
      }
    );

    skillBars.forEach(bar => {
      bar.style.width = '0';
      observer.observe(bar);
    });
  };

  // ==================== FORM VALIDATION ====================
  const initFormValidation = () => {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    const createErrorElement = (input) => {
      const error = document.createElement('div');
      error.className = 'error-message';
      input.parentNode.appendChild(error);
      return error;
    };

    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
      const emailError = createErrorElement(emailInput);
      
      emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (email && !isValid) {
          emailInput.setCustomValidity('Please enter a valid email address');
          emailError.textContent = 'Please enter a valid email';
          emailInput.classList.add('invalid');
        } else {
          emailInput.setCustomValidity('');
          emailError.textContent = '';
          emailInput.classList.remove('invalid');
        }
      });
    }

    // Name validation
    const setupNameValidation = (input) => {
      const error = createErrorElement(input);
      
      input.addEventListener('input', () => {
        let value = input.value.replace(/[^a-zA-Z\s-']/g, '');
        
        if (value.length > CONFIG.form.maxNameLength) {
          value = value.substring(0, CONFIG.form.maxNameLength);
          error.textContent = `Maximum ${CONFIG.form.maxNameLength} characters`;
          input.classList.add('invalid');
        } else {
          error.textContent = '';
          input.classList.remove('invalid');
        }
        
        // Capitalize first letter of each word
        input.value = value.toLowerCase().replace(/(^|\s)\S/g, char => char.toUpperCase());
      });
    };

    ['firstname', 'lastname'].forEach(id => {
      const input = document.getElementById(id);
      if (input) setupNameValidation(input);
    });

    // Message validation
    const messageInput = document.getElementById('message');
    if (messageInput) {
      const error = createErrorElement(messageInput);
      
      messageInput.addEventListener('input', () => {
        if (messageInput.value.length < CONFIG.form.minMessageLength) {
          error.textContent = `Message must be at least ${CONFIG.form.minMessageLength} characters`;
          messageInput.classList.add('invalid');
        } else {
          error.textContent = '';
          messageInput.classList.remove('invalid');
        }
      });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!form.checkValidity()) {
        const invalidField = form.querySelector(':invalid');
        if (invalidField) invalidField.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, CONFIG.form.submitDelay));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Message sent successfully!';
        form.appendChild(successMsg);
        
        setTimeout(() => {
          form.reset();
          successMsg.remove();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 3000);
      } catch (error) {
        console.error('Form submission error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Try Again';
      }
    });
  };

  // ==================== SCROLL ANIMATIONS ====================
  const initScrollAnimations = () => {
    if (typeof ScrollReveal === 'undefined') return;

    const sr = ScrollReveal(CONFIG.animations.scrollReveal);

    const revealConfig = {
      hero: { 
        delay: 100,
        origin: 'bottom',
        distance: '100px'
      },
      sectionTitles: { 
        delay: 200,
        origin: 'top',
        rotate: { x: 20 }
      },
      skills: { 
        origin: 'left', 
        interval: 100,
        scale: 0.9
      },
      projects: { 
        origin: 'bottom', 
        scale: 0.95, 
        opacity: 0, 
        interval: 150,
        viewFactor: 0.2
      },
      contact: { 
        delay: 300,
        interval: 100,
        origin: 'right'
      }
    };

    sr.reveal('.hero-content', revealConfig.hero);
    sr.reveal('.section-title', revealConfig.sectionTitles);
    sr.reveal('.skill-card', revealConfig.skills);
    sr.reveal('.project-card', revealConfig.projects);
    sr.reveal('.contact-wrapper > *', revealConfig.contact);

    document.body.classList.add('sr-loaded');
  };

  // ==================== SMOOTH SCROLL ====================
  const initSmoothScroll = () => {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    if (!scrollLinks.length) return;

    const headerHeight = document.querySelector('.navbar').offsetHeight;
    const scrollOffset = headerHeight + 20;

    const scrollToTarget = (target) => {
      const targetElement = document.querySelector(target);
      if (!targetElement) return;
      
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - scrollOffset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    };

    scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        
        // Close mobile menu if open
        const hamburger = document.querySelector('.hamburger');
        if (hamburger?.getAttribute('aria-expanded') === 'true') {
          hamburger.click();
        }
        
        scrollToTarget(target);
        
        // Update URL
        history.pushState(null, null, target);
      });
    });
    
    // Handle initial hash
    if (window.location.hash) {
      setTimeout(() => scrollToTarget(window.location.hash), 100);
    }
  };

  // ==================== BACK TO TOP BUTTON ====================
  const initBackToTop = () => {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;

    const toggleVisibility = throttle(() => {
      backToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    }, 100);

    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, null, window.location.pathname);
    });

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Initial check
  };

  // ==================== DARK MODE TOGGLE ====================
  const initDarkMode = () => {
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle floating-btn';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    document.body.appendChild(darkModeToggle);
    
    const setDarkMode = (isDark) => {
      document.body.classList.toggle('dark-mode', isDark);
      darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('darkMode', isDark);
    };
    
    darkModeToggle.addEventListener('click', () => {
      setDarkMode(!document.body.classList.contains('dark-mode'));
    });
    
    // Initialize from localStorage or prefer-color-scheme
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else if (prefersDark) {
      setDarkMode(true);
    }
  };

  // ==================== FOOTER YEAR ====================
  const updateFooterYear = () => {
    const yearElement = document.getElementById('year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
  };

  // ==================== PROJECT CARD HOVER EFFECTS ====================
  const initProjectCardEffects = () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  // ==================== INITIALIZE ALL ====================
  const init = () => {
    initMobileNavigation();
    initParticles();
    initSkillBars();
    initFormValidation();
    initScrollAnimations();
    initSmoothScroll();
    initBackToTop();
    initDarkMode();
    updateFooterYear();
    initProjectCardEffects();
  };

  init();
});