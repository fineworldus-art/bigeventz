/**
 * Header Cart Icon Count Updater
 * 
 * This script updates the cart count badge in the header
 * across all pages of the website.
 */

(function() {
    'use strict';
    
    // Update header cart count
    function updateHeaderCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('headerCartCount');
        
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateHeaderCartCount);
    } else {
        updateHeaderCartCount();
    }
    
    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateHeaderCartCount();
        }
    });
    
    // Listen for custom cart update events (same page)
    window.addEventListener('cartUpdated', updateHeaderCartCount);
    
    // Expose function globally for cart.js to use
    window.updateHeaderCartCount = updateHeaderCartCount;
    
})();

