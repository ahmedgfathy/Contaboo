#!/bin/bash

echo "🎨 Starting React Frontend Migration for Real Estate CRM..."

# Function to add mobile masking utility
add_mobile_masking() {
    echo "📱 Adding mobile number masking utility..."
    
    mkdir -p src/utils
    
    cat > src/utils/mobileUtils.js << 'EOF'
// Mobile number utilities for React Real Estate CRM

export const MOBILE_REGEX = /(\+?2?01[0-2,5]{1}[0-9]{8})/g;

export const maskMobile = (text, isLoggedIn) => {
  const regex = /(\+?2?01[0-2,5]{1}[0-9]{8})/g;
  return isLoggedIn
    ? text
    : text.replace(regex, (match) => match.slice(0, 2) + "*********");
};

export const extractMobile = (text) => {
  const match = text.match(MOBILE_REGEX);
  return match ? match[0] : null;
};

export const formatMobile = (mobile) => {
  if (!mobile) return '';
  // Format Egyptian mobile numbers: +20 1XX XXX XXXX
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.startsWith('2')) {
    const formatted = cleaned.slice(1); // Remove country code for formatting
    return `+20 ${formatted.slice(0, 3)} ${formatted.slice(3, 6)} ${formatted.slice(6)}`;
  }
  return mobile;
};

export const validateMobile = (mobile) => {
  return MOBILE_REGEX.test(mobile);
};
EOF

    echo "✅ Mobile utilities created!"
}

# Function to create enhanced React components
create_enhanced_react_components() {
    echo "🧩 Creating enhanced React components..."
    
    # Create PropertyCard component for React
    cat > src/components/PropertyCard.jsx << 'EOF'
import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, CurrencyDollarIcon, HomeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { maskMobile } from '../utils/mobileUtils';
import { isUserAuthenticated } from '../services/apiService';

const PropertyCard = ({ property, onClick, language = 'arabic' }) => {
  const isLoggedIn = isUserAuthenticated();
  
  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      apartment: language === 'arabic' ? 'شقة' : 'Apartment',
      villa: language === 'arabic' ? 'فيلا' : 'Villa',
      land: language === 'arabic' ? 'أرض' : 'Land',
      office: language === 'arabic' ? 'مكتب' : 'Office',
      warehouse: language === 'arabic' ? 'مخزن' : 'Warehouse'
    };
    return labels[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="property-card bg-white rounded-lg shadow-md p-6 mb-4 cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => onClick && onClick(property)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {property.purpose || (language === 'arabic' ? 'غرض غير محدد' : 'Unknown Purpose')}
        </h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {getPropertyTypeLabel(property.property_type)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {property.area && (
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-500" />
            <div>
              <label className="text-sm text-gray-600">
                {language === 'arabic' ? 'المنطقة:' : 'Area:'}
              </label>
              <p className="font-medium">{property.area}</p>
            </div>
          </div>
        )}
        
        {property.price && (
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
            <div>
              <label className="text-sm text-gray-600">
                {language === 'arabic' ? 'السعر:' : 'Price:'}
              </label>
              <p className="font-medium text-green-600">
                {formatPrice(property.price)}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {property.description && (
        <div className="mb-4">
          <label className="text-sm text-gray-600">
            {language === 'arabic' ? 'الوصف:' : 'Description:'}
          </label>
          <p className="text-gray-800 text-sm line-clamp-2">{property.description}</p>
        </div>
      )}
      
      {(property.broker_name || property.broker_mobile) && (
        <div className="border-t pt-3">
          <label className="text-sm text-gray-600 flex items-center gap-1">
            <PhoneIcon className="w-4 h-4" />
            {language === 'arabic' ? 'معلومات الوسيط:' : 'Broker Info:'}
          </label>
          <div className="flex justify-between items-center">
            {property.broker_name && (
              <span className="text-sm">{property.broker_name}</span>
            )}
            {property.broker_mobile && (
              <a 
                href={`tel:${property.broker_mobile}`}
                className="text-blue-600 hover:underline text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {maskMobile(property.broker_mobile, isLoggedIn)}
              </a>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PropertyCard;
EOF

    echo "✅ Enhanced React components created!"
}

# Execute React-specific updates
echo "🚀 Starting React frontend migration..."

add_mobile_masking
create_enhanced_react_components

echo "✅ React frontend migration completed!"

echo "🎉 React Frontend Migration Summary:"
echo "   - Added mobile number masking utility with REGEX: (\+?2?01[0-2,5]{1}[0-9]{8})"
echo "   - Created enhanced PropertyCard component"
echo "   - Added proper React patterns and hooks"
echo "   - Integrated mobile masking function: maskMobile(text, isLoggedIn)"
echo "   - Ready for real estate data with purpose, area, price, broker info"
echo ""
echo "Ready for testing and deployment! 🚀"
