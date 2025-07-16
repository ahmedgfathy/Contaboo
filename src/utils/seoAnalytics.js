// SEO Analytics and monitoring utilities
export class SEOAnalytics {
  constructor() {
    this.baseUrl = 'https://contaboo.com';
  }

  // Track page views for SEO analytics
  trackPageView(page, title) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_TRACKING_ID', {
        page_title: title,
        page_location: `${this.baseUrl}${page}`
      });
    }

    // Custom analytics for property searches
    this.trackCustomEvent('page_view', {
      page_path: page,
      page_title: title,
      timestamp: new Date().toISOString()
    });
  }

  // Track property interactions for SEO insights
  trackPropertyInteraction(property, action) {
    const eventData = {
      event_name: 'property_interaction',
      property_id: property.id,
      property_type: property.property_type,
      location: property.location || property.regions,
      action: action, // 'view', 'share', 'contact', 'favorite'
      timestamp: new Date().toISOString()
    };

    // Google Analytics event
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: 'property',
        event_label: `${property.property_type} in ${property.location || property.regions}`,
        value: property.price_numeric || 0
      });
    }

    this.trackCustomEvent('property_interaction', eventData);
  }

  // Track search behavior for SEO optimization
  trackSearch(searchTerm, filters, results) {
    const searchData = {
      search_term: searchTerm,
      filters: filters,
      results_count: results.length,
      timestamp: new Date().toISOString()
    };

    // Google Analytics search event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: searchTerm,
        event_category: 'engagement',
        custom_parameters: {
          results_count: results.length,
          filters_applied: Object.keys(filters).length
        }
      });
    }

    this.trackCustomEvent('search', searchData);
  }

  // Track AI interactions for SEO insights
  trackAIInteraction(query, response, success) {
    const aiData = {
      query: query,
      response_type: success ? 'successful' : 'fallback',
      timestamp: new Date().toISOString()
    };

    if (typeof gtag !== 'undefined') {
      gtag('event', 'ai_interaction', {
        event_category: 'ai',
        event_label: success ? 'successful' : 'fallback',
        custom_parameters: {
          query_length: query.length
        }
      });
    }

    this.trackCustomEvent('ai_interaction', aiData);
  }

  // Custom event tracking
  trackCustomEvent(eventName, data) {
    // Store in localStorage for analytics
    const analytics = JSON.parse(localStorage.getItem('seo_analytics') || '[]');
    analytics.push({
      event: eventName,
      data: data,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 events
    if (analytics.length > 100) {
      analytics.splice(0, analytics.length - 100);
    }

    localStorage.setItem('seo_analytics', JSON.stringify(analytics));

    // Send to backend for analysis (optional)
    this.sendAnalyticsToBackend(eventName, data);
  }

  // Send analytics data to backend
  async sendAnalyticsToBackend(eventName, data) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          data: data,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }

  // Generate SEO report
  generateSEOReport() {
    const analytics = JSON.parse(localStorage.getItem('seo_analytics') || '[]');
    
    const report = {
      total_events: analytics.length,
      page_views: analytics.filter(a => a.event === 'page_view').length,
      property_interactions: analytics.filter(a => a.event === 'property_interaction').length,
      searches: analytics.filter(a => a.event === 'search').length,
      ai_interactions: analytics.filter(a => a.event === 'ai_interaction').length,
      most_viewed_properties: this.getMostViewedProperties(analytics),
      popular_search_terms: this.getPopularSearchTerms(analytics),
      top_locations: this.getTopLocations(analytics)
    };

    return report;
  }

  getMostViewedProperties(analytics) {
    const propertyViews = {};
    analytics
      .filter(a => a.event === 'property_interaction' && a.data.action === 'view')
      .forEach(a => {
        const id = a.data.property_id;
        propertyViews[id] = (propertyViews[id] || 0) + 1;
      });

    return Object.entries(propertyViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  getPopularSearchTerms(analytics) {
    const searchTerms = {};
    analytics
      .filter(a => a.event === 'search')
      .forEach(a => {
        const term = a.data.search_term.toLowerCase();
        if (term) {
          searchTerms[term] = (searchTerms[term] || 0) + 1;
        }
      });

    return Object.entries(searchTerms)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  getTopLocations(analytics) {
    const locations = {};
    analytics
      .filter(a => a.event === 'property_interaction')
      .forEach(a => {
        const location = a.data.location;
        if (location) {
          locations[location] = (locations[location] || 0) + 1;
        }
      });

    return Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }
}

// Schema markup generators for different page types
export const generatePropertySchema = (property) => {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.property_name || property.message,
    "description": property.full_description || property.message,
    "url": `https://contaboo.com/property/${property.id}`,
    "datePosted": property.created_at || new Date().toISOString(),
    "price": property.price_numeric || "محدد عند المعاينة",
    "priceCurrency": "EGP",
    "image": property.images || [`https://contaboo.com/default-property-image.jpg`],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location || property.regions || "Cairo",
      "addressRegion": property.location || property.regions || "Cairo Governorate",
      "addressCountry": "EG"
    },
    "offers": {
      "@type": "Offer",
      "price": property.price_numeric || "0",
      "priceCurrency": "EGP",
      "availability": "https://schema.org/InStock"
    }
  };
};

export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// Create global SEO analytics instance
export const seoAnalytics = new SEOAnalytics();
