/**
 * Mobile Navigation and Responsive Features
 * 
 * This file handles mobile-specific functionality including:
 * - Hamburger menu toggle
 * - Mobile overlay
 * - Touch gestures
 * - Orientation changes
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
        setupMobileMenu();
        setupTouchGestures();
        setupOrientationChange();
        setupScrollBehavior();
    }
    
    /**
     * Mobile Menu Setup
     */
    function setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const nav = document.querySelector('nav');
        
        if (!hamburger || !nav) return;
        
        // Create mobile overlay
        let overlay = document.querySelector('.mobile-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);
        }
        
        // Toggle menu
        function toggleMenu() {
            const isActive = nav.classList.toggle('active');
            overlay.classList.toggle('active', isActive);
            hamburger.classList.toggle('active', isActive);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
            
            // Update ARIA attributes
            hamburger.setAttribute('aria-expanded', isActive);
        }
        
        // Hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Overlay click
        overlay.addEventListener('click', toggleMenu);
        
        // Close menu when clicking nav links
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    toggleMenu();
                }
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                toggleMenu();
            }
        });
        
        // Close menu on window resize to desktop
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && nav.classList.contains('active')) {
                    toggleMenu();
                }
            }, 250);
        });
    }
    
    /**
     * Touch Gestures for Mobile
     */
    function setupTouchGestures() {
        if (!('ontouchstart' in window)) return;
        
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        // Swipe to close menu
        nav.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        nav.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            
            // Swipe right to close (menu is on right side)
            if (swipeDistance > 50 && nav.classList.contains('active')) {
                const hamburger = document.querySelector('.hamburger');
                if (hamburger) hamburger.click();
            }
        }
    }
    
    /**
     * Handle Orientation Changes
     */
    function setupOrientationChange() {
        window.addEventListener('orientationchange', function() {
            // Close menu on orientation change
            const nav = document.querySelector('nav');
            const hamburger = document.querySelector('.hamburger');
            
            if (nav && nav.classList.contains('active') && hamburger) {
                hamburger.click();
            }
            
            // Adjust viewport height
            setTimeout(function() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }, 100);
        });
        
        // Set initial viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    /**
     * Smooth Scroll Behavior for Mobile
     */
    function setupScrollBehavior() {
        // Hide/show cart icon on scroll (mobile only)
        if (window.innerWidth <= 768) {
            const cartIcon = document.querySelector('.cart-icon');
            if (!cartIcon) return;
            
            let lastScrollTop = 0;
            let scrollTimer;
            
            window.addEventListener('scroll', function() {
                clearTimeout(scrollTimer);
                
                scrollTimer = setTimeout(function() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        // Scrolling down
                        cartIcon.style.transform = 'translateY(100px)';
                    } else {
                        // Scrolling up
                        cartIcon.style.transform = 'translateY(0)';
                    }
                    
                    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                }, 100);
            }, { passive: true });
        }
    }
    
    /**
     * Prevent iOS Safari bounce effect
     */
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.body.addEventListener('touchmove', function(e) {
            const target = e.target;
            const scrollable = target.closest('.scrollable, nav, .cart-items');
            
            if (!scrollable) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    /**
     * Add mobile class to body
     */
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    });
    
})();

