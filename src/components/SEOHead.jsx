import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  property = null,
  structuredData = null,
  hashtags = []
}) => {
  const location = useLocation();
  const currentUrl = `https://contaboo.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image || 'https://contaboo.com/og-image.jpg', 'property');
    updateMetaTag('og:url', url || currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    
    // Twitter tags
    updateMetaTag('twitter:title', title, 'property');
    updateMetaTag('twitter:description', description, 'property');
    updateMetaTag('twitter:image', image || 'https://contaboo.com/og-image.jpg', 'property');
    updateMetaTag('twitter:url', url || currentUrl, 'property');

    // Canonical URL
    updateCanonicalLink(url || currentUrl);

    // Structured data for properties
    if (property && structuredData) {
      updateStructuredData(generatePropertyStructuredData(property));
    }

    // Add hashtags to meta keywords for social media optimization
    if (hashtags && hashtags.length > 0) {
      const hashtagKeywords = hashtags.join(', ');
      updateMetaTag('keywords', `${keywords}, ${hashtagKeywords}`);
    }

  }, [title, description, keywords, image, url, type, property, structuredData, hashtags]);

  return null; // This component doesn't render anything
};

// Helper functions
const updateMetaTag = (name, content, type = 'name') => {
  if (!content) return;
  
  let selector = `meta[${type}="${name}"]`;
  let element = document.querySelector(selector);
  
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(type, name);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

const updateCanonicalLink = (url) => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', url);
  } else {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    document.head.appendChild(canonical);
  }
};

const updateStructuredData = (data) => {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]#property-schema');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'property-schema';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

const generatePropertyStructuredData = (property) => {
  const baseUrl = 'https://contaboo.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.property_name || property.message,
    "description": property.full_description || property.message,
    "url": `${baseUrl}/property/${property.id}`,
    "image": property.images || [`${baseUrl}/default-property-image.jpg`],
    "datePosted": property.created_at || new Date().toISOString(),
    "validThrough": property.expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    "price": property.price_numeric || "محدد عند المعاينة",
    "priceCurrency": "EGP",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location || property.regions || "Cairo",
      "addressRegion": property.location || property.regions || "Cairo Governorate", 
      "addressCountry": "EG"
    },
    "geo": property.latitude && property.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude
    } : undefined,
    "floorSize": property.area_size ? {
      "@type": "QuantitativeValue",
      "value": property.area_size.replace(/[^\d]/g, ''),
      "unitText": "متر مربع"
    } : undefined,
    "numberOfRooms": property.bedroom || property.bedrooms || undefined,
    "numberOfBathroomsTotal": property.bathroom || property.bathrooms || undefined,
    "yearBuilt": property.year_built || undefined,
    "seller": {
      "@type": "RealEstateAgent",
      "name": property.sender || "Contaboo Real Estate",
      "telephone": property.agent_phone || "+20-xxx-xxx-xxxx",
      "url": "https://contaboo.com"
    },
    "category": property.property_type,
    "keywords": [
      property.property_type,
      property.location || property.regions,
      "عقارات مصر",
      "real estate egypt",
      ...(property.property_type === 'apartment' ? ['شقق للبيع', 'apartments for sale'] : []),
      ...(property.property_type === 'villa' ? ['فيلات للبيع', 'villas for sale'] : []),
      ...(property.property_type === 'land' ? ['أراضي للبيع', 'land for sale'] : [])
    ].filter(Boolean).join(', ')
  };
};

// SEO utility functions for hashtags and social media
export const generateSEOHashtags = (property, language = 'arabic') => {
  const hashtags = [];
  
  // Base hashtags
  const baseArabic = ['#عقارات_مصر', '#كونتابو', '#عقارات_للبيع'];
  const baseEnglish = ['#RealEstateEgypt', '#Contaboo', '#PropertiesForSale'];
  
  hashtags.push(...(language === 'arabic' ? baseArabic : baseEnglish));
  
  // Location hashtags
  if (property.location || property.regions) {
    const location = (property.location || property.regions).replace(/\s+/g, '_');
    hashtags.push(`#${location}`, `#عقارات_${location}`);
  }
  
  // Property type hashtags
  const propertyTypeMap = {
    apartment: {
      arabic: ['#شقق_للبيع', '#شقق'],
      english: ['#ApartmentsForSale', '#Apartments']
    },
    villa: {
      arabic: ['#فيلات_للبيع', '#فيلات'],
      english: ['#VillasForSale', '#Villas']
    },
    land: {
      arabic: ['#أراضي_للبيع', '#أراضي'],
      english: ['#LandForSale', '#Land']
    },
    office: {
      arabic: ['#مكاتب_للبيع', '#مكاتب_تجارية'],
      english: ['#OfficesForSale', '#CommercialOffices']
    }
  };
  
  const propertyType = property.property_type?.toLowerCase();
  if (propertyTypeMap[propertyType]) {
    hashtags.push(...propertyTypeMap[propertyType][language]);
  }
  
  // Price range hashtags
  if (property.price_numeric) {
    const price = parseInt(property.price_numeric);
    if (price < 1000000) hashtags.push('#أقل_من_مليون');
    else if (price < 2000000) hashtags.push('#مليون_إلى_مليونين');
    else hashtags.push('#فوق_المليونين');
  }
  
  return hashtags.slice(0, 15); // Limit to 15 hashtags
};

export const generateSocialMediaContent = (property, language = 'arabic') => {
  const hashtags = generateSEOHashtags(property, language);
  const baseText = language === 'arabic' 
    ? `🏠 ${property.property_name || 'عقار مميز للبيع'}\n📍 ${property.location || property.regions || 'مصر'}\n💰 ${property.price || 'السعر عند الاستفسار'}\n\n`
    : `🏠 ${property.property_name || 'Premium Property for Sale'}\n📍 ${property.location || property.regions || 'Egypt'}\n💰 ${property.price || 'Price on inquiry'}\n\n`;
  
  return `${baseText}${hashtags.join(' ')}`;
};

export default SEOHead;
