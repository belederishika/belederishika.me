export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreatePropertyInput {
  title: string;
  description?: string;
  price: number;
  property_type: 'apartment' | 'house' | 'commercial';
  listing_type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: Address;
  lat: number;
  lng: number;
  agent_id: string;
}

export interface SearchQueryParams {
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  listingType?: string;
  bedrooms?: number;
  lat?: number;
  lng?: number;
  radiusInKm?: number;
  page?: number;
  limit?: number;
}
