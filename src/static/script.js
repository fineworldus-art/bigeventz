// script.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired!");
  const languageSelect = document.getElementById("languageSelect");
  
  // Call applyTranslations from translations.js
  if (languageSelect && typeof window.applyTranslations === 'function') {
    languageSelect.addEventListener("change", () => window.applyTranslations(languageSelect.value));
    window.applyTranslations(languageSelect.value); // Apply translations on initial load
  }

  // Ticket Form Logic
  const ticketForm = document.getElementById("ticketForm");
  const paymentRadios = document.querySelectorAll("input[name='payment']");
  const cardDetailsDiv = document.getElementById("cardDetails");
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  const ticketSummary = document.getElementById("ticketSummary");
  const qrCodeDiv = document.getElementById("qrCode");

  console.log("ticketForm:", ticketForm);
  console.log("paymentRadios count:", paymentRadios.length);
  console.log("cardDetailsDiv:", cardDetailsDiv);

  if (ticketForm) {
    console.log("Inside ticketForm if block");
    // Show/hide card details based on payment method selection
    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "Credit Card") {
          cardDetailsDiv.classList.remove("hidden");
          // Make card detail fields required when visible
          cardDetailsDiv.querySelectorAll("input").forEach(input => input.setAttribute("required", ""));
        } else {
          cardDetailsDiv.classList.add("hidden");
          // Remove required attribute when hidden
          cardDetailsDiv.querySelectorAll("input").forEach(input => input.removeAttribute("required"));
        }
      });
    });

    // Initial check: show card details if Credit Card is pre-selected
    setTimeout(() => {
      const selectedPayment = document.querySelector("input[name='payment']:checked");
      console.log("Initial check - selectedPayment:", selectedPayment);
      console.log("Initial check - selectedPayment value:", selectedPayment ? selectedPayment.value : "none");
      if (selectedPayment && selectedPayment.value === "Credit Card") {
        console.log("Removing hidden class from cardDetails");
        cardDetailsDiv.classList.remove("hidden");
        cardDetailsDiv.querySelectorAll("input").forEach(input => input.setAttribute("required", ""));
      }
    }, 500);

    // Function to validate credit card expiry date (MM/YY or MM/YYYY)
    function validateExpiryDate(expiryDate) {
      const parts = expiryDate.split("/");
      if (parts.length !== 2) return false;
      let month = parseInt(parts[0], 10);
      let year = parseInt(parts[1], 10);
      if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return false;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      if (year < 100) {
        const century = Math.floor(currentYear / 100) * 100;
        year = century + year;
        if (year < currentYear) year += 100;
      }
      if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
      return true;
    }

    ticketForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Form submit handler called!");
      console.log("--- Starting form data collection ---");

      // Reset messages
      successMessage.style.display = "none";
      errorMessage.style.display = "none";
      ticketSummary.style.display = "none";

      const eventSelect = document.getElementById("eventSelect");
      const quantity = document.getElementById("quantity").value;
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();
      const selectedPaymentMethodRadio = document.querySelector("input[name='payment']:checked");
      const paymentMethod = selectedPaymentMethodRadio ? selectedPaymentMethodRadio.value : null;

      console.log("Collected Form Data:", {
        event: eventSelect.value,
        quantity: quantity,
        name: name,
        email: email,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
      });

      console.log("--- Starting validation ---");
      const getTranslation = window.getTranslation;

      console.log("Validating basic fields...");
      if (!eventSelect.value || !quantity || !name || !email || !phone || !address) {
        errorMessage.textContent = getTranslation("fillAllFields");
        errorMessage.style.display = "block";
        console.log("Basic field validation failed");
        return;
      }

      console.log("Validating payment method...");
      if (!paymentMethod) {
        errorMessage.textContent = getTranslation("selectPaymentMethod");
        errorMessage.style.display = "block";
        console.log("Payment method validation failed");
        return;
      }

      let cardName, cardNumber, expiry, cvv;
      if (paymentMethod === "Credit Card") {
        console.log("Validating Credit Card details...");
        cardName = document.getElementById("cardName").value.trim();
        cardNumber = document.getElementById("cardNumber").value.trim();
        expiry = document.getElementById("expiry").value;
        cvv = document.getElementById("cvv").value.trim();
        if (!cardName || !cardNumber || !expiry || !cvv) {
          errorMessage.textContent = getTranslation("completeCardDetails");
          errorMessage.style.display = "block";
          console.log("Card details validation failed");
          return;
        }
        if (!validateExpiryDate(expiry)) {
          errorMessage.textContent = getTranslation("invalidExpiryDate");
          errorMessage.style.display = "block";
          console.log("Expiry date validation failed");
          return;
        }
      }

      console.log("--- Validation complete. Preparing API call ---");
      let response;
      try {
        const requestBody = {
          event: eventSelect.value,
          numTickets: quantity,
          name: name,
          email: email,
          phone: phone,
          address: address,
          paymentMethod: paymentMethod,
          cardNumber: cardNumber,
          cardName: cardName,
          expiryDate: expiry,
          cvv: cvv
        };
console.log("Sending API request to full URL: " + window.location.origin + "/api/tickets with body:", JSON.stringify(requestBody));
        console.log("Sending API request to /api/tickets with body:", JSON.stringify(requestBody));

        response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log("API response status:", response.status);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to purchase ticket');
        }
        
        response = data;
      } catch (error) {
        console.log("Error caught during fetch:", error);
        console.log("Error message:", error.message);
        errorMessage.textContent = error.message || getTranslation("purchaseError");
        errorMessage.style.display = "block";
        return;
      }

      if (response.success) {
        successMessage.textContent = `${getTranslation("ticketPurchasedSuccessfully")}${response.ticketId}`;
        successMessage.style.display = "block";
        ticketSummary.style.display = "block";
        
        // Build the ticket summary HTML
        const summaryHTML = `
          <h3>Ticket Summary</h3>
          <div style="text-align: left; max-width: 600px; margin: 0 auto;">
            <p><strong>Event:</strong> ${response.event}</p>
            <p><strong>Number of Tickets:</strong> ${response.numTickets}</p>
            <p><strong>Attendee Name:</strong> ${response.attendeeName}</p>
            <p><strong>Email:</strong> ${response.attendeeEmail}</p>
            <p><strong>Phone:</strong> ${response.attendeePhone}</p>
            <p><strong>Payment Method:</strong> ${response.paymentMethod}</p>
            ${response.cardLastFour ? `<p><strong>Card:</strong> **** **** **** ${response.cardLastFour}</p>` : ''}
            <p><strong>Total Amount:</strong> £${response.totalAmount}</p>
            <p><strong>Ticket ID:</strong> ${response.ticketId}</p>
          </div>
          <div id="qrCode" style="margin-top: 1.5rem;"></div>
        `;
        
        ticketSummary.innerHTML = summaryHTML;
        
        // Add QR code
        const qrCodeDiv = document.getElementById("qrCode");
        if (qrCodeDiv && response.qrCode) {
          qrCodeDiv.innerHTML = `<img src="${response.qrCode}" alt="QR Code" style="max-width: 300px; height: auto;">`;
        }
      }
    });
  }
});

