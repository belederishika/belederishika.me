import { Request, Response } from 'express';
import { db } from '../db';
import { CreatePropertyInput, SearchQueryParams } from '../types/property';

// 1. Create a New Property Listing
export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const input: CreatePropertyInput = req.body;
    const images: string[] = req.files ? (req.files as Express.Multer.File[]).map(f => f.path) : [];

    const query = `
      INSERT INTO properties (
        title, description, price, property_type, listing_type,
        bedrooms, bathrooms, sqft, address, location, images, agent_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        ST_SetSRID(ST_MakePoint($10, $11), 4326)::geography,
        $12, $13
      )
      RETURNING *, ST_AsGeoJSON(location) as location_geojson;
    `;

    const values = [
      input.title,
      input.description || null,
      input.price,
      input.property_type,
      input.listing_type,
      input.bedrooms,
      input.bathrooms,
      input.sqft,
      JSON.stringify(input.address),
      input.lng, // ST_MakePoint takes (longitude, latitude)
      input.lat,
      images,
      input.agent_id
    ];

    const result = await db.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 2. Multi-Filter & Geospatial Radius Search
export const searchProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      minPrice,
      maxPrice,
      propertyType,
      listingType,
      bedrooms,
      lat,
      lng,
      radiusInKm = 10,
      page = 1,
      limit = 20,
    } = req.query as unknown as SearchQueryParams;

    const conditions: string[] = ["status = 'published'"];
    const values: any[] = [];
    let paramIndex = 1;

    if (minPrice) {
      conditions.push(`price >= $${paramIndex++}`);
      values.push(minPrice);
    }
    if (maxPrice) {
      conditions.push(`price <= $${paramIndex++}`);
      values.push(maxPrice);
    }
    if (propertyType) {
      conditions.push(`property_type = $${paramIndex++}`);
      values.push(propertyType);
    }
    if (listingType) {
      conditions.push(`listing_type = $${paramIndex++}`);
      values.push(listingType);
    }
    if (bedrooms) {
      conditions.push(`bedrooms >= $${paramIndex++}`);
      values.push(bedrooms);
    }

    // Spatial filter: ST_DWithin uses meters for Geography type
    if (lat && lng) {
      conditions.push(
        `ST_DWithin(location, ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)::geography, $${paramIndex++})`
      );
      values.push(lng, lat, radiusInKm * 1000);
    }

    const offset = (page - 1) * limit;
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT id, title, price, property_type, listing_type, bedrooms, bathrooms, sqft, address,
             ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, images, created_at
      FROM properties
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    values.push(limit, offset);

    const result = await db.query(query, values);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      page: Number(page),
      data: result.rows,
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
