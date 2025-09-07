import { listCars, createLead } from './firebase.js';
const grid = document.getElementById('grid');
const pager = document.getElementById('pager');
const qEl = document.getElementById('q');
const makeEl = document.getElementById('make');
const modelEl = document.getElementById('model');
const yearEl = document.getElementById('year');
const sortEl = document.getElementById('sort');
const applyBtn = document.getElementById('apply');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

const STORAGE_KEY = 'carshop_cars';
const LEADS_KEY = 'carshop_leads';
const FAV_KEY = 'carshop_favorites';

let ALL_CARS = [];
async function loadCarsFromFirebase() {
	try {
		ALL_CARS = await listCars();
	} catch (e) {
		ALL_CARS = [];
	}
}

function loadCarsFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch (e) {
		return [];
	}
}

function saveCarsToStorage(cars) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

function seedIfEmpty() {
	const current = loadCarsFromStorage();
	if (current.length) return;
	const now = new Date().toISOString();
	const sample = [
		{ id: crypto.randomUUID(), make: 'Toyota', model: 'Camry', year: 2020, price: 22000, mileage: 24000, body: 'Sedan', color: 'White', thumbnail: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format', createdAt: now, images: [ 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format' ] },
		{ id: crypto.randomUUID(), make: 'BMW', model: '3 Series', year: 2019, price: 28000, mileage: 30000, body: 'Sedan', color: 'Black', thumbnail: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=800&auto=format', createdAt: now, images: [ 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format' ] },
		{ id: crypto.randomUUID(), make: 'Ford', model: 'Mustang', year: 2021, price: 36000, mileage: 12000, body: 'Coupe', color: 'Red', thumbnail: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format', createdAt: now, images: [ 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format' ] }
	];
	saveCarsToStorage(sample);
}

function getMeta(cars) {
	const makes = Array.from(new Set(cars.map(c => c.make))).sort();
	const models = Array.from(new Set(cars.map(c => c.model))).sort();
	const years = Array.from(new Set(cars.map(c => c.year))).sort((a,b)=>b-a);
	return { makes, models, years };
}

function loadFilters() {
	const meta = getMeta(ALL_CARS);
	if (makeEl) makeEl.innerHTML = `<option value="">Make</option>` + meta.makes.map(v => `<option>${v}</option>`).join('');
	if (modelEl) modelEl.innerHTML = `<option value="">Model</option>` + meta.models.map(v => `<option>${v}</option>`).join('');
	if (yearEl) yearEl.innerHTML = `<option value="">Year</option>` + meta.years.map(v => `<option>${v}</option>`).join('');
}

function readQuery() {
	const p = new URLSearchParams(location.search);
	return { q: p.get('q') || '', make: p.get('make') || '', model: p.get('model') || '', year: p.get('year') || '', sort: p.get('sort') || 'createdAt:desc', page: Number(p.get('page') || 1) };
}

function writeQuery(state) {
	const p = new URLSearchParams();
	if (state.q) p.set('q', state.q);
	if (state.make) p.set('make', state.make);
	if (state.model) p.set('model', state.model);
	if (state.year) p.set('year', state.year);
	if (state.sort) p.set('sort', state.sort);
	if (state.page > 1) p.set('page', String(state.page));
	history.replaceState(null, '', `?${p.toString()}`);
}

function applyFilters(all, state) {
	let list = all.slice();
	if (state.q) {
		const q = state.q.toLowerCase();
		list = list.filter(c => `${c.make} ${c.model} ${c.color} ${c.body}`.toLowerCase().includes(q));
	}
	if (state.make) list = list.filter(c => c.make === state.make);
	if (state.model) list = list.filter(c => c.model === state.model);
	if (state.year) list = list.filter(c => String(c.year) === String(state.year));
	const [sortBy, dir] = String(state.sort).split(':');
	const mul = (dir && dir.toLowerCase() === 'asc') ? 1 : -1;
	list.sort((a,b) => {
		if (sortBy === 'price') return (a.price - b.price) * mul;
		if (sortBy === 'year') return (a.year - b.year) * mul;
		if (sortBy === 'mileage') return (a.mileage - b.mileage) * mul;
		return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * mul;
	});
	return list;
}

