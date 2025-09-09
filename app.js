// --- DATA ---
const products = [
    { id: 1, name: 'Cake', price: 1, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Slice%20of%20Cake.tgs', isNew: true, isStar: true },
    { id: 2, name: 'Burger', price: 4.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hamburger.tgs', isNew: false },
    { id: 3, name: 'Fries', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/French%20Fries.tgs', isNew: false },
    { id: 4, name: 'Hotdog', price: 3.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hot%20Dog.tgs', isNew: false },
    { id: 5, name: 'Taco', price: 3.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Taco.tgs', isNew: false },
    { id: 6, name: 'Pizza', price: 7.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Pizza.tgs', isNew: false },
];
let loadedAnimations = new Map();

// --- STATE ---
let cart = {};
let currentPopup = null;

// --- TELEGRAM WEB APP API ---
const tg = window.Telegram.WebApp;

// --- DOM ELEMENTS ---
const catalogGrid = document.getElementById('catalog-grid');
const orderList = document.getElementById('order-list');
const checkoutSummary = document.getElementById('checkout-summary');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const finalPayBtn = document.getElementById('final-pay-btn');

// --- LOTTIE & ANIMATION ---
function playLottieAnimation(container) {
    const url = container.dataset.tgsUrl;
    if (!url) return;

    if (loadedAnimations.has(container)) {
        const anim = loadedAnimations.get(container);
        anim.play();
        return;
    }

    const anim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: url,
    });
    loadedAnimations.set(container, anim);
}

function initAnimations(container) {
    container.querySelectorAll('.lottie-emoji').forEach(playLottieAnimation);
}

// --- RENDER FUNCTIONS ---
function renderCatalog() {
    catalogGrid.innerHTML = '';
    products.forEach(product => {
        const quantity = cart[product.id] || 0;
        const buttonHtml = product.isStar
            ? `<button class="w-full h-full rounded-lg text-white font-bold bg-blue-500" onclick="handleStarPurchase(${product.id})">BUY for ${product.price} ⭐️</button>`
            : quantity === 0
                ? `<button class="w-full h-full rounded-lg text-white font-bold ${product.isNew ? 'bg-green-500' : 'bg-yellow-500'}" onclick="addToCart(${product.id})">${product.isNew ? 'BUY' : 'ADD'}</button>`
                : `<div class="flex justify-between items-center h-full">
                       <button class="w-[48%] h-full rounded-lg bg-red-500 text-white text-xl font-bold" onclick="removeFromCart(${product.id})">-</button>
                       <button class="w-[48%] h-full rounded-lg bg-yellow-500 text-white text-xl font-bold" onclick="addToCart(${product.id})">+</button>
                   </div>`;

        const itemHtml = `
            <div class="rounded-xl p-3 flex flex-col items-center justify-between text-center bg-[var(--tg-theme-secondary-bg-color)]">
                <div class="relative w-full">
                    <div class="lottie-emoji" data-tgs-url="${product.tgsUrl}"></div>
                    ${quantity > 0 ? `<div class="item-badge">${quantity}</div>` : ''}
                </div>
                <div>
                    <div class="font-semibold text-sm flex items-center justify-center space-x-1">
                        <span>${product.name}</span>
                        ${product.isNew ? `<span class="new-badge">NEW</span>` : ''}
                    </div>
                    <p class="text-gray-500 text-sm font-bold mb-1">${product.isStar ? `${product.price} ⭐️` : `$${product.price.toFixed(2)}`}</p>
                </div>
                <div class="w-full mt-1 h-9">${buttonHtml}</div>
            </div>`;
        catalogGrid.insertAdjacentHTML('beforeend', itemHtml);
    });
    initAnimations(catalogGrid);
    updateMainButton();
}

function renderOrder() {
    orderList.innerHTML = '';
    if (Object.keys(cart).length === 0) {
        orderList.innerHTML = '<p class="text-center text-gray-500">Your order is empty.</p>';
    } else {
        for (const productId in cart) {
            const product = products.find(p => p.id == productId);
            const quantity = cart[productId];
            const itemTotal = product.price * quantity;
            orderList.innerHTML += `
                <div class="flex items-center">
                    <div class="lottie-emoji w-12 h-12 mr-4 flex-shrink-0" data-tgs-url="${product.tgsUrl}"></div>
                    <div class="flex-grow">
                        <p class="font-bold">${product.name} <span class="text-orange-500">x${quantity}</span></p>
                    </div>
                    <div class="font-semibold">$${itemTotal.toFixed(2)}</div>
                </div>`;
        }
    }
    initAnimations(orderList);
    updateMainButton();
}

function renderCheckout() {
    checkoutSummary.innerHTML = '';
    let totalPrice = 0;
    for (const productId in cart) {
        const product = products.find(p => p.id == productId);
        const quantity = cart[productId];
        const itemTotal = product.price * quantity;
        totalPrice += itemTotal;
        checkoutSummary.innerHTML += `
            <div class="flex justify-between items-center text-sm">
                <span>${product.name} x${quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>`;
    }
    checkoutTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    finalPayBtn.textContent = `PAY $${totalPrice.toFixed(2)}`;
    initAnimations(document.getElementById('checkout-popup'));
}


// --- LOGIC & EVENT HANDLERS ---
window.addToCart = (productId) => {
    cart[productId] = (cart[productId] || 0) + 1;
    renderCatalog();
};

window.removeFromCart = (productId) => {
    if (cart[productId] > 1) cart[productId]--;
    else delete cart[productId];
    renderCatalog();
};

window.handleStarPurchase = (productId) => {
    const product = products.find(p => p.id === productId);
    document.getElementById('stars-product-name').innerText = product.name;
    const emojiContainer = document.getElementById('stars-emoji-container');
    emojiContainer.innerHTML = ''; // Clear previous emoji
    emojiContainer.dataset.tgsUrl = product.tgsUrl;
    
    document.getElementById('confirm-star-payment-btn').onclick = () => {
        // This is where you would call your backend to create an invoice
        // For demonstration, we use a placeholder link and the Telegram API
        const payload = `buy-star-item-${productId}`;
        // IMPORTANT: The invoice link MUST be generated by your bot on the backend!
        // This is a dummy link and will not work.
        const invoiceLink = `https://t.me/invoice/dummy_payload_for_${payload}`;

        tg.openInvoice(invoiceLink, (status) => {
             if (status === 'paid') {
                tg.showPopup({
                    title: 'Success!',
                    message: `You have successfully purchased ${product.name}.`,
                    buttons: [{type: 'ok'}]
                });
             } else {
                 tg.showPopup({
                    title: 'Payment Failed',
                    message: `Your payment was not completed. Status: ${status}`,
                    buttons: [{type: 'ok'}]
                });
             }
        });
    };
    showPopup('stars-popup');
};

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'catalog-view') {
        tg.BackButton.hide();
        renderCatalog();
    } else if (viewId === 'order-view') {
        tg.BackButton.show();
        renderOrder();
    }
}

function showPopup(popupId) {
    hideAllPopups(true); // Hide other popups without triggering back button logic
    currentPopup = popupId;
    const popup = document.getElementById(popupId);
    popup.classList.remove('hidden');
    initAnimations(popup);
    tg.BackButton.show();
}

function hideAllPopups(isInternalCall = false) {
    document.querySelectorAll('.popup-overlay').forEach(p => p.classList.add('hidden'));
    if (!isInternalCall) {
        currentPopup = null;
        const currentView = document.querySelector('.view.active').id;
        if (currentView === 'catalog-view') {
            tg.BackButton.hide();
        }
    }
}

function handleBack() {
    if (currentPopup === 'payment-popup' || currentPopup === 'shipping-popup') {
        showPopup('checkout-popup');
    } else {
        hideAllPopups();
    }
}

function calculateTotal() {
    return Object.keys(cart).reduce((total, productId) => {
        const product = products.find(p => p.id == productId);
        const quantity = cart[productId];
        total.price += product.price * quantity;
        total.items += quantity;
        return total;
    }, { price: 0, items: 0 });
}

function updateMainButton() {
    const total = calculateTotal();
    const currentView = document.querySelector('.view.active').id;

    if (total.items > 0) {
        if (currentView === 'catalog-view') {
            tg.MainButton.setText(`View Order ($${total.price.toFixed(2)})`);
            tg.MainButton.show();
        } else if (currentView === 'order-view') {
            tg.MainButton.setText(`Pay $${total.price.toFixed(2)}`);
            tg.MainButton.show();
        }
    } else {
        tg.MainButton.hide();
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    tg.expand();

    // Set theme colors
    document.body.style.backgroundColor = tg.themeParams.bg_color;
    document.body.style.color = tg.themeParams.text_color;

    renderCatalog();

    tg.onEvent('mainButtonClicked', () => {
        const currentView = document.querySelector('.view.active').id;
        if (currentView === 'catalog-view') {
            showView('order-view');
        } else {
            renderCheckout();
            showPopup('checkout-popup');
        }
    });
    
    tg.onEvent('backButtonClicked', handleBack);

    document.getElementById('edit-order-btn').addEventListener('click', () => showView('catalog-view'));
    
    // Popup Controls
    document.getElementById('close-checkout-popup').addEventListener('click', hideAllPopups);
    document.querySelectorAll('[data-close-popup]').forEach(el => el.addEventListener('click', hideAllPopups));
    document.querySelectorAll('[data-target-popup]').forEach(el => {
        el.addEventListener('click', () => showPopup(el.dataset.targetPopup));
    });
    
    document.getElementById('open-payment-popup').addEventListener('click', () => showPopup('payment-popup'));
    document.getElementById('open-shipping-popup').addEventListener('click', () => showPopup('shipping-popup'));

    document.getElementById('final-pay-btn').addEventListener('click', () => {
        tg.showPopup({
            title: 'Success!',
            message: 'Your order has been placed.',
            buttons: [{type: 'ok', text: 'Great!'}]
        }, () => {
            cart = {};
            hideAllPopups();
            showView('catalog-view');
        });
    });
});

