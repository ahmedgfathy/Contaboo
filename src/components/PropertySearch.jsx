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
