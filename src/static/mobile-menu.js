/**
 * Mobile Menu - Simple and Reliable
 * Based on ABBA Voyage mobile functionality model
 */

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Get elements
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.menu-close');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'menu-overlay';
      document.body.appendChild(overlay);
    }
    
    // Check if elements exist
    if (!menuToggle || !mainNav) {
      console.warn('Mobile menu elements not found');
      return;
    }
    
    // Open menu function
    function openMenu() {
      mainNav.classList.add('active');
      overlay.classList.add('active');
      menuToggle.classList.add('active');
      body.classList.add('menu-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      
      // Focus on first menu item
      const firstLink = mainNav.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 300);
      }
    }
    
    // Close menu function
    function closeMenu() {
      mainNav.classList.remove('active');
      overlay.classList.remove('active');
      menuToggle.classList.remove('active');
      body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      
      // Return focus to toggle button
      menuToggle.focus();
    }
    
    // Toggle menu function
    function toggleMenu() {
      if (mainNav.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    }
    
    // Event listeners
    menuToggle.addEventListener('click', toggleMenu);
    
    if (menuClose) {
      menuClose.addEventListener('click', closeMenu);
    }
    
    overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking nav links
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
    
    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mainNav.classList.contains('active')) {
        closeMenu();
      }
    });
    
    // Close menu on window resize to desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth >= 1025 && mainNav.classList.contains('active')) {
          closeMenu();
        }
      }, 250);
    });
    
    // Prevent scroll on body when menu is open (iOS fix)
    let scrollY = 0;
    mainNav.addEventListener('transitionend', function() {
      if (mainNav.classList.contains('active')) {
        scrollY = window.scrollY;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
      } else {
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        window.scrollTo(0, scrollY);
      }
    });
    
    console.log('✅ Mobile menu initialized successfully');
  }
})();

