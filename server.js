const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');

const app = express();
const db = new Database(path.join(__dirname, 'carshop.db'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function initDb() {
	const createCarTable = `
		CREATE TABLE IF NOT EXISTS cars (
			id TEXT PRIMARY KEY,
			make TEXT NOT NULL,
			model TEXT NOT NULL,
			year INTEGER NOT NULL,
			price INTEGER NOT NULL,
			mileage INTEGER NOT NULL,
			body TEXT,
			color TEXT,
			thumbnail TEXT,
			createdAt TEXT NOT NULL
		);
	`;
	const createImageTable = `
		CREATE TABLE IF NOT EXISTS car_images (
			id TEXT PRIMARY KEY,
			carId TEXT NOT NULL,
			url TEXT NOT NULL,
			FOREIGN KEY (carId) REFERENCES cars(id) ON DELETE CASCADE
		);
	`;
	const createLeadTable = `
		CREATE TABLE IF NOT EXISTS leads (
			id TEXT PRIMARY KEY,
			carId TEXT,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			phone TEXT,
			message TEXT,
			createdAt TEXT NOT NULL,
			FOREIGN KEY (carId) REFERENCES cars(id) ON DELETE SET NULL
		);
	`;

	db.exec('PRAGMA foreign_keys = ON;');
	db.exec(createCarTable);
	db.exec(createImageTable);
	db.exec(createLeadTable);

	const count = db.prepare('SELECT COUNT(*) as c FROM cars').get().c;
	if (count === 0) {
		const insertCar = db.prepare(`
			INSERT INTO cars (id, make, model, year, price, mileage, body, color, thumbnail, createdAt)
			VALUES (@id, @make, @model, @year, @price, @mileage, @body, @color, @thumbnail, @createdAt)
		`);
		const insertImage = db.prepare(`
			INSERT INTO car_images (id, carId, url) VALUES (@id, @carId, @url)
		`);
		const now = new Date().toISOString();
		const sample = [
			{
				id: nanoid(), make: 'Toyota', model: 'Camry', year: 2020, price: 22000, mileage: 24000,
				body: 'Sedan', color: 'White', thumbnail: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format',
				createdAt: now, images: [
					'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format',
					'https://images.unsplash.com/photo-1549921296-3b4a6b9c2b84?q=80&w=1200&auto=format'
				]
			},
			{
				id: nanoid(), make: 'BMW', model: '3 Series', year: 2019, price: 28000, mileage: 30000,
				body: 'Sedan', color: 'Black', thumbnail: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=800&auto=format',
				createdAt: now, images: [
					'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format',
					'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format'
				]
			},
			{
				id: nanoid(), make: 'Ford', model: 'Mustang', year: 2021, price: 36000, mileage: 12000,
				body: 'Coupe', color: 'Red', thumbnail: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format',
				createdAt: now, images: [
					'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format'
				]
			}
		];

		const tx = db.transaction(() => {
			for (const car of sample) {
				insertCar.run(car);
				for (const url of car.images) {
					insertImage.run({ id: nanoid(), carId: car.id, url });
				}
			}
		});
		tx();
	}
}
initDb();

function buildCarRow(row) {
	const images = db.prepare('SELECT url FROM car_images WHERE carId = ?').all(row.id).map(r => r.url);
	return { ...row, images };
}

app.get('/api/cars', (req, res) => {
	const { q, make, model, minPrice, maxPrice, minYear, maxYear, sort = 'createdAt:desc', page = '1', pageSize = '12' } = req.query;

	const where = [];
	const params = {};
	if (q) {
		where.push('(make LIKE @q OR model LIKE @q OR color LIKE @q OR body LIKE @q)');
		params.q = `%${q}%`;
	}
	if (make) { where.push('make = @make'); params.make = make; }
	if (model) { where.push('model = @model'); params.model = model; }
	if (minPrice) { where.push('price >= @minPrice'); params.minPrice = Number(minPrice); }
	if (maxPrice) { where.push('price <= @maxPrice'); params.maxPrice = Number(maxPrice); }
	if (minYear) { where.push('year >= @minYear'); params.minYear = Number(minYear); }
	if (maxYear) { where.push('year <= @maxYear'); params.maxYear = Number(maxYear); }

	const [sortBy, sortDirRaw] = String(sort).split(':');
	const sortDir = sortDirRaw && sortDirRaw.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
	const allowedSort = ['createdAt','price','year','mileage'];
	const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const pageLen = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 12));
	const offset = (pageNum - 1) * pageLen;

	const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
	const countStmt = db.prepare(`SELECT COUNT(*) as c FROM cars ${whereSql}`);
	const total = countStmt.get(params).c;

	const rows = db.prepare(`
		SELECT * FROM cars
		${whereSql}
		ORDER BY ${sortColumn} ${sortDir}
		LIMIT @limit OFFSET @offset
	`).all({ ...params, limit: pageLen, offset });

	const data = rows.map(buildCarRow);
	res.json({ data, total, page: pageNum, pageSize: pageLen });
});

