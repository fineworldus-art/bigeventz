// Merchandise Page JavaScript
console.log('merchandise.js loaded');

// Quantity selector functions
window.updateQuantity = function(button, change) {
    console.log('updateQuantity called with change:', change);
    const quantityInput = button.parentElement.querySelector('.quantity-input');
    let currentValue = parseInt(quantityInput.value);
    let newValue = currentValue + change;
    
    if (newValue >= 1 && newValue <= 99) {
        quantityInput.value = newValue;
        console.log('Quantity updated to:', newValue);
    }
};

// Add to cart function
window.addToCart = function(button) {
    console.log('addToCart called');
    const productCard = button.closest('.product-card');
    const quantityInput = productCard.querySelector('.quantity-input');
    
    const product = {
        id: productCard.dataset.id,
        name: productCard.dataset.name,
        price: parseFloat(productCard.dataset.price),
        image: productCard.querySelector('.product-image').src,
        category: productCard.dataset.category
    };
    
    const quantity = parseInt(quantityInput.value);
    console.log('Adding to cart:', product.name, 'x', quantity);
    
    // Use the global cart instance from cart.js
    if (window.shoppingCart) {
        window.shoppingCart.addItem(product, quantity);
        // Reset quantity to 1
        quantityInput.value = 1;
    } else {
        console.error('Shopping cart not initialized!');
    }
};

// Filter functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up filters');
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            const products = document.querySelectorAll('.product-card');
            
            products.forEach(product => {
                if (category === 'all' || product.dataset.category === category) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
    
    console.log('Functions ready:', {
        updateQuantity: typeof window.updateQuantity,
        addToCart: typeof window.addToCart,
        shoppingCart: typeof window.shoppingCart
    });
});

