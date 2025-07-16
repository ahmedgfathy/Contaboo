import { SitemapGenerator } from '../../src/utils/seoUtils.js';

const sitemapGenerator = new SitemapGenerator('https://contaboo.com');

export default async function handler(req, res) {
  try {
    const { type } = req.query;

    // Set proper headers for XML
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    switch(type) {
      case 'index':
        const sitemapIndex = sitemapGenerator.generateSitemapIndex();
        return res.status(200).send(sitemapIndex);

      case 'main':
        const mainSitemap = sitemapGenerator.generateMainSitemap();
        return res.status(200).send(mainSitemap);

      case 'properties':
        // Fetch properties from your database
        const propertiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/properties`);
        const properties = propertiesResponse.ok ? await propertiesResponse.json() : [];
        
        const propertiesSitemap = await sitemapGenerator.generatePropertiesSitemap(properties);
        return res.status(200).send(propertiesSitemap);

      case 'locations':
        const locationsSitemap = sitemapGenerator.generateLocationsSitemap();
        return res.status(200).send(locationsSitemap);

      default:
        // Default to main sitemap index
        const defaultSitemap = sitemapGenerator.generateSitemapIndex();
        return res.status(200).send(defaultSitemap);
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}