// Event filtering functionality for events.html
const filterButtons = document.querySelectorAll('.filter-btn');
const eventCards = document.querySelectorAll('.card');

if (filterButtons.length > 0 && eventCards.length > 0) {
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get the selected category
      const selectedCategory = this.getAttribute('data-category');
      
      // Filter events
      eventCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (selectedCategory === 'all') {
          // Show all events
          card.style.display = 'block';
        } else {
          // Check if card category includes the selected category
          if (cardCategory && cardCategory.includes(selectedCategory)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });
}

// Search functionality for events.html
const searchInput = document.getElementById('searchInput');
if (searchInput && eventCards.length > 0) {
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    eventCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const location = card.querySelector('.location')?.textContent.toLowerCase() || '';
      const description = card.querySelector('p:not(.date):not(.location)')?.textContent.toLowerCase() || '';
      
      if (title.includes(searchTerm) || location.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}



// ==========================================================================
// MOBILE NAVIGATION - HAMBURGER MENU
// ==========================================================================

// Initialize mobile menu functionality
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const body = document.body;
  
  // Only proceed if mobile menu toggle exists
  if (!mobileMenuToggle || !mainNav) {
    return;
  }
  
  // Create overlay element
  let overlay = document.querySelector('.menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
  }
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    const isActive = mainNav.classList.contains('active');
    
    if (isActive) {
      // Close menu
      mainNav.classList.remove('active');
      overlay.classList.remove('active');
      body.classList.remove('menu-open');
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    } else {
      // Open menu
      mainNav.classList.add('active');
      overlay.classList.add('active');
      body.classList.add('menu-open');
      mobileMenuToggle.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
  }
  
  // Close mobile menu
  function closeMobileMenu() {
    mainNav.classList.remove('active');
    overlay.classList.remove('active');
    body.classList.remove('menu-open');
    mobileMenuToggle.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }
  
  // Event listeners
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  
  // Close menu when clicking overlay
  overlay.addEventListener('click', closeMobileMenu);
  
  // Close menu when clicking a navigation link
  const navLinks = mainNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  
  // Close menu on window resize to desktop size
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    }, 250);
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mainNav.classList.contains('active')) {
      closeMobileMenu();
    }
  });
}

// Initialize mobile menu when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}

// ==========================================================================
// VIEW MODE INDICATOR (for testing/development)
// Uncomment the line below to show current viewport mode indicator
// ==========================================================================

// document.body.classList.add('show-view-mode');

