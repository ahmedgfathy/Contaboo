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
