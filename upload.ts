import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const compressImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.files || !(req.files as Express.Multer.File[]).length) {
    return next();
  }

  const files = req.files as Express.Multer.File[];
  const outputDir = path.join(__dirname, '../uploads');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    await Promise.all(
      files.map(async (file) => {
        const filename = `prop-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const outputPath = path.join(outputDir, filename);

        await sharp(file.buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);

        // Replace file object properties with optimized image path
        file.path = `/uploads/${filename}`;
      })
    );
    next();
  } catch (error) {
    console.error('Image compression error:', error);
    res.status(500).json({ error: 'Failed to process images' });
  }
};
