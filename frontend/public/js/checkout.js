// /public/js/checkout.js
document.addEventListener('DOMContentLoaded', async () => {
  const shippingForm = document.getElementById('shippingForm');
  const paymentForm = document.getElementById('paymentForm');
  const reviewSection = document.getElementById('reviewSection');
  const popup = document.getElementById('popupContainer');
  const steps = document.querySelectorAll('.step');
  const toPayment = document.getElementById('toPayment');
  const backToShipping = document.getElementById('backToShipping');
  const toReview = document.getElementById('toReview');
  const backToPayment = document.getElementById('backToPayment');
  const placeOrder = document.getElementById('placeOrder');
  const reviewDetails = document.getElementById('reviewDetails');
  const countrySelect = document.getElementById('country');

  // 🌍 Load all countries dynamically WITH FLAGS + fallback
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    const data = await response.json();
    data.sort((a, b) => a.name.common.localeCompare(b.name.common));

    countrySelect.innerHTML = '<option value="">Select Country</option>';

    const getFlagEmoji = (code) =>
      code.toUpperCase().replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt())
      );

    data.forEach((country) => {
      const option = document.createElement("option");
      const code = country.cca2 || "XX";
      const flag = getFlagEmoji(code);
      option.value = code;
      option.textContent = `${flag} ${country.name.common}`;
      countrySelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load countries:", err);
    // 🧩 Fallback list
    const fallbackCountries = [
      { code: "US", name: "United States" },
      { code: "KE", name: "Kenya" },
      { code: "GB", name: "United Kingdom" },
      { code: "CA", name: "Canada" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "IN", name: "India" },
    ];
    countrySelect.innerHTML = '<option value="">Select Country</option>';
    fallbackCountries.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.code;
      option.textContent = c.name;
      countrySelect.appendChild(option);
    });
  }

  // 🌀 Sync checkout summary with backend cart session
  async function syncCartSummary() {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      const summaryList = document.getElementById('summaryList');
      if (!summaryList) return;

      summaryList.innerHTML = '';

      data.cart.forEach(item => {
        summaryList.innerHTML += `
          <div class="summary-line">
            <span>${item.name} × ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `;
      });

      const totalElem = document.querySelector('.summary-total span:last-child');
      if (totalElem) totalElem.textContent = `$${data.subtotal.toFixed(2)}`;

      await updateSummaryTotals();
    } catch (err) {
      console.error('❌ Error syncing cart:', err);
    }
  }

  // 💱 Instead of inserting or showing a currency selector,
  // we just define a hidden element to keep logic stable.
  let currencySelect = document.createElement("select");
  currencySelect.id = "currency";
  currencySelect.style.display = "none";
  currencySelect.innerHTML = `
    <option value="usd" selected>USD</option>
    <option value="kes">KES</option>
    <option value="eur">EUR</option>
    <option value="gbp">GBP</option>
    <option value="cad">CAD</option>
    <option value="inr">INR</option>
  `;
  document.body.appendChild(currencySelect);

  // 💱 Fetch live exchange rates from exchangerate.host
  let exchangeRates = { usd: 1, kes: 130, eur: 0.9, gbp: 0.8, cad: 1.35, inr: 83 }; // fallback
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=USD,KES,EUR,GBP,CAD,INR");
    const data = await res.json();
    if (data && data.rates) {
      exchangeRates = {
        usd: data.rates.USD || 1,
        kes: data.rates.KES || 130,
        eur: data.rates.EUR || 0.9,
        gbp: data.rates.GBP || 0.8,
        cad: data.rates.CAD || 1.35,
        inr: data.rates.INR || 83,
      };
      console.log("💱 Live exchange rates loaded:", exchangeRates);
    }
  } catch (err) {
    console.warn("⚠️ Using fallback exchange rates:", exchangeRates);
  }

  // 🚚 Shipping fee table
  const shippingRates = {
    US: { usd: 8, kes: 1000, eur: 7.3, gbp: 6.4 },
    KE: { usd: 20, kes: 2600, eur: 18.2, gbp: 15.8 },
    GB: { usd: 15, kes: 1950, eur: 13.8, gbp: 12.1 },
    CA: { usd: 10, kes: 1300, eur: 9.1, gbp: 8.0 },
    FR: { usd: 14, kes: 1820, eur: 13.0, gbp: 11.5 },
    DE: { usd: 14, kes: 1820, eur: 13.0, gbp: 11.5 },
    IN: { usd: 18, kes: 2340, eur: 16.7, gbp: 14.8 },
    DEFAULT: { usd: 22, kes: 2850, eur: 20.4, gbp: 18.2 }
  };

  // 🧾 Tax rates
  const taxRates = {
    US: 0.08875,
    KE: 0.16,
    GB: 0.20,
    CA: 0.13,
    FR: 0.20,
    DE: 0.19,
    IN: 0.18,
    DEFAULT: 0.10
  };

  function getShippingFee(countryCode, currency, subtotalUsd) {
    const base = shippingRates[countryCode] || shippingRates.DEFAULT;
    let shipping = base[currency] || base.usd;

    if (subtotalUsd >= 150) {
      shipping = 0;
    } else if (subtotalUsd >= 75) {
      shipping *= 0.5;
    }

    return shipping;
  }

  function getTaxRate(countryCode) {
    return taxRates[countryCode] || taxRates.DEFAULT;
  }

  function formatPrice(amount, currency) {
    const symbols = { usd: '$', kes: 'KES ', eur: '€', gbp: '£', cad: 'CA$', inr: '₹' };
    return `${symbols[currency] || '$'}${amount.toFixed(2)}`;
  }

  async function updateSummaryTotals() {
    const currency = currencySelect.value;
    const country = countrySelect?.value || '';
    const rate = exchangeRates[currency.toLowerCase()] || 1;

    try {
      // ✅ Fetch latest cart to ensure accurate calculations
      const cartRes = await fetch('/api/cart');
      const { cart } = await cartRes.json();

      // ✅ Calculate subtotal in USD first (cart prices are in USD)
      const subtotalUSD = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      
      // ✅ Convert subtotal to selected currency
      const subtotal = subtotalUSD * rate;

      // ✅ Update item display in summary
      const summaryList = document.getElementById('summaryList');
      if (summaryList) {
        summaryList.innerHTML = '';
        cart.forEach(item => {
          const convertedPrice = item.price * rate;
          summaryList.innerHTML += `
            <div class="summary-line">
              <span>${item.name} × ${item.quantity}</span>
              <span>${formatPrice(convertedPrice * item.quantity, currency)}</span>
            </div>
          `;
        });
      }

      // ✅ Calculate shipping and tax in selected currency
      let shippingFee = 0;
      let taxAmount = 0;

      if (country && country !== 'DEFAULT') {
        shippingFee = getShippingFee(country, currency, subtotalUSD);
        const taxRate = getTaxRate(country);
        taxAmount = +(subtotal * taxRate).toFixed(2);
      }

      const totalAmount = +(subtotal + shippingFee + taxAmount).toFixed(2);

      // ✅ Update all summary elements
      const subtotalElem = document.querySelector('.summary-subtotal span:last-child');
      const shippingElem = document.querySelector('.summary-shipping span:last-child');
      const taxElem = document.querySelector('.summary-tax span:last-child');
      const totalElem = document.querySelector('.summary-total strong:last-child, .summary-total span:last-child');

      if (subtotalElem) subtotalElem.textContent = formatPrice(subtotal, currency);
      if (shippingElem) shippingElem.textContent = formatPrice(shippingFee, currency);
      if (taxElem) taxElem.textContent = formatPrice(taxAmount, currency);
      if (totalElem) totalElem.textContent = formatPrice(totalAmount, currency);
    } catch (err) {
      console.error('❌ Error updating summary totals:', err);
    }
  }

  // 🌍 Auto-select currency based on country (no dropdown)
  countrySelect.addEventListener('change', async () => {
    const map = {
      KE: 'kes',
      US: 'usd',
      GB: 'gbp',
      CA: 'cad',
      IN: 'inr',
      FR: 'eur',
      DE: 'eur',
      IT: 'eur',
      ES: 'eur'
    };
    currencySelect.value = map[countrySelect.value] || 'usd';
    await updateSummaryTotals();
  });

  // 🚀 Step navigation + validation
  toPayment.addEventListener('click', () => {
    if (validateShippingForm()) {
      shippingForm.classList.add('hidden');
      paymentForm.classList.remove('hidden');
      updateSteps(2);
    } else openPopup();
  });

  backToShipping.addEventListener('click', () => {
    paymentForm.classList.add('hidden');
    shippingForm.classList.remove('hidden');
    updateSteps(1);
  });

  toReview.addEventListener('click', async () => {
    if (validatePaymentForm()) {
      paymentForm.classList.add('hidden');
      reviewSection.classList.remove('hidden');
      updateSteps(3);
      displayReview();
      await updateSummaryTotals();
    } else openPopup();
  });

  backToPayment.addEventListener('click', () => {
    reviewSection.classList.add('hidden');
    paymentForm.classList.remove('hidden');
    updateSteps(2);
  });

  // 💳 Stripe checkout
  placeOrder.addEventListener('click', async () => {
  try {
    // ✅ Fetch latest cart from backend to ensure quantities & prices are accurate
    const cartRes = await fetch('/api/cart');
    const { cart } = await cartRes.json();

    // ✅ Grab country + currency from UI
    const country = countrySelect?.value || 'DEFAULT';
    const currency = currencySelect?.value || 'usd';
    const rate = exchangeRates[currency.toLowerCase()] || 1;

    // ✅ Calculate subtotal in USD first (cart prices are in USD)
    const subtotalUSD = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    
    // ✅ Convert subtotal to selected currency
    const subtotal = subtotalUSD * rate;
    
    // ✅ Calculate tax on converted subtotal
    const taxRate = taxRates[country] || taxRates.DEFAULT;
    const tax = +(subtotal * taxRate).toFixed(2);
    
    // ✅ Get shipping fee in selected currency (function already handles conversion)
    const shippingFee = getShippingFee(country, currency, subtotalUSD);
    
    // ✅ Calculate total in selected currency
    const total = +(subtotal + tax + shippingFee).toFixed(2);

    // ✅ Build items array with CONVERTED prices for Stripe
    const items = cart.map(i => ({
      name: `${i.name} × ${i.quantity}`,
      quantity: i.quantity,
      price: +(i.price * rate).toFixed(2) // Convert price to selected currency
    }));

    console.log('🧾 Checkout summary:', { 
      currency, 
      rate, 
      subtotalUSD, 
      subtotal, 
      shippingFee, 
      tax, 
      total,
      items 
    });

    // ✅ Send data to backend to create Stripe Checkout Session
    const res = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        country,
        currency,
        subtotal,
        shippingFee,
        tax,
        total
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Payment session failed to start.');
    }
  } catch (err) {
    console.error('❌ Checkout session error:', err);
    alert('Error starting payment process.');
  }
});

  // ✅ Validation + Helpers
  function validateShippingForm() {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'country', 'zip'];
    return fields.every(id => document.getElementById(id)?.value.trim() !== '');
  }

  function validatePaymentForm() {
    const fields = ['cardNumber', 'expiry', 'cvv', 'cardName'];
    return fields.every(id => document.getElementById(id)?.value.trim() !== '');
  }

  function updateSteps(activeStep) {
    steps.forEach((step, index) => step.classList.toggle('active', index + 1 === activeStep));
  }

  function openPopup() { popup.classList.remove('hidden'); }
  window.closePopup = () => popup.classList.add('hidden');

  function displayReview() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zip = document.getElementById('zip').value;
    const country = countrySelect?.options[countrySelect.selectedIndex]?.text || '';
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;

    reviewDetails.innerHTML = `
      <p><strong>Shipping Address:</strong><br>${firstName} ${lastName}<br>${address}, ${city}, ${zip}<br>${country}<br>${email}</p>
      <p><strong>Payment Method:</strong><br>**** **** **** ${cardNumber.slice(-4)}<br>${cardName}</p>
    `;
  }

  // ✅ Init
  (async function init() {
    popup.classList.add('hidden');
    await syncCartSummary();
    await updateSummaryTotals();
    setInterval(syncCartSummary, 10000);
  })();
});