function paginate(list, page, pageSize) {
	const total = list.length;
	const start = (page - 1) * pageSize;
	return { data: list.slice(start, start + pageSize), total };
}

function renderGrid(data) {
	grid.innerHTML = data.map(car => `
		<div class="card">
			<img src="${car.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${car.make} ${car.model}" />
			<div class="content">
				<div class="row"><strong>${car.year} ${car.make} ${car.model}</strong><span>$${car.price ? car.price.toLocaleString() : '0'}</span></div>
				<div class="row"><span>${car.body || ''} • ${car.color || ''}</span><span>${car.mileage ? car.mileage.toLocaleString() : '0'} mi</span></div>
				<div class="actions">
					<a class="view" href="car.html?id=${car.id}">View Details</a>
					<button class="fav" data-id="${car.id}" title="Add to favorites">👍</button>
				</div>
			</div>
		</div>
	`).join('');

	const favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
	Array.from(document.querySelectorAll('.fav')).forEach(btn => {
		const id = btn.getAttribute('data-id');
		if (favs.has(id)) {
			btn.classList.add('active');
			btn.title = 'Remove from favorites';
		}
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			const list = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
			if (list.has(id)) {
				list.delete(id);
				btn.title = 'Add to favorites';
				btn.style.background = '#6b7280';
			} else {
				list.add(id);
				btn.title = 'Remove from favorites';
				btn.style.background = '#ef4444';
			}
			localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(list)));
			btn.classList.toggle('active');
		});
	});
}

function renderPager(total, page, pageSize) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	let html = '';
	for (let i = 1; i <= totalPages; i++) {
		html += `<button ${i === page ? 'disabled' : ''} data-page="${i}">${i}</button>`;
	}
	pager.innerHTML = html;
	Array.from(pager.querySelectorAll('button')).forEach(b => b.addEventListener('click', () => {
		const s = readQuery();
		s.page = Number(b.getAttribute('data-page'));
		writeQuery(s);
		loadCarsClient();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}));
}

function loadCarsClient() {
	const state = readQuery();
	if (qEl) qEl.value = state.q;
	if (makeEl) makeEl.value = state.make;
	if (modelEl) modelEl.value = state.model;
	if (yearEl) yearEl.value = state.year;
	if (sortEl) sortEl.value = state.sort;
	const filtered = applyFilters(ALL_CARS, state);
	const pageSize = 12;
	const { data, total } = paginate(filtered, Math.max(1, state.page), pageSize);
	renderGrid(data);
	renderPager(total, Math.max(1, state.page), pageSize);
}

function openModal(id) {
	const car = ALL_CARS.find(c => c.id === id);
	if (!car) return;
	modalBody.innerHTML = `
		<div class="gallery">${(car.images || []).map(u => `<img src="${u}" alt="">`).join('')}</div>
		<div class="modal-body">
			<h3>${car.year} ${car.make} ${car.model}</h3>
			<p>${car.body || ''} • ${car.color || ''} • ${car.mileage.toLocaleString()} mi</p>
			<p><strong>$${car.price.toLocaleString()}</strong></p>
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
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const fd = new FormData(form);
		const payload = Object.fromEntries(fd.entries());
		payload.carId = car.id;
		await createLead(payload);
		leadMsg.textContent = 'Thanks! We will contact you soon.';
		form.reset();
	});
	modal.classList.remove('hidden');
}

if (closeModal) closeModal.addEventListener('click', () => modal.classList.add('hidden'));
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

if (grid) {
	(async function(){
		await loadCarsFromFirebase();
		loadFilters();
		loadCarsClient();
	})();
	if (applyBtn) applyBtn.addEventListener('click', () => {
		const s = { ...readQuery(), q: (qEl && qEl.value || '').trim(), make: makeEl ? makeEl.value : '', model: modelEl ? modelEl.value : '', year: yearEl ? yearEl.value : '', sort: sortEl ? sortEl.value : 'createdAt:desc', page: 1 };
		writeQuery(s);
		loadCarsClient();
	});
}

