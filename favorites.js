import { listCars, createLead } from './firebase.js';

const grid = document.getElementById('grid');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

const FAV_KEY = 'carshop_favorites';

let ALL_CARS = [];

async function loadCarsFromFirebase() {
    try {
        ALL_CARS = await listCars();
    } catch (e) {
        console.error('Error loading cars from Firebase:', e);
        ALL_CARS = [];
    }
}

function loadFavorites() {
    try {
        return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
    } catch (e) {
        return new Set();
    }
}

function renderFavorites() {
    const favorites = loadFavorites();
    const favoriteCars = ALL_CARS.filter(car => favorites.has(car.id));
    
    if (favoriteCars.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = favoriteCars.map(car => `
        <div class="card">
            <img src="${car.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${car.make} ${car.model}" />
            <div class="content">
                <div class="row">
                    <strong>${car.year} ${car.make} ${car.model}</strong>
                    <span>$${car.price ? car.price.toLocaleString() : '0'}</span>
                </div>
                <div class="row">
                    <span>${car.body || ''} • ${car.color || ''}</span>
                    <span>${car.mileage ? car.mileage.toLocaleString() : '0'} mi</span>
                </div>
                <div class="actions">
                    <a class="view" href="car.html?id=${car.id}">View Details</a>
                    <button class="fav active" data-id="${car.id}" title="Remove from favorites">👍</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners for favorite buttons
    Array.from(document.querySelectorAll('.fav')).forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const carId = btn.getAttribute('data-id');
            const favorites = loadFavorites();
            
            if (favorites.has(carId)) {
                favorites.delete(carId);
                localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favorites)));
                // Re-render to update the display
                renderFavorites();
            }
        });
    });
}

function openModal(id) {
    const car = ALL_CARS.find(c => c.id === id);
    if (!car) return;
    
    modalBody.innerHTML = `
        <div class="gallery">${(car.images || []).map(u => `<img src="${u}" alt="">`).join('')}</div>
        <div class="modal-body">
            <h3>${car.year} ${car.make} ${car.model}</h3>
            <p>${car.body || ''} • ${car.color || ''} • ${car.mileage ? car.mileage.toLocaleString() : '0'} mi</p>
            <p><strong>$${car.price ? car.price.toLocaleString() : '0'}</strong></p>
            ${car.description ? `<p style="margin:15px 0;color:#9aa3b2;">${car.description}</p>` : ''}
            <form id="leadForm">
                <input name="name" placeholder="Your name" required />
                <input name="email" type="email" placeholder="Your email" required />
                <input name="phone" placeholder="Your phone" />
                <textarea name="message" placeholder="Message"></textarea>
                <button type="submit">Request info</button>
            </form>
            <div id="leadMsg"></div>
        </div>`;
    
    const form = document.getElementById('leadForm');
    const leadMsg = document.getElementById('leadMsg');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const payload = Object.fromEntries(fd.entries());
            payload.carId = car.id;
            
            try {
                await createLead(payload);
                leadMsg.textContent = 'Thanks! We will contact you soon.';
                leadMsg.style.color = '#10b981';
                form.reset();
            } catch (error) {
                leadMsg.textContent = 'Error sending request. Please try again.';
                leadMsg.style.color = '#ef4444';
            }
        });
    }
    
    modal.classList.remove('hidden');
}

// Event listeners
if (closeModal) {
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// Initialize
(async function() {
    await loadCarsFromFirebase();
    renderFavorites();
})();
