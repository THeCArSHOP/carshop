import { signIn, listCars, createCar, updateCar, removeCar, listLeads, removeLead } from './firebase.js';

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

    // ========================================
    // INQUIRIES MANAGEMENT
    // ========================================
    
    const inquiriesTableBody = document.querySelector('#inquiriesTable tbody');
    
    async function refreshInquiries() {
        console.log('Refreshing inquiries...');
        try {
            console.log('Calling listLeads()...');
            const inquiries = await listLeads();
            console.log('Inquiries loaded:', inquiries);
            renderInquiriesRows(inquiries);
        } catch (error) {
            console.error('Error loading inquiries:', error);
            // Show error message in the table
            if (inquiriesTableBody) {
                inquiriesTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;padding:20px;color:#ef4444;">
                            Error loading inquiries: ${error.message}<br>
                            <small>Make sure you are logged in to the admin panel.</small>
                        </td>
                    </tr>
                `;
            }
        }
    }

    // Make refreshInquiries globally accessible
    window.refreshInquiries = refreshInquiries;
    
    async function renderInquiriesRows(inquiries) {
        if (!inquiriesTableBody) return;
        
        // Get all cars to match with inquiries
        const cars = await listCars();
        const carsMap = new Map(cars.map(car => [car.id, car]));
        
        inquiriesTableBody.innerHTML = inquiries.map(inquiry => {
            const car = inquiry.carId ? carsMap.get(inquiry.carId) : null;
            const createdAt = inquiry.createdAt?.toDate ? inquiry.createdAt.toDate() : new Date(inquiry.createdAt);
            const message = inquiry.message || 'No message provided';
            const truncatedMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
            
            return `
                <tr data-id="${inquiry.id}" style="height:40px;">
                    <td style="vertical-align:middle;padding:8px;">
                        <div style="font-size:12px;color:#e7e9ee;">${createdAt.toLocaleDateString()}</div>
                        <div style="font-size:11px;color:#9aa3b2;">${createdAt.toLocaleTimeString()}</div>
                    </td>
                    <td style="vertical-align:middle;padding:8px;">
                        <strong style="font-size:14px;color:#e7e9ee;">${inquiry.name || 'N/A'}</strong>
                    </td>
                    <td style="vertical-align:middle;padding:8px;">
                        <a href="mailto:${inquiry.email}" style="color:#3b82f6;text-decoration:none;font-size:13px;">${inquiry.email || 'N/A'}</a>
                    </td>
                    <td style="vertical-align:middle;padding:8px;">
                        ${inquiry.phone ? `<a href="tel:${inquiry.phone}" style="color:#3b82f6;text-decoration:none;font-size:13px;">${inquiry.phone}</a>` : '<span style="color:#9aa3b2;font-size:13px;">N/A</span>'}
                    </td>
                    <td style="vertical-align:middle;padding:8px;">
                        ${car ? `<span style="font-size:13px;color:#e7e9ee;">${car.year} ${car.make} ${car.model}</span>` : '<span style="color:#9aa3b2;font-size:13px;">General Inquiry</span>'}
                    </td>
                    <td style="vertical-align:middle;padding:8px;max-width:200px;">
                        <span style="font-size:13px;color:#e7e9ee;" title="${message}">${truncatedMessage}</span>
                    </td>
                    <td style="vertical-align:middle;text-align:center;padding:8px;">
                        <button class="delete-inquiry" style="background:#dc2626;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners for delete buttons
        inquiriesTableBody.querySelectorAll('.delete-inquiry').forEach(btn => btn.addEventListener('click', onDeleteInquiry));
    }
    
    async function onDeleteInquiry(e) {
        const tr = e.target.closest('tr');
        const id = tr.getAttribute('data-id');
        if (!confirm('Delete this inquiry?')) return;
        
        try {
            await removeLead(id);
            await refreshInquiries();
            alert('Inquiry deleted successfully!');
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            alert('Error deleting inquiry: ' + error.message);
        }
    }

    // Auto-refresh inquiries when admin panel loads
    function autoRefreshInquiries() {
        // Check if user is authenticated and admin panel is visible
        const adminMain = document.getElementById('adminMain');
        if (adminMain && adminMain.style.display !== 'none') {
            refreshInquiries();
        }
    }

    // initial load after admin.html auth gate
    document.addEventListener('DOMContentLoaded', () => {
        refresh();
        refreshInquiries();
        
        // Add refresh button event listener after DOM is ready
        const refreshInquiriesBtn = document.getElementById('refreshInquiries');
        if (refreshInquiriesBtn) {
            refreshInquiriesBtn.addEventListener('click', async () => {
                console.log('Refresh button clicked');
                refreshInquiriesBtn.textContent = '🔄 Loading...';
                refreshInquiriesBtn.disabled = true;
                
                try {
                    await refreshInquiries();
                } finally {
                    refreshInquiriesBtn.textContent = '🔄 Refresh Inquiries';
                    refreshInquiriesBtn.disabled = false;
                }
            });
        } else {
            console.log('Refresh button not found');
        }
        
        // Auto-refresh inquiries every 5 seconds
        setInterval(autoRefreshInquiries, 5000);
    });
})();

