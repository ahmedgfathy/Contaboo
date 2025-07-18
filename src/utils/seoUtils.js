// Sitemap generator for real estate properties
export class SitemapGenerator {
  constructor(baseUrl = 'https://contaboo.com') {
    this.baseUrl = baseUrl;
  }

  // Generate main sitemap index
  generateSitemapIndex() {
    const sitemaps = [
      {
        loc: `${this.baseUrl}/sitemap-main.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/sitemap-properties.xml`, 
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/sitemap-locations.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      }
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    return xml;
  }

  // Generate main pages sitemap
  generateMainSitemap() {
    const pages = [
      {
        loc: this.baseUrl,
        changefreq: 'daily',
        priority: '1.0',
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/search`,
        changefreq: 'daily', 
        priority: '0.8',
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/login`,
        changefreq: 'monthly',
        priority: '0.5',
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/register`,
        changefreq: 'monthly',
        priority: '0.5', 
        lastmod: new Date().toISOString().split('T')[0]
      }
    ];

    return this.generateXmlSitemap(pages);
  }

  // Generate properties sitemap
  async generatePropertiesSitemap(properties) {
    const propertyUrls = properties.map(property => ({
      loc: `${this.baseUrl}/property/${property.id}`,
      changefreq: 'weekly',
      priority: '0.9',
      lastmod: property.updated_at ? new Date(property.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      images: property.images ? property.images.map(img => ({
        loc: img.url,
        caption: property.property_name || property.message,
        title: `${property.property_type} in ${property.location || property.regions || 'Egypt'}`
      })) : []
    }));

    return this.generateXmlSitemap(propertyUrls, true);
  }

  // Generate locations sitemap
  generateLocationsSitemap() {
    const egyptianCities = [
      'القاهرة', 'الجيزة', 'الإسكندرية', 'مدينة نصر', 'مصر الجديدة', 'الزمالك',
      'المعادي', 'حدائق الأهرام', 'مدينة الشيخ زايد', 'مدينة 6 أكتوبر', 'التجمع الخامس',
      'العاشر من رمضان', 'الهرم', 'فيصل', 'الدقي', 'المهندسين', 'العجوزة'
    ];

    const locationUrls = egyptianCities.map(city => ({
      loc: `${this.baseUrl}/search?location=${encodeURIComponent(city)}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: new Date().toISOString().split('T')[0]
    }));

    return this.generateXmlSitemap(locationUrls);
  }

  // Helper to generate XML sitemap
  generateXmlSitemap(urls, includeImages = false) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${includeImages ? '\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''}>
${urls.map(url => {
  let urlXml = `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;
    
  if (includeImages && url.images && url.images.length > 0) {
    url.images.forEach(image => {
      urlXml += `\n    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:caption>${image.caption}</image:caption>
      <image:title>${image.title}</image:title>
    </image:image>`;
    });
  }
  
  urlXml += '\n  </url>';
  return urlXml;
}).join('\n')}
</urlset>`;

    return xml;
  }

  // Generate hashtag-optimized content for social media
  generateSEOHashtags(property) {
    const baseHashtags = [
      '#عقارات_مصر', '#كونتابو', '#Contaboo', '#عقارات_للبيع',
      '#RealEstateEgypt', '#PropertiesForSale', '#EgyptRealEstate'
    ];

    const locationHashtags = [];
    if (property.location || property.regions) {
      const location = (property.location || property.regions).replace(/\s+/g, '_');
      locationHashtags.push(`#${location}`, `#عقارات_${location}`);
    }

    const propertyTypeHashtags = [];
    switch(property.property_type?.toLowerCase()) {
      case 'apartment':
        propertyTypeHashtags.push('#شقق_للبيع', '#ApartmentsForSale', '#شقق');
        break;
      case 'villa':
        propertyTypeHashtags.push('#فيلات_للبيع', '#VillasForSale', '#فيلات');
        break;
      case 'land':
        propertyTypeHashtags.push('#أراضي_للبيع', '#LandForSale', '#أراضي');
        break;
      case 'office':
        propertyTypeHashtags.push('#مكاتب_للبيع', '#OfficesForSale', '#مكاتب_تجارية');
        break;
    }

    return [...baseHashtags, ...locationHashtags, ...propertyTypeHashtags].slice(0, 15);
  }
}
