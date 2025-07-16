#!/bin/bash

echo "🎨 Starting React Frontend Migration for Real Estate App..."

# Function to update React JSX files
update_react_components() {
    echo "📝 Updating React components (.jsx files)..."
    
    # Find all React component files
    find src -name "*.jsx" -type f | while read file; do
        echo "Processing: $file"
        
        # Update state variable names
        sed -i 's/chatContent/messageText/g' "$file"
        sed -i 's/oldFieldName/purpose/g' "$file"
        sed -i 's/legacyDesc/description/g' "$file"
        sed -i 's/agentPhone/brokerMobile/g' "$file"
        sed -i 's/agentName/brokerName/g' "$file"
        
        # Update form field names in React components
        sed -i 's/name="chatContent"/name="message_text"/g' "$file"
        sed -i 's/name="oldFieldName"/name="purpose"/g' "$file"
        sed -i 's/name="descriptionText"/name="description"/g' "$file"
        sed -i 's/name="agentPhone"/name="broker_mobile"/g' "$file"
        sed -i 's/name="agentName"/name="broker_name"/g' "$file"
        
        # Update value props in React inputs
        sed -i 's/value={oldProp}/value={area}/g' "$file"
        sed -i 's/value={outdatedField}/value={price}/g' "$file"
        sed -i 's/value={chatContent}/value={messageText}/g' "$file"
        
        # Update table headers in JSX
        sed -i 's/<th[^>]*>Chat Content<\/th>/<th>Message Text<\/th>/g' "$file"
        sed -i 's/<th[^>]*>Old Header<\/th>/<th>Purpose<\/th>/g' "$file"
        sed -i 's/<th[^>]*>Legacy Field<\/th>/<th>Area<\/th>/g' "$file"
        sed -i 's/<th[^>]*>Agent Phone<\/th>/<th>Broker Mobile<\/th>/g' "$file"
        sed -i 's/<th[^>]*>Agent Name<\/th>/<th>Broker Name<\/th>/g' "$file"
        
        # Update object property access in JSX expressions
        sed -i 's/{data\.chatContent}/{data.message_text}/g' "$file"
        sed -i 's/{response\.oldKey}/{response.purpose}/g' "$file"
        sed -i 's/{item\.legacyField}/{item.area}/g' "$file"
        sed -i 's/{property\.chatContent}/{property.message_text}/g' "$file"
        sed -i 's/{property\.agentPhone}/{property.broker_mobile}/g' "$file"
        sed -i 's/{property\.agentName}/{property.broker_name}/g' "$file"
        
        # Update onChange handlers
        sed -i 's/onChange={(e) => setChatContent/onChange={(e) => setMessageText/g' "$file"
        sed -i 's/onChange={(e) => setOldField/onChange={(e) => setPurpose/g' "$file"
        sed -i 's/onChange={(e) => setAgentPhone/onChange={(e) => setBrokerMobile/g' "$file"
        
    done
}

# Function to update JavaScript service files
update_js_services() {
    echo "⚡ Updating JavaScript service files..."
    
    # Find all JS files in src
    find src -name "*.js" | while read file; do
        echo "Processing: $file"
        
        # Update variable declarations
        sed -i 's/\blet chatData\b/let messageData/g' "$file"
        sed -i 's/\bconst oldField\b/const purpose/g' "$file"
        sed -i 's/\bvar legacyData\b/var propertyData/g' "$file"
        sed -i 's/\bagentPhone\b/brokerMobile/g' "$file"
        sed -i 's/\bagentName\b/brokerName/g' "$file"
        
        # Update object property access
        sed -i 's/\.chatContent\b/.message_text/g' "$file"
        sed -i 's/\.oldKey\b/.purpose/g' "$file"
        sed -i 's/\.legacyField\b/.area/g' "$file"
        sed -i 's/\.agentPhone\b/.broker_mobile/g' "$file"
        sed -i 's/\.agentName\b/.broker_name/g' "$file"
        
        # Update API endpoints
        sed -i 's/\/api\/chat-content/\/api\/messages/g' "$file"
        sed -i 's/\/api\/legacy-data/\/api\/properties/g' "$file"
        
        # Update JSON keys in API calls
        sed -i 's/"chatContent"/"message_text"/g' "$file"
        sed -i 's/"oldKey"/"purpose"/g' "$file"
        sed -i 's/"legacyField"/"area"/g' "$file"
        sed -i 's/"agentPhone"/"broker_mobile"/g' "$file"
        sed -i 's/"agentName"/"broker_name"/g' "$file"
        
    done
}

