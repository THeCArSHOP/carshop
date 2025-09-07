import { listCars } from './firebase.js';

const FAV_KEY = 'carshop_favorites';

let allCars = [];
let selectedCars = { car1: null, car2: null };

// DOM elements
const car1Select = document.getElementById('car1Select');
const car2Select = document.getElementById('car2Select');
const removeCar1Btn = document.getElementById('removeCar1');
const removeCar2Btn = document.getElementById('removeCar2');
const compareResults = document.getElementById('compareResults');

// Initialize the compare page
async function initCompare() {
    try {
        allCars = await listCars();
        populateSelects();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Populate the select dropdowns with cars
function populateSelects() {
    const options = allCars.map(car => 
        `<option value="${car.id}">${car.year} ${car.make} ${car.model} - $${car.price?.toLocaleString() || '0'}</option>`
    );
    
    car1Select.innerHTML = '<option value="">Select first car...</option>' + options.join('');
    car2Select.innerHTML = '<option value="">Select second car...</option>' + options.join('');
}

// Setup event listeners
function setupEventListeners() {
    car1Select.addEventListener('change', (e) => handleCarSelection('car1', e.target.value));
    car2Select.addEventListener('change', (e) => handleCarSelection('car2', e.target.value));
    
    removeCar1Btn.addEventListener('click', () => removeCar('car1'));
    removeCar2Btn.addEventListener('click', () => removeCar('car2'));
}

// Handle car selection
function handleCarSelection(carSlot, carId) {
    if (carId === '') {
        removeCar(carSlot);
        return;
    }

    const car = allCars.find(c => c.id === carId);
    if (!car) return;

    // Check if car is already selected in the other slot
    const otherSlot = carSlot === 'car1' ? 'car2' : 'car1';
    if (selectedCars[otherSlot] && selectedCars[otherSlot].id === carId) {
        alert('This car is already selected in the other slot!');
        carSlot === 'car1' ? car1Select.value = '' : car2Select.value = '';
        return;
    }

    selectedCars[carSlot] = car;
    updateUI();
}

// Remove car from selection
function removeCar(carSlot) {
    selectedCars[carSlot] = null;
    if (carSlot === 'car1') {
        car1Select.value = '';
    } else {
        car2Select.value = '';
    }
    updateUI();
}

// Update the UI based on selections
function updateUI() {
    const hasCar1 = selectedCars.car1 !== null;
    const hasCar2 = selectedCars.car2 !== null;

    // Show/hide remove buttons
    removeCar1Btn.style.display = hasCar1 ? 'block' : 'none';
    removeCar2Btn.style.display = hasCar2 ? 'block' : 'none';

    // Show/hide compare results
    if (hasCar1 && hasCar2) {
        compareResults.style.display = 'block';
        populateCompareResults();
    } else {
        compareResults.style.display = 'none';
    }
}

// Populate the compare results
function populateCompareResults() {
    populateCarCard('car1', selectedCars.car1);
    populateCarCard('car2', selectedCars.car2);
}

// Populate individual car card
function populateCarCard(slot, car) {
    const prefix = slot;
    
    // Update image
    const img = document.getElementById(`${prefix}Image`);
    img.src = car.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image';
    img.alt = `${car.year} ${car.make} ${car.model}`;

    // Update title
    document.getElementById(`${prefix}Title`).textContent = `${car.year} ${car.make} ${car.model}`;

    // Update specs
    document.getElementById(`${prefix}Price`).textContent = `$${car.price?.toLocaleString() || '0'}`;
    document.getElementById(`${prefix}Year`).textContent = car.year || 'N/A';
    document.getElementById(`${prefix}Mileage`).textContent = car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A';
    document.getElementById(`${prefix}Body`).textContent = car.body || 'N/A';
    document.getElementById(`${prefix}Color`).textContent = car.color || 'N/A';
    document.getElementById(`${prefix}Engine`).textContent = car.engine || 'N/A';
    document.getElementById(`${prefix}Transmission`).textContent = car.transmission || 'N/A';
    document.getElementById(`${prefix}Fuel`).textContent = car.fuelType || 'N/A';
    document.getElementById(`${prefix}Features`).textContent = car.features || 'N/A';
    document.getElementById(`${prefix}Status`).textContent = car.featured ? '⭐ Featured' : 'Regular';

    // Update favorite button
    const favBtn = document.querySelector(`#${prefix}Card .fav-btn`);
    favBtn.setAttribute('data-car-id', car.id);
    updateFavoriteButton(favBtn, car.id);

    // Update view button
    const viewBtn = document.querySelector(`#${prefix}Card .view-btn`);
    viewBtn.addEventListener('click', () => {
        window.location.href = `inventory.html?car=${car.id}`;
    });
}

// Update favorite button state
function updateFavoriteButton(btn, carId) {
    const favorites = getFavorites();
    const isFavorited = favorites.includes(carId);
    
    btn.classList.toggle('active', isFavorited);
    btn.title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
}

// Get favorites from localStorage
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    } catch {
        return [];
    }
}

// Toggle favorite
function toggleFavorite(carId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(carId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(carId);
    }
    
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
}

// Setup favorite button event listeners
function setupFavoriteButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('fav-btn')) {
            e.preventDefault();
            const carId = e.target.getAttribute('data-car-id');
            if (carId) {
                toggleFavorite(carId);
                updateFavoriteButton(e.target, carId);
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCompare();
    setupFavoriteButtons();
});
