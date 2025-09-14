// --- DATA ---
const products = [
    { id: 1, name: 'Cake', price: 1, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Slice%20of%20Cake.tgs', isNew: true, isStar: true },
    { id: 2, name: 'Burger', price: 4.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hamburger.tgs', isNew: false },
    { id: 3, name: 'Fries', price: 1.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/French%20Fries.tgs', isNew: false },
    { id: 4, name: 'Hotdog', price: 3.49, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Hot%20Dog.tgs', isNew: false },
    { id: 5, name: 'Taco', price: 3.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Taco.tgs', isNew: false },
    { id: 6, name: 'Pizza', price: 7.99, tgsUrl: 'https://cdn.jsdelivr.net/gh/Telegram-Mini-Apps/TGS-emojis@main/emojis/Food%20and%20Drink/Pizza.tgs', isNew: false },
];

// --- STATE ---
let cart = {};
let currentPopup = null;

// --- TELEGRAM WEB APP API ---
const tg = window.Telegram.WebApp;

// --- DOM ELEMENTS ---
const catalogGrid = document.getElementById('catalog-grid');
const skeletonLoader = document.getElementById('skeleton-loader');
const orderList = document.getElementById('order-list');

// --- ANIMATION LOGIC ---
/**
 * Creates a <lottie-player> element, mounts it, and adds a click-to-play listener.
 * @param {HTMLElement} container - The container div for the emoji.
 * @param {string} tgsUrl - The URL of the .tgs animation file.
 */
function mountAnimatedEmoji(container, tgsUrl) {
    if (!container || container.querySelector('lottie-player')) {
        return; // Already mounted or no container
    }
    
    container.innerHTML = ''; // Clear previous content
    const player = document.createElement('lottie-player');
    player.src = tgsUrl;
    
    // The player will show the first frame by default.
    // We add a click listener to the container to play the animation.
    container.onclick = () => {
        player.stop();
        player.play();
    };

    container.appendChild(player);
}

/**
 * Initializes all emoji animations within a given parent element.
 * @param {HTMLElement} parentElement - The element to search within for emoji containers.
 */
function initAnimations(parentElement) {
    const containers = parentElement.querySelectorAll('.emoji-container');
    containers.forEach(container => {
        mountAnimatedEmoji(container, container.dataset.tgsUrl);
    });
}


// --- RENDER FUNCTIONS ---
function renderSkeleton() {
    let skeletonHtml = '';
    for (let i = 0; i < 12; i++) {
        skeletonHtml += '<div class="skeleton-card"></div>';
    }
    skeletonLoader.innerHTML = skeletonHtml;
    skeletonLoader.style.display = 'flex';
    catalogGrid.style.display = 'none';
}

function renderCatalog() {
    catalogGrid.innerHTML = '';
    products.forEach(product => {
        const quantity = cart[product.id] || 0;
        const buttonHtml = product.isStar
            ? `<button class="w-full h-9 rounded-lg text-sm font-bold text-white bg-blue-500 shimmer-btn" onclick="handleStarPurchase(${product.id})">BUY</button>`
            : quantity === 0
                ? `<button class="w-full h-9 rounded-lg text-sm font-bold text-white ${product.isNew ? 'bg-green-500' : 'bg-yellow-500'}" onclick="addToCart(${product.id})">${product.isNew ? 'BUY' : 'ADD'}</button>`
                : `<div class="flex justify-between items-center h-9">
                       <button class="w-[48%] h-full rounded-lg bg-red-500 text-white text-xl font-bold" onclick="removeFromCart(${product.id})">-</button>
                       <button class="w-[48%] h-full rounded-lg bg-yellow-500 text-white text-xl font-bold" onclick="addToCart(${product.id})">+</button>
                   </div>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="relative w-full">
                <div class="emoji-container" data-tgs-url="${product.tgsUrl}"></div>
                ${quantity > 0 ? `<div class="item-badge">${quantity}</div>` : ''}
            </div>
            <div>
                <div class="font-semibold text-xs flex items-center justify-center space-x-1 h-8">
                  <span>${product.name}</span>
                  ${product.isNew ? `<span class="new-badge">NEW</span>` : ''}
                  ${product.isStar ? `<span class="text-yellow-400 text-lg">★</span>` : ''}
                </div>
                <p class="text-gray-500 text-sm font-bold mb-1">${product.isStar ? `${product.price} ★` : `$${product.price.toFixed(2)}`}</p>
            </div>
            ${buttonHtml}
        `;
        catalogGrid.appendChild(card);
    });

    skeletonLoader.style.display = 'none';
    catalogGrid.style.display = 'flex';
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
            orderList.innerHTML += `
                <div class="flex items-center">
                    <div class="emoji-container w-12 h-12 mr-4 flex-shrink-0" data-tgs-url="${product.tgsUrl}"></div>
                    <div class="flex-grow">
                        <p class="font-bold">${product.name} <span class="text-orange-500">x${cart[productId]}</span></p>
                    </div>
                    <div class="font-semibold">$${(product.price * cart[productId]).toFixed(2)}</div>
                </div>`;
        }
    }
    initAnimations(orderList);
    updateMainButton();
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
    emojiContainer.dataset.tgsUrl = product.tgsUrl;
    
    document.getElementById('confirm-star-payment-btn').onclick = () => {
        const payload = `buy-star-item-${productId}`;
        const invoiceLink = ``; // IMPORTANT: This MUST be generated by your bot backend!
        
        if (!invoiceLink) {
             tg.showAlert('Payment processing is not configured. This is a demo.');
             return;
        }

        tg.openInvoice(invoiceLink, (status) => {
             if (status === 'paid') {
                tg.showPopup({ title: 'Success!', message: `You have purchased ${product.name}.` });
             } else {
                tg.showPopup({ title: 'Payment Failed', message: `Status: ${status}` });
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
    hideAllPopups(true);
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
        if (document.querySelector('.view.active').id === 'catalog-view') {
            tg.BackButton.hide();
        }
    }
}

function updateMainButton() {
    const total = Object.keys(cart).reduce((acc, id) => {
        const p = products.find(prod => prod.id == id);
        acc.items += cart[id];
        acc.price += p.price * cart[id];
        return acc;
    }, { items: 0, price: 0 });

    const currentView = document.querySelector('.view.active').id;
    if (total.items > 0) {
        tg.MainButton.show();
        if (currentView === 'catalog-view') {
            tg.MainButton.setText(`View Order ($${total.price.toFixed(2)})`);
        } else {
            tg.MainButton.setText(`Pay $${total.price.toFixed(2)}`);
        }
    } else {
        tg.MainButton.hide();
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    tg.expand();
    
    renderSkeleton();
    // Simulate loading
    setTimeout(() => {
        renderCatalog();
    }, 500);

    tg.onEvent('mainButtonClicked', () => {
        if (document.querySelector('.view.active').id === 'catalog-view') {
            showView('order-view');
        } else {
            // Logic for showing checkout popup
        }
    });
    
    tg.onEvent('backButtonClicked', () => {
        if (currentPopup) {
            hideAllPopups();
        } else if (document.querySelector('.view.active').id === 'order-view') {
            showView('catalog-view');
        }
    });

    document.getElementById('edit-order-btn').addEventListener('click', () => showView('catalog-view'));
    document.querySelectorAll('[data-close-popup]').forEach(el => el.addEventListener('click', hideAllPopups));
});

