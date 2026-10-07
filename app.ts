import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { createProperty, searchProperties } from './controllers/propertyController';
import { upload, compressImages } from './middleware/upload';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.post('/api/properties', upload.array('images', 10), compressImages, createProperty);
app.get('/api/properties/search', searchProperties);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
