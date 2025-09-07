import { listCars, createLead } from './firebase.js';

const carContent = document.getElementById('carContent');
let currentCar = null;
let currentImageIndex = 0;

// Get car ID from URL
function getCarId() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('id');
}

// Load car data
async function loadCar() {
	const carId = getCarId();
	if (!carId) {
		showError('No car ID provided');
		return;
	}

	try {
		const cars = await listCars();
		currentCar = cars.find(car => car.id === carId);
		
		if (!currentCar) {
			showError('Car not found');
			return;
		}

		renderCar();
	} catch (error) {
		console.error('Error loading car:', error);
		showError('Failed to load car details');
	}
}

// Show error message
function showError(message) {
	carContent.innerHTML = `
		<div class="error">
			<h2>Error</h2>
			<p>${message}</p>
			<a href="inventory.html" class="btn">Back to Inventory</a>
		</div>
	`;
}

// Render car details
function renderCar() {
	if (!currentCar) return;

	const images = currentCar.images || [currentCar.thumbnail];
	
	carContent.innerHTML = `
		<div class="car-header">
			<div class="car-gallery">
				<img id="mainImage" src="${images[0]}" alt="${currentCar.make} ${currentCar.model}" />
				${images.length > 1 ? `
					<div class="gallery-thumbnails">
						${images.map((img, index) => `
							<img src="${img}" alt="Gallery image ${index + 1}" 
								 class="${index === 0 ? 'active' : ''}" 
								 onclick="changeImage(${index})" />
						`).join('')}
					</div>
				` : ''}
			</div>
			<div class="car-info">
				<h1>${currentCar.year} ${currentCar.make} ${currentCar.model}</h1>
				<div class="car-price">$${currentCar.price.toLocaleString()}</div>
				
				<div class="car-specs">
					<div class="spec-item">
						<div class="spec-label">Year</div>
						<div class="spec-value">${currentCar.year}</div>
					</div>
					<div class="spec-item">
						<div class="spec-label">Make</div>
						<div class="spec-value">${currentCar.make}</div>
					</div>
					<div class="spec-item">
						<div class="spec-label">Model</div>
						<div class="spec-value">${currentCar.model}</div>
					</div>
					<div class="spec-item">
						<div class="spec-label">Body Style</div>
						<div class="spec-value">${currentCar.body || 'N/A'}</div>
					</div>
					<div class="spec-item">
						<div class="spec-label">Color</div>
						<div class="spec-value">${currentCar.color || 'N/A'}</div>
					</div>
					<div class="spec-item">
						<div class="spec-label">Mileage</div>
						<div class="spec-value">${currentCar.mileage.toLocaleString()} mi</div>
					</div>
					<div class="spec-item">
						<div class="spec-label">Price</div>
						<div class="spec-value">$${currentCar.price.toLocaleString()}</div>
					</div>
					<div class="spec-item">
						<div class="spec-label">VIN</div>
						<div class="spec-value">${currentCar.vin || 'N/A'}</div>
					</div>
					${currentCar.engine ? `
					<div class="spec-item">
						<div class="spec-label">Engine</div>
						<div class="spec-value">${currentCar.engine}</div>
					</div>
					` : ''}
					${currentCar.transmission ? `
					<div class="spec-item">
						<div class="spec-label">Transmission</div>
						<div class="spec-value">${currentCar.transmission}</div>
					</div>
					` : ''}
					${currentCar.fuelType ? `
					<div class="spec-item">
						<div class="spec-label">Fuel Type</div>
						<div class="spec-value">${currentCar.fuelType}</div>
					</div>
					` : ''}
				</div>

				${currentCar.description ? `
					<div class="car-description">
						<h3>Description</h3>
						<p>${currentCar.description}</p>
					</div>
				` : ''}
			</div>
		</div>

		<div class="contact-form">
			<h3>Interested in this vehicle?</h3>
			<p>Contact us for more information or to schedule a test drive.</p>
			<form id="inquiryForm">
				<div class="form-group">
					<label for="name">Full Name *</label>
					<input type="text" id="name" name="name" required />
				</div>
				<div class="form-group">
					<label for="email">Email Address *</label>
					<input type="email" id="email" name="email" required />
				</div>
				<div class="form-group">
					<label for="phone">Phone Number</label>
					<input type="tel" id="phone" name="phone" />
				</div>
				<div class="form-group">
					<label for="message">Message</label>
					<textarea id="message" name="message" placeholder="Tell us about your interest in this vehicle..."></textarea>
				</div>
				<button type="submit" class="btn-primary">Send Inquiry</button>
			</form>
			<div id="inquiryMessage"></div>
		</div>
	`;

	// Set up form submission
	const form = document.getElementById('inquiryForm');
	const messageDiv = document.getElementById('inquiryMessage');
	
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		
		const formData = new FormData(form);
		const inquiryData = {
			name: formData.get('name'),
			email: formData.get('email'),
			phone: formData.get('phone'),
			message: formData.get('message'),
			carId: currentCar.id,
			carInfo: `${currentCar.year} ${currentCar.make} ${currentCar.model}`,
			timestamp: new Date().toISOString()
		};

		try {
			// Save to Firebase
			await createLead(inquiryData);
			
			// Send email notification
			await sendEmailNotification(inquiryData);
			
			messageDiv.innerHTML = '<div style="color: green; margin-top: 15px;">Thank you! We will contact you soon about this vehicle.</div>';
			form.reset();
		} catch (error) {
			console.error('Error submitting inquiry:', error);
			messageDiv.innerHTML = '<div style="color: red; margin-top: 15px;">Sorry, there was an error submitting your inquiry. Please try again.</div>';
		}
	});
}

