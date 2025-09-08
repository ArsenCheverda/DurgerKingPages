// --- DATA ---
const products = [
    { id: 1, name: 'Cake', price: 1.00, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Slice%20of%20Cake.tgs', fallback: '🍰', isNew: true, desc: 'A slice of heaven' },
    { id: 2, name: 'Burger', price: 2.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hamburger.tgs', fallback: '🍔', isNew: false, desc: 'Classic beef burger' },
    { id: 3, name: 'Fries', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/French%20Fries.tgs', fallback: '🍟', isNew: false, desc: 'Crispy golden fries' },
    { id: 4, name: 'Hotdog', price: 3.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hot%20Dog.tgs', fallback: '🌭', isNew: false, desc: 'Grilled to perfection' },
    { id: 5, name: 'Taco', price: 3.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Taco.tgs', fallback: '🌮', isNew: false, desc: 'Mucho más' },
    { id: 6, name: 'Pizza', price: 7.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Pizza.tgs', fallback: '🍕', isNew: false, desc: 'Cheesy and delicious' },
    { id: 7, name: 'Donut', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Doughnut.tgs', fallback: '🍩', isNew: false, desc: 'Hole included' },
    { id: 8, name: 'Popcorn', price: 1.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Popcorn.tgs', fallback: '🍿', isNew: false, desc: 'Movie night favorite' },
    { id: 9, name: 'Coke', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Cup%20with%20Straw.tgs', fallback: '🥤', isNew: false, desc: 'Refreshing drink' },
    { id: 10, name: 'Icecream', price: 5.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Soft%20Ice%20Cream.tgs', fallback: '🍦', isNew: false, desc: 'Cool and sweet' },
    { id: 11, name: 'Cookie', price: 3.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Cookie.tgs', fallback: '🍪', isNew: false, desc: "Milk's favorite" },
    { id: 12, name: 'Flan', price: 7.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Custard.tgs', fallback: '🍮', isNew: false, desc: 'Flan-tastic' },
];

// --- STATE ---
let cart = {}; // { productId: quantity }
let currentPage = 'catalog-page';
let isPaymentInfoFilled = false;
let isShippingInfoFilled = false;
let paymentInfo = { lastFour: '' };
let shippingInfo = { name: '', phone: '', address: '' };


// --- DOM ELEMENTS ---
const catalogGrid = document.getElementById('catalog-grid');
const viewOrderBtn = document.getElementById('view-order-btn');
const orderList = document.getElementById('order-list');
const payFromOrderBtn = document.getElementById('pay-from-order-btn');
const checkoutSummary = document.getElementById('checkout-summary');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const finalPayBtn = document.getElementById('final-pay-btn');
const proceedBtn = document.getElementById('proceed-btn');
const saveShippingBtn = document.getElementById('save-shipping-btn');
const backToCatalogBtn = document.getElementById('back-to-catalog-btn');
const closeCheckoutBtn = document.getElementById('close-checkout-btn');

// Payment Form Elements
const cardNumberInput = document.getElementById('card-number');
const expiryDateInput = document.getElementById('expiry-date');
const cvcInput = document.getElementById('cvc');
const cardholderNameInput = document.getElementById('cardholder-name');
const countryInput = document.getElementById('country');
const postcodeInput = document.getElementById('postcode');
const toggleCvcBtn = document.getElementById('toggle-cvc');

// Shipping Form Inputs
const shippingFullNameInput = document.getElementById('shipping-full-name');
const shippingPhoneInput = document.getElementById('shipping-phone-number');
const shippingAddress1Input = document.getElementById('shipping-address-1');

// Checkout Display Elements
const paymentMethodText = document.getElementById('payment-method-text');
const shippingAddressText = document.getElementById('shipping-address-text');
const shippingNameText = document.getElementById('shipping-name-text');
const shippingPhoneText = document.getElementById('shipping-phone-text');
const nameLinkBlock = document.getElementById('name-link-block');
const namePlaceholder = document.getElementById('name-placeholder');
const nameDetails = document.getElementById('name-details');

// --- RENDER FUNCTIONS ---

function createEmojiHtml(product, cssClass, width = 56, height = 56) {
    return `
        <picture width="${width}" height="${height}" class="${cssClass}">
            <source type="application/x-tgsticker" srcset="${product.tgsUrl}">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="${product.name}" width="${width}" height="${height}">
        </picture>
    `;
}

function initAnimations(container) {
    const pictures = container.querySelectorAll('picture');
    pictures.forEach(pic => {
        // A simple check to avoid re-initializing
        if (!pic.rlPlayer) {
             RLottie.init(pic, {
                maxDeviceRatio: 2,
                cachingModulo: 1, // Cache all frames
            });
        }
    });
}


function renderCatalog() {
    catalogGrid.innerHTML = '';
    products.forEach(product => {
        const quantity = cart[product.id] || 0;

        const buttonHtml = `
        <div class="w-full mt-2 h-10 relative">
            <button class="absolute left-0 top-0 h-full w-[48%] rounded-lg bg-red-500 text-white text-xl font-bold transition-all duration-300 ease-in-out ${quantity > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}" onclick="removeFromCart(${product.id})">-</button>
            <button class="absolute right-0 top-0 h-full rounded-lg text-white font-bold transition-all duration-300 ease-in-out ${quantity > 0 ? 'w-[48%]' : 'w-full'} ${product.isNew && quantity === 0 ? 'bg-[#27ae60]' : 'bg-[#f39c12]'}" onclick="addToCart(${product.id})">
                <span class="absolute inset-0 flex items-center justify-center text-sm transition-opacity duration-150 ${quantity > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}">${product.isNew ? 'BUY' : 'ADD'}</span>
                <span class="absolute inset-0 flex items-center justify-center text-xl transition-opacity duration-150 ${quantity > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}">+</span>
            </button>
        </div>`;

        const itemHtml = `
            <div class="rounded-xl p-3 flex flex-col items-center justify-between text-center">
                <div class="relative w-full flex justify-center">
                    ${createEmojiHtml(product, 'item-emoji-picture')}
                    ${quantity > 0 ? `<div class="item-badge">${quantity}</div>` : ''}
                </div>
                <div>
                    <div class="font-semibold text-sm flex items-center justify-center space-x-1">
                        <span>${product.name}</span>
                        ${product.isNew ? '<span class="new-badge">NEW</span><i class="fas fa-star text-yellow-400 text-xs"></i>' : ''}
                    </div>
                    <p class="text-gray-500 text-sm font-bold mb-2">$${product.price.toFixed(2)}</p>
                </div>
                ${buttonHtml}
            </div>`;
        catalogGrid.innerHTML += itemHtml;
    });

    initAnimations(catalogGrid);
    updateViewOrderButton();
}

function renderOrder() {
    orderList.innerHTML = '';
    let totalPrice = 0;
    const hasItems = Object.keys(cart).length > 0;

    if (!hasItems) {
         orderList.innerHTML = '<p class="text-center text-gray-500">Your order is empty.</p>';
    } else {
        for (const productId in cart) {
            const product = products.find(p => p.id == productId);
            const quantity = cart[productId];
            const itemTotal = product.price * quantity;
            totalPrice += itemTotal;

            const itemHtml = `
                <div class="flex items-center">
                    ${createEmojiHtml(product, 'order-item-emoji-picture', 48, 48)}
                    <div class="flex-grow">
                        <p class="font-bold">${product.name} <span class="text-orange-500">x${quantity}</span></p>
                        <p class="text-sm text-gray-500">${product.desc}</p>
                    </div>
                    <div class="font-semibold">$${itemTotal.toFixed(2)}</div>
                </div>`;
            orderList.innerHTML += itemHtml;
        }
    }
    
    initAnimations(orderList);
    payFromOrderBtn.textContent = `PAY $${totalPrice.toFixed(2)}`;
    payFromOrderBtn.disabled = !hasItems;
}

function renderCheckout() {
    checkoutSummary.innerHTML = '';
    let totalPrice = 0;

    for (const productId in cart) {
        const product = products.find(p => p.id == productId);
        const quantity = cart[productId];
        const itemTotal = product.price * quantity;
        totalPrice += itemTotal;
        const itemHtml = `
            <div class="flex justify-between items-center text-sm">
                <div class="flex items-center">
                    ${createEmojiHtml(product, 'checkout-summary-emoji-picture', 20, 20)}
                    <span>${product.name} x${quantity}</span>
                </div>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>`;
        checkoutSummary.innerHTML += itemHtml;
    }
    checkoutSummary.innerHTML += `<div class="flex justify-between items-center text-sm text-gray-500"><span>Free Delivery</span><span>$0.00</span></div>`;
    
    initAnimations(checkoutSummary);

    checkoutTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    finalPayBtn.textContent = `PAY $${totalPrice.toFixed(2)}`;

    // Update payment info display
    if (isPaymentInfoFilled) {
        paymentMethodText.textContent = `Card **** ${paymentInfo.lastFour}`;
        paymentMethodText.classList.remove('text-blue-500');
        paymentMethodText.classList.add('text-gray-700');
    } else {
        paymentMethodText.textContent = 'Add payment method';
        paymentMethodText.classList.add('text-blue-500');
        paymentMethodText.classList.remove('text-gray-700');
    }

    // Update shipping info display
    if (isShippingInfoFilled) {
        shippingAddressText.textContent = shippingInfo.address;
        shippingAddressText.classList.remove('text-blue-500');
        shippingAddressText.classList.add('text-gray-700');
        
        shippingNameText.textContent = shippingInfo.name;
        shippingPhoneText.textContent = shippingInfo.phone;
        namePlaceholder.style.display = 'none';
        nameDetails.style.display = 'block';

    } else {
         shippingAddressText.textContent = 'Add shipping address';
         shippingAddressText.classList.add('text-blue-500');
         shippingAddressText.classList.remove('text-gray-700');
         
         namePlaceholder.style.display = 'block';
         nameDetails.style.display = 'none';
    }
}

// --- LOGIC & EVENT HANDLERS ---
function addToCart(productId) {
    cart[productId] = (cart[productId] || 0) + 1;
    renderCatalog();
}

function removeFromCart(productId) {
    if (cart[productId] > 1) cart[productId]--;
    else delete cart[productId];
    renderCatalog();
}

function updateViewOrderButton() {
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    viewOrderBtn.disabled = totalItems === 0;
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const newPage = document.getElementById(pageId);
    newPage.classList.add('active');
    currentPage = pageId;
    
    if (pageId === 'order-page') renderOrder();
    if (pageId === 'checkout-page') renderCheckout();
    if (pageId === 'success-page') {
        const successAnimContainer = document.getElementById('success-animation');
        initAnimations(successAnimContainer);
    }
}

viewOrderBtn.addEventListener('click', () => showPage('order-page'));
payFromOrderBtn.addEventListener('click', () => showPage('checkout-page'));
closeCheckoutBtn.addEventListener('click', () => showPage('catalog-page'));

finalPayBtn.addEventListener('click', () => {
    if (!isPaymentInfoFilled) {
        showPage('payment-page');
    } else if (!isShippingInfoFilled) {
        showPage('shipping-page');
    } else {
        showPage('success-page');
    }
});

proceedBtn.addEventListener('click', () => {
    if (!proceedBtn.disabled) {
        isPaymentInfoFilled = true;
        paymentInfo.lastFour = cardNumberInput.value.slice(-4);
        showPage('shipping-page');
    }
});

saveShippingBtn.addEventListener('click', () => {
    const name = shippingFullNameInput.value.trim();
    const phone = shippingPhoneInput.value.trim();
    const address = shippingAddress1Input.value.trim();

    if (name && phone && address) {
        isShippingInfoFilled = true;
        shippingInfo = { name, phone, address };
        showPage('checkout-page');
    } else {
        // A simple browser alert is fine for this example. In a real app, use a modal.
        alert('Please fill in receiver name, phone and address.');
    }
});

backToCatalogBtn.addEventListener('click', () => {
    cart = {};
    isPaymentInfoFilled = false;
    isShippingInfoFilled = false;
    renderCatalog();
    showPage('catalog-page');
});

// --- PAYMENT FORM VALIDATION ---
[cardNumberInput, expiryDateInput, cvcInput, cardholderNameInput, countryInput, postcodeInput].forEach(input => {
    input.addEventListener('input', () => validateField(input));
});

function validateField(input) {
    const id = input.id;
    const label = document.getElementById(`${id}-label`);
    let isValid = false;
    let errorMsg = '', defaultLabel = '';

    switch (id) {
        case 'card-number':
            isValid = validateCardNumber(input.value);
            errorMsg = "Incomplete card number";
            defaultLabel = "Card Number";
            break;
        case 'expiry-date':
            isValid = validateExpiryDate(input.value);
            errorMsg = "Invalid expiry date";
            defaultLabel = "Expiry Date";
            break;
        case 'cvc':
            isValid = input.value.length === 3;
            errorMsg = "Invalid CVC";
            defaultLabel = "CVC";
            break;
        case 'cardholder-name':
        case 'postcode':
            isValid = input.value.trim() !== '';
            errorMsg = `${id.replace('-', ' ')} is required`;
            defaultLabel = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            break;
        case 'country':
            isValid = input.value !== '';
            errorMsg = "Country is required";
            defaultLabel = "Country";
            break;
    }
    
    if (!isValid && input.value.length > 0) {
        input.classList.add('input-error');
        label.classList.add('label-error');
        label.textContent = errorMsg;
    } else {
        input.classList.remove('input-error');
        label.classList.remove('label-error');
        label.textContent = defaultLabel;
    }
    validatePaymentForm();
}

cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = value.replace(/(\d{4})/g, '$1 ').trim();
});
expiryDateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    e.target.value = value;
});
cvcInput.addEventListener('input', (e) => e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3));

toggleCvcBtn.addEventListener('click', () => {
    const isPassword = cvcInput.type === 'password';
    cvcInput.type = isPassword ? 'text' : 'password';
    toggleCvcBtn.classList.toggle('fa-eye');
    toggleCvcBtn.classList.toggle('fa-eye-slash');
});

function validateCardNumber(value) { return value.replace(/\s/g, '').length === 16; }
function validateExpiryDate(value) {
    if (value.length !== 5) return false;
    const [month, year] = value.split('/');
    if (!month || !year) return false;
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;
    return true;
}

function validatePaymentForm() {
    const isFormValid = validateCardNumber(cardNumberInput.value) && validateExpiryDate(expiryDateInput.value) && cvcInput.value.length === 3 && cardholderNameInput.value.trim() !== '' && countryInput.value !== '' && postcodeInput.value.trim() !== '';
    proceedBtn.disabled = !isFormValid;
    proceedBtn.classList.toggle('bg-blue-300', !isFormValid);
    proceedBtn.classList.toggle('cursor-not-allowed', !isFormValid);
    proceedBtn.classList.toggle('bg-blue-500', isFormValid);
}

// --- DATA FETCHING & POPULATION ---
async function fetchAndPopulateCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,cca2');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const countries = data
            .map(c => ({ name: c.name.common, flag: c.flag, code: c.cca2 }))
            .sort((a, b) => a.name.localeCompare(b.name));
        countries.forEach(c => {
            const option = document.createElement('option');
            option.value = c.code;
            option.textContent = `${c.flag} ${c.name}`;
            countryInput.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Add a fallback
        const option = document.createElement('option');
        option.value = 'US';
        option.textContent = '🇺🇸 United States';
        countryInput.appendChild(option);
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
    fetchAndPopulateCountries();
    updateViewOrderButton();
    validatePaymentForm();
    initAnimations(document.body); // Initial animation for static elements like checkout emoji
});
