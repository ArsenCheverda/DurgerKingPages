// --- DATA ---
const products = [
    { id: 1, name: 'Cake', price: 1.00, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Slice%20of%20Cake.tgs', isNew: true, desc: 'A slice of heaven' },
    { id: 2, name: 'Burger', price: 4.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hamburger.tgs', isNew: false, desc: 'Classic beef burger' },
    { id: 3, name: 'Fries', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/French%20Fries.tgs', isNew: false, desc: 'Crispy golden fries' },
    { id: 4, name: 'Hotdog', price: 3.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hot%20Dog.tgs', isNew: false, desc: 'Grilled to perfection' },
    { id: 5, name: 'Taco', price: 3.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Taco.tgs', isNew: false, desc: 'Mucho más' },
    { id: 6, name: 'Pizza', price: 7.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Pizza.tgs', isNew: false, desc: 'Cheesy and delicious' },
    { id: 7, name: 'Donut', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Doughnut.tgs', isNew: false, desc: 'Hole included' },
    { id: 8, name: 'Popcorn', price: 1.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Popcorn.tgs', isNew: false, desc: 'Movie night favorite' },
    { id: 9, name: 'Coke', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Cup%20with%20Straw.tgs', isNew: false, desc: 'Refreshing drink' },
    { id: 10, name: 'Icecream', price: 5.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Soft%20Ice%20Cream.tgs', isNew: false, desc: 'Cool and sweet' },
    { id: 11, name: 'Cookie', price: 3.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Cookie.tgs', isNew: false, desc: "Milk's favorite" },
    { id: 12, name: 'Flan', price: 7.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Custard.tgs', isNew: false, desc: 'Flan-tastic' },
];
let loadedAnimations = [];

// --- STATE ---
let cart = {}; 
let isPaymentInfoFilled = false;
let isShippingInfoFilled = false;

// --- TELEGRAM WEB APP API ---
const tg = window.Telegram.WebApp;

// --- DOM ELEMENTS ---
const catalogGrid = document.getElementById('catalog-grid');
const orderList = document.getElementById('order-list');
const checkoutSummary = document.getElementById('checkout-summary');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const finalPayBtn = document.getElementById('final-pay-btn');

// --- LOTTIE & ANIMATION ---
function loadLottieAnimation(container) {
    const url = container.dataset.tgsUrl;
    if (url && !container.dataset.lottieLoaded) {
        container.dataset.lottieLoaded = 'true';
        const anim = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: url,
        });
        loadedAnimations.push(anim);
    }
}

function initAnimations(container) {
    // Destroy previous animations to prevent memory leaks
    loadedAnimations.forEach(anim => anim.destroy());
    loadedAnimations = [];
    
    container.querySelectorAll('.lottie-emoji').forEach(loadLottieAnimation);
}

// --- RENDER FUNCTIONS ---
function renderCatalog() {
    catalogGrid.innerHTML = '';
    products.forEach(product => {
        const quantity = cart[product.id] || 0;
        const itemHtml = `
            <div class="rounded-xl p-3 flex flex-col items-center justify-between text-center">
                <div class="relative w-full">
                    <div class="lottie-emoji" data-tgs-url="${product.tgsUrl}"></div>
                    ${quantity > 0 ? `<div class="item-badge">${quantity}</div>` : ''}
                </div>
                <div>
                    <div class="font-semibold text-sm flex items-center justify-center space-x-1">
                        <span>${product.name}</span>
                        ${product.isNew ? '<span class="new-badge">NEW</span>' : ''}
                    </div>
                    <p class="text-gray-500 text-sm font-bold mb-1">$${product.price.toFixed(2)}</p>
                </div>
                <div class="w-full mt-1 h-10">
                    ${quantity === 0 ? 
                        `<button class="w-full h-full rounded-lg text-white font-bold ${product.isNew ? 'bg-[#27ae60]' : 'bg-[#f39c12]'}" onclick="addToCart(${product.id})">${product.isNew ? 'BUY' : 'ADD'}</button>` :
                        `<div class="flex justify-between items-center h-full">
                            <button class="w-[48%] h-full rounded-lg bg-red-500 text-white text-xl font-bold" onclick="removeFromCart(${product.id})">-</button>
                            <button class="w-[48%] h-full rounded-lg bg-[#f39c12] text-white text-xl font-bold" onclick="addToCart(${product.id})">+</button>
                        </div>`
                    }
                </div>
            </div>`;
        catalogGrid.innerHTML += itemHtml;
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

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'catalog-view') renderCatalog();
    if (viewId === 'order-view') renderOrder();
}

function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if(popup) {
        popup.classList.remove('hidden');
        initAnimations(popup);
    }
    tg.BackButton.show();
}

function hideAllPopups() {
    document.querySelectorAll('.popup-overlay').forEach(p => p.classList.add('hidden'));
    tg.BackButton.hide();
}

let currentPopup = null;
function handleBack() {
    if (currentPopup === 'payment-popup' || currentPopup === 'shipping-popup') {
        document.getElementById(currentPopup).classList.add('hidden');
        showPopup('checkout-popup');
        currentPopup = 'checkout-popup';
    } else {
        hideAllPopups();
        currentPopup = null;
    }
}

function updateMainButton() {
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const totalPrice = Object.keys(cart).reduce((sum, productId) => {
        const product = products.find(p => p.id == productId);
        return sum + (product.price * cart[productId]);
    }, 0);

    if (totalItems > 0) {
        const currentView = document.querySelector('.view.active').id;
        if (currentView === 'catalog-view') {
            tg.MainButton.setText(`View Order (${totalItems})`);
            tg.MainButton.show();
        } else {
            tg.MainButton.setText(`Pay $${totalPrice.toFixed(2)}`);
            tg.MainButton.show();
        }
    } else {
        tg.MainButton.hide();
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    tg.expand();
    
    renderCatalog();

    tg.onEvent('mainButtonClicked', () => {
        const currentView = document.querySelector('.view.active').id;
        if (currentView === 'catalog-view') {
            showView('order-view');
        } else {
            renderCheckout();
            showPopup('checkout-popup');
            currentPopup = 'checkout-popup';
        }
    });
    
    tg.onEvent('backButtonClicked', handleBack);

    document.getElementById('edit-order-btn').addEventListener('click', () => showView('catalog-view'));
    
    // Popup Controls
    document.getElementById('close-checkout-popup').addEventListener('click', handleBack);
    document.getElementById('final-pay-btn').addEventListener('click', () => {
        hideAllPopups();
        showPopup('success-popup');
    });
    document.getElementById('back-to-catalog-btn').addEventListener('click', () => {
        cart = {};
        hideAllPopups();
        showView('catalog-view');
    });
    
    document.getElementById('open-payment-popup').addEventListener('click', () => {
        document.getElementById('checkout-popup').classList.add('hidden');
        showPopup('payment-popup');
        currentPopup = 'payment-popup';
    });
     document.getElementById('open-shipping-popup').addEventListener('click', () => {
        document.getElementById('checkout-popup').classList.add('hidden');
        showPopup('shipping-popup');
        currentPopup = 'shipping-popup';
    });

    document.getElementById('back-to-checkout-from-payment').addEventListener('click', handleBack);
    document.getElementById('back-to-checkout-from-shipping').addEventListener('click', handleBack);
});