app.get('/api/cars/:id', (req, res) => {
	const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
	if (!row) return res.status(404).json({ error: 'Not found' });
	return res.json(buildCarRow(row));
});

app.post('/api/leads', (req, res) => {
	const { carId, name, email, phone, message } = req.body || {};
	if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
	const id = nanoid();
	const createdAt = new Date().toISOString();
	db.prepare(`
		INSERT INTO leads (id, carId, name, email, phone, message, createdAt)
		VALUES (@id, @carId, @name, @email, @phone, @message, @createdAt)
	`).run({ id, carId: carId || null, name, email, phone: phone || null, message: message || null, createdAt });
	res.json({ ok: true, id });
});

app.get('/api/meta/filters', (req, res) => {
	const makes = db.prepare('SELECT DISTINCT make FROM cars ORDER BY make').all().map(r => r.make);
	const models = db.prepare('SELECT DISTINCT model FROM cars ORDER BY model').all().map(r => r.model);
	const years = db.prepare('SELECT DISTINCT year FROM cars ORDER BY year DESC').all().map(r => r.year);
	res.json({ makes, models, years });
});

// Admin CRUD endpoints (no auth yet)
app.post('/api/admin/cars', (req, res) => {
	const { make, model, year, price, mileage, body, color, thumbnail, images = [] } = req.body || {};
	if (!make || !model || !year || !price || !mileage) {
		return res.status(400).json({ error: 'make, model, year, price, mileage are required' });
	}
	const car = {
		id: nanoid(),
		make,
		model,
		year: Number(year),
		price: Number(price),
		mileage: Number(mileage),
		body: body || null,
		color: color || null,
		thumbnail: thumbnail || null,
		createdAt: new Date().toISOString()
	};
	const insertCar = db.prepare(`
		INSERT INTO cars (id, make, model, year, price, mileage, body, color, thumbnail, createdAt)
		VALUES (@id, @make, @model, @year, @price, @mileage, @body, @color, @thumbnail, @createdAt)
	`);
	const insertImage = db.prepare(`INSERT INTO car_images (id, carId, url) VALUES (@id, @carId, @url)`);
	const tx = db.transaction(() => {
		insertCar.run(car);
		for (const url of images) {
			if (url && String(url).trim()) insertImage.run({ id: nanoid(), carId: car.id, url: String(url).trim() });
		}
	});
	tx();
	res.json(buildCarRow(car));
});

app.put('/api/admin/cars/:id', (req, res) => {
	const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
	if (!car) return res.status(404).json({ error: 'Not found' });
	const { make, model, year, price, mileage, body, color, thumbnail } = req.body || {};
	const updated = {
		...car,
		make: make ?? car.make,
		model: model ?? car.model,
		year: year != null ? Number(year) : car.year,
		price: price != null ? Number(price) : car.price,
		mileage: mileage != null ? Number(mileage) : car.mileage,
		body: body ?? car.body,
		color: color ?? car.color,
		thumbnail: thumbnail ?? car.thumbnail
	};
	db.prepare(`
		UPDATE cars SET make=@make, model=@model, year=@year, price=@price, mileage=@mileage, body=@body, color=@color, thumbnail=@thumbnail
		WHERE id=@id
	`).run({ ...updated, id: car.id });
	res.json(buildCarRow(updated));
});

app.delete('/api/admin/cars/:id', (req, res) => {
	const info = db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
	res.json({ ok: info.changes > 0 });
});

app.post('/api/admin/cars/:id/images', (req, res) => {
	const car = db.prepare('SELECT id FROM cars WHERE id = ?').get(req.params.id);
	if (!car) return res.status(404).json({ error: 'Car not found' });
	const { url } = req.body || {};
	if (!url) return res.status(400).json({ error: 'url required' });
	const image = { id: nanoid(), carId: car.id, url: String(url).trim() };
	db.prepare('INSERT INTO car_images (id, carId, url) VALUES (@id, @carId, @url)').run(image);
	res.json(image);
});

app.delete('/api/admin/images/:imageId', (req, res) => {
	const info = db.prepare('DELETE FROM car_images WHERE id = ?').run(req.params.imageId);
	res.json({ ok: info.changes > 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Car shop running at http://localhost:${PORT}`);
});
