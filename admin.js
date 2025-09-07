import { signIn, listCars, createCar, updateCar, removeCar } from './firebase.js';

(function(){
	const tableBody = document.querySelector('#carsTable tbody');
    const createForm = document.getElementById('createForm');

    async function refresh() {
        const cars = await listCars();
        renderRows(cars);
    }

    function renderRows(cars) {
        if (!tableBody) return;
        tableBody.innerHTML = cars.map(c => `
            <tr data-id="${c.id}">
                <td style="vertical-align:middle;height:60px;">
                    <div style="display:flex;flex-direction:column;justify-content:center;height:100%;">
                        <strong style="font-size:16px;line-height:1.2;">${c.make || ''} ${c.model || ''}</strong>
                        <span style="color:#9aa3b2;font-size:14px;line-height:1.2;">${c.year || ''} • ${c.body || ''} • ${c.color || ''}</span>
                    </div>
                </td>
                <td style="vertical-align:middle;text-align:center;height:60px;">
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;">
                        <strong style="font-size:16px;color:#3b82f6;">$${c.price ? c.price.toLocaleString() : '0'}</strong>
                    </div>
                </td>
                <td style="vertical-align:middle;text-align:center;height:60px;">
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;">
                        <span style="font-size:14px;">${c.mileage ? c.mileage.toLocaleString() : '0'} mi</span>
                    </div>
                </td>
                <td style="vertical-align:middle;text-align:center;height:60px;">
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;">
                        <span style="font-size:14px;color:${c.featured ? '#f59e0b' : '#9aa3b2'};">
                            ${c.featured ? '⭐ Featured' : 'Regular'}
                        </span>
                    </div>
                </td>
                <td style="vertical-align:middle;text-align:center;height:60px;" class="admin-actions">
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;gap:8px;">
                        <button class="edit-btn">Edit</button>
                        <button class="delete">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

        tableBody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', onEdit));
        tableBody.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', onDelete));
    }

    // Edit modal functionality
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEdit = document.getElementById('cancelEdit');

    function showEditModal() {
        if (editModal) editModal.style.display = 'flex';
    }

    function hideEditModal() {
        if (editModal) editModal.style.display = 'none';
    }

    async function onEdit(e) {
	const tr = e.target.closest('tr');
	const id = tr.getAttribute('data-id');
        
        try {
            const cars = await listCars();
            const car = cars.find(c => c.id === id);
            if (!car) {
                alert('Car not found');
                return;
            }

            // Populate edit form with car data
            document.getElementById('editCarId').value = car.id;
            document.getElementById('editMake').value = car.make || '';
            document.getElementById('editModel').value = car.model || '';
            document.getElementById('editYear').value = car.year || '';
            document.getElementById('editPrice').value = car.price || '';
            document.getElementById('editMileage').value = car.mileage || '';
            document.getElementById('editBody').value = car.body || '';
            document.getElementById('editColor').value = car.color || '';
            document.getElementById('editVin').value = car.vin || '';
            document.getElementById('editEngine').value = car.engine || '';
            document.getElementById('editTransmission').value = car.transmission || '';
            document.getElementById('editFuelType').value = car.fuelType || '';
            document.getElementById('editDescription').value = car.description || '';
            document.getElementById('editThumbnail').value = car.thumbnail || '';
            
            // Populate individual image fields
            const images = Array.isArray(car.images) ? car.images : [];
            for (let i = 1; i <= 5; i++) {
                const imageField = document.getElementById(`editImage${i}`);
                if (imageField) {
                    imageField.value = images[i - 1] || '';
                }
            }
            
            document.getElementById('editFeatured').checked = car.featured || false;

            showEditModal();
        } catch (error) {
            console.error('Error loading car for edit:', error);
            alert('Error loading car details: ' + error.message);
        }
}

async function onDelete(e) {
	const tr = e.target.closest('tr');
	const id = tr.getAttribute('data-id');
	if (!confirm('Delete this car?')) return;
	await removeCar(id);
        await refresh();
}

    // Edit form submission
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Updating car...');
            
            try {
                const carId = document.getElementById('editCarId').value;
                const fd = new FormData(editForm);
                
                // Collect individual image URLs
                const imageUrls = [];
                for (let i = 1; i <= 5; i++) {
                    const url = fd.get(`image${i}`);
                    if (url && url.trim()) {
                        imageUrls.push(url.trim());
                    }
                }
                
                const updates = {
                    make: fd.get('make'),
                    model: fd.get('model'),
                    year: Number(fd.get('year')),
                    price: Number(fd.get('price')),
                    mileage: Number(fd.get('mileage')),
                    body: String(fd.get('body') || ''),
                    color: String(fd.get('color') || ''),
                    vin: String(fd.get('vin') || ''),
                    engine: String(fd.get('engine') || ''),
                    transmission: String(fd.get('transmission') || ''),
                    fuelType: String(fd.get('fuelType') || ''),
                    description: String(fd.get('description') || ''),
                    thumbnail: String(fd.get('thumbnail') || ''),
                    images: imageUrls,
                    featured: fd.get('featured') === 'on'
                };
                
                // Enforce at most 3 featured vehicles
                if (updates.featured) {
                    const all = await listCars();
                    const featured = all.filter(c => c.featured && c.id !== carId);
                    if (featured.length >= 3) {
                        alert('You can only feature up to 3 cars. Uncheck another first.');
                        return;
                    }
                }
                
                console.log('Car updates:', updates);
                
                await updateCar(carId, updates);
                console.log('Car updated successfully');
                
                hideEditModal();
                await refresh();
                
                // Show success message
                alert('Car updated successfully!');
                
            } catch (error) {
                console.error('Error updating car:', error);
                alert('Error updating car: ' + error.message);
            }
        });
    }

    // Modal event listeners
    if (closeEditModal) {
        closeEditModal.addEventListener('click', hideEditModal);
    }
    
    if (cancelEdit) {
        cancelEdit.addEventListener('click', hideEditModal);
    }
    
    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                hideEditModal();
            }
        });
    }

    if (createForm) createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Creating car...');
        
        try {
            const fd = new FormData(createForm);
            
            // Collect individual image URLs
            const imageUrls = [];
            for (let i = 1; i <= 5; i++) {
                const url = fd.get(`image${i}`);
                if (url && url.trim()) {
                    imageUrls.push(url.trim());
                }
            }
            
            const payload = {
                make: fd.get('make'),
                model: fd.get('model'),
                year: Number(fd.get('year')),
                price: Number(fd.get('price')),
                mileage: Number(fd.get('mileage')),
                body: String(fd.get('body') || ''),
                color: String(fd.get('color') || ''),
                vin: String(fd.get('vin') || ''),
                engine: String(fd.get('engine') || ''),
                transmission: String(fd.get('transmission') || ''),
                fuelType: String(fd.get('fuelType') || ''),
                description: String(fd.get('description') || ''),
                thumbnail: String(fd.get('thumbnail') || ''),
                images: imageUrls,
                featured: false
            };
            
            console.log('Car payload:', payload);
            
            const result = await createCar(payload);
            console.log('Car created successfully:', result);
            
            createForm.reset();
            await refresh();
            
            // Show success message
            alert('Car created successfully!');
            
        } catch (error) {
            console.error('Error creating car:', error);
            alert('Error creating car: ' + error.message);
        }
    });

    // initial load after admin.html auth gate
    document.addEventListener('DOMContentLoaded', refresh);
})();