// Change main image
function changeImage(index) {
	if (!currentCar) return;
	
	const images = currentCar.images || [currentCar.thumbnail];
	const mainImage = document.getElementById('mainImage');
	const thumbnails = document.querySelectorAll('.gallery-thumbnails img');
	
	if (mainImage && images[index]) {
		mainImage.src = images[index];
		currentImageIndex = index;
		
		// Update thumbnail active state
		thumbnails.forEach((thumb, i) => {
			thumb.classList.toggle('active', i === index);
		});
	}
}

// Make changeImage globally available
window.changeImage = changeImage;

// Email notification function
async function sendEmailNotification(inquiryData) {
	try {
		// Initialize EmailJS
		emailjs.init(window.EMAILJS_CONFIG.publicKey);
		
		// Email template parameters
		const templateParams = {
			to_email: window.getContactEmail(), // Email from config file
			from_name: inquiryData.name,
			from_email: inquiryData.email,
			phone: inquiryData.phone || 'Not provided',
			car_info: inquiryData.carInfo,
			car_id: inquiryData.carId,
			message: inquiryData.message || 'No message provided',
			date: new Date().toLocaleString()
		};
		
		// Send email
		const result = await emailjs.send(
			window.EMAILJS_CONFIG.serviceId,
			window.EMAILJS_CONFIG.templateId,
			templateParams
		);
		
		console.log('Email sent successfully:', result);
		return result;
	} catch (error) {
		console.error('Error sending email:', error);
		// Don't throw error - we still want to save to Firebase even if email fails
	}
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
	// Set footer year
	const footerYear = document.getElementById('footerYear');
	if (footerYear) {
		footerYear.textContent = new Date().getFullYear();
	}

	// Set up drawer
	const drawer = document.getElementById('drawer');
	const openBtn = document.getElementById('openDrawer');
	const backdrop = document.getElementById('backdrop');
	
	function close() { 
		drawer.classList.remove('open'); 
		backdrop.classList.remove('show'); 
	}
	function open() { 
		drawer.classList.add('open'); 
		backdrop.classList.add('show'); 
	}
	
	if (openBtn) openBtn.addEventListener('click', open);
	if (backdrop) backdrop.addEventListener('click', close);

	// Load car data
	loadCar();
});