# Function to create enhanced React components
create_enhanced_react_components() {
    echo "🧩 Creating enhanced React components..."
    
    # Create PropertyCard component for React
    cat > src/components/PropertyCard.jsx << 'EOF'
import React from 'react';

const PropertyCard = ({ property, onClick }) => {
  const formatPrice = (price) => {
    if (!price) return 'Price not specified';
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      apartment: 'شقة',
      villa: 'فيلا', 
      land: 'أرض',
      office: 'مكتب',
      warehouse: 'مخزن'
    };
    return types[type] || type;
  };

  return (
    <div 
      className="property-card bg-white rounded-lg shadow-md p-6 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick && onClick(property)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {property.purpose || 'Unknown Purpose'}
        </h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {getPropertyTypeLabel(property.property_type)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {property.area && (
          <div>
            <label className="text-sm text-gray-600">Area:</label>
            <p className="font-medium">{property.area}</p>
          </div>
        )}
        
        {property.price && (
          <div>
            <label className="text-sm text-gray-600">Price:</label>
            <p className="font-medium text-green-600">
              {formatPrice(property.price)}
            </p>
          </div>
        )}
      </div>
      
      {property.description && (
        <div className="mb-4">
          <label className="text-sm text-gray-600">Description:</label>
          <p className="text-gray-800 text-sm">{property.description}</p>
        </div>
      )}
      
      {(property.broker_name || property.broker_mobile) && (
        <div className="border-t pt-3">
          <label className="text-sm text-gray-600">Broker Info:</label>
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
                {property.broker_mobile}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
EOF

    # Create PropertySearch component for React
    cat > src/components/PropertySearch.jsx << 'EOF'
import React, { useState } from 'react';

const PropertySearch = ({ onSearch, language = 'arabic' }) => {
  const [searchForm, setSearchForm] = useState({
    purpose: '',
    area: '',
    price: '',
    broker_mobile: '',
    property_type: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch && onSearch(searchForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const labels = language === 'arabic' ? {
    title: 'البحث في العقارات',
    purpose: 'الغرض',
    area: 'المنطقة',
    price: 'الحد الأقصى للسعر',
    brokerMobile: 'رقم الوسيط',
    propertyType: 'نوع العقار',
    search: 'بحث',
    anyPurpose: 'أي غرض',
    forSale: 'للبيع',
    forRent: 'للإيجار',
    wanted: 'مطلوب'
  } : {
    title: 'Search Properties',
    purpose: 'Purpose',
    area: 'Area',
    price: 'Max Price',
    brokerMobile: 'Broker Mobile',
    propertyType: 'Property Type',
    search: 'Search',
    anyPurpose: 'Any Purpose',
    forSale: 'For Sale',
    forRent: 'For Rent', 
    wanted: 'Wanted'
  };

  return (
    <div className="property-search bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{labels.title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.purpose}
            </label>
            <select 
              name="purpose"
              value={searchForm.purpose} 
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">{labels.anyPurpose}</option>
              <option value="sale">{labels.forSale}</option>
              <option value="rent">{labels.forRent}</option>
              <option value="wanted">{labels.wanted}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.area}
            </label>
            <input 
              name="area"
              value={searchForm.area} 
              onChange={handleChange}
              type="text" 
              placeholder="e.g., New Cairo, Maadi"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.price}
            </label>
            <input 
              name="price"
              value={searchForm.price} 
              onChange={handleChange}
              type="number" 
              placeholder="Maximum price"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {labels.brokerMobile}
          </label>
          <input 
            name="broker_mobile"
            value={searchForm.broker_mobile} 
            onChange={handleChange}
            type="tel" 
            placeholder="e.g., 01234567890"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          {labels.search}
        </button>
      </form>
    </div>
  );
};

export default PropertySearch;
EOF

    echo "✅ Enhanced React components created!"
}

# Execute all updates
echo "🚀 Starting React frontend migration..."

update_react_components
update_js_services  
create_enhanced_react_components

echo "✅ React frontend migration completed!"

echo "🎉 React Frontend Migration Summary:"
echo "   - Updated all React component state variables"
echo "   - Fixed JSX property bindings"
echo "   - Updated form field names"
echo "   - Modernized table headers"
echo "   - Created enhanced React property components"
echo "   - Updated JavaScript service files"
echo "   - Fixed API response mappings"
echo ""
echo "Ready for testing and deployment! 🚀"
