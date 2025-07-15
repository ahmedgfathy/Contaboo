import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { getPropertyById, hideMobileNumber, isUserAuthenticated } from '../services/apiService';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('arabic');

  useEffect(() => {
    loadPropertyDetails();
    // Check saved language preference
    const savedLanguage = localStorage.getItem('publicLanguage') || 'arabic';
    
    setLanguage(savedLanguage);
  }, [id]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await getPropertyById(id);
      console.log('API Response:', response); // Debug log
      setProperty(response);
    } catch (err) {
      setError('Failed to load property details');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      apartment: language === 'arabic' ? 'شقة' : 'Apartment',
      villa: language === 'arabic' ? 'فيلا' : 'Villa', 
      land: language === 'arabic' ? 'أرض' : 'Land',
      office: language === 'arabic' ? 'مكتب' : 'Office',
      warehouse: language === 'arabic' ? 'مخزن' : 'Warehouse'
    };
    return labels[type] || (language === 'arabic' ? 'عقار' : 'Property');
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'from-blue-500 to-cyan-500',
      villa: 'from-green-500 to-emerald-500',
      land: 'from-orange-500 to-red-500',
      office: 'from-indigo-500 to-purple-500',
      warehouse: 'from-pink-500 to-rose-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {language === 'arabic' ? 'جارٍ تحميل تفاصيل العقار...' : 'Loading property details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BuildingOffice2Icon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {language === 'arabic' ? 'عذراً، لم يتم العثور على العقار' : 'Sorry, property not found'}
          </h2>
          <p className="text-gray-400 mb-6">
            {language === 'arabic' ? 'العقار المطلوب غير متوفر أو تم حذفه' : 'The requested property is not available or has been deleted'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'arabic' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir={language === 'arabic' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              {language === 'arabic' ? (
                <>
                  <ArrowRightIcon className="w-5 h-5" />
                  <span>العودة للرئيسية</span>
                </>
              ) : (
                <>
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Back to Home</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <HeartIcon className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {property.property_name || property.message}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPropertyTypeColor(property.property_type)} text-white`}>
                      {getPropertyTypeLabel(property.property_type)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {language === 'arabic' ? 'معرف العقار:' : 'Property ID:'} #{property.id}
                    </span>
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                      {property.source_type === 'chat' ? 'واتساب' : 'مستورد'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 100) + 50}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{property.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Location and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-gray-400 text-sm">الموقع</p>
                    <p className="text-white font-medium">{property.regions || property.location || 'غير محدد'}</p>
                  </div>
                </div>

                {(property.price || property.unit_price) && (
                  <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-gray-400 text-sm">السعر</p>
                      <p className="text-green-400 font-bold text-lg">
                        {property.unit_price ? `${property.unit_price} جنيه` : property.price}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comprehensive Property Details - ALL DATABASE FIELDS */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">جميع تفاصيل العقار المتاحة</h2>
              
              {/* Basic Property Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-300 border-b border-blue-500/30 pb-3 mb-4">
                  المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">معرف العقار</p>
                    <p className="text-white font-medium">{property.id || 'غير محدد'}</p>
                  </div>
                  
                  {property.property_name && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">اسم العقار</p>
                      <p className="text-white font-medium">{property.property_name}</p>
                    </div>
                  )}
                  
                  {property.property_number && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">رقم العقار</p>
                      <p className="text-white font-medium">{property.property_number}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">نوع العقار</p>
                    <p className="text-white font-medium">{getPropertyTypeLabel(property.property_type)}</p>
                  </div>
                  
                  {property.property_category && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">فئة العقار</p>
                      <p className="text-white font-medium">{property.property_category}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">مصدر البيانات</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.source_type === 'chat' 
                        ? 'bg-green-600/20 text-green-300' 
                        : 'bg-blue-600/20 text-blue-300'
                    }`}>
                      {property.source_type === 'chat' ? 'رسائل واتساب' : 'بيانات مستوردة من CRM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location & Physical Details */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-green-300 border-b border-green-500/30 pb-3 mb-4">
                  الموقع والمواصفات الفيزيائية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">الموقع/المنطقة</p>
                    <p className="text-white font-medium">{property.regions || property.location || 'غير محدد'}</p>
                  </div>
                  
                  {property.building && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">اسم المبنى</p>
                      <p className="text-white font-medium">{property.building}</p>
                    </div>
                  )}
                  
                  {property.floor_no && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">رقم الدور</p>
                      <p className="text-white font-medium">{property.floor_no}</p>
                    </div>
                  )}
                  
                  {property.bedroom && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">عدد غرف النوم</p>
                      <p className="text-white font-medium">{property.bedroom} غرفة</p>
                    </div>
                  )}
                  
                  {property.bathroom && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">عدد الحمامات</p>
                      <p className="text-white font-medium">{property.bathroom} حمام</p>
                    </div>
                  )}
                  
                  {property.land_garden && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">الحديقة/الأرض</p>
                      <p className="text-white font-medium">{property.land_garden}</p>
                    </div>
                  )}
                  
                  {property.finished && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">حالة التشطيب</p>
                      <p className="text-white font-medium">{property.finished}</p>
                    </div>
                  )}
                  
                  {property.area_size && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">المساحة</p>
                      <p className="text-white font-medium">{property.area_size}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-yellow-300 border-b border-yellow-500/30 pb-3 mb-4">
                  المعلومات المالية والأسعار
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.price && (
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-green-500/30">
                      <p className="text-xs text-gray-400 mb-1">السعر الأساسي</p>
                      <p className="text-green-400 font-bold text-lg">{property.price}</p>
                    </div>
                  )}
                  
                  {property.unit_price && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">سعر الوحدة</p>
                      <p className="text-green-400 font-semibold">{property.unit_price} جنيه</p>
                    </div>
                  )}
                  
                  {property.amount && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">المبلغ الإجمالي</p>
                      <p className="text-white font-medium">{property.amount}</p>
                    </div>
                  )}
                  
                  {property.payment_type && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">نوع الدفع</p>
                      <p className="text-white font-medium">{property.payment_type}</p>
                    </div>
                  )}
                  
                  {property.deposit && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">مبلغ العربون</p>
                      <p className="text-white font-medium">{property.deposit}</p>
                    </div>
                  )}
                  
                  {property.payment && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">المبلغ المدفوع</p>
                      <p className="text-white font-medium">{property.payment}</p>
                    </div>
                  )}
                  
                  {property.paid_every && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">دورية الدفع</p>
                      <p className="text-white font-medium">{property.paid_every}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 border-b border-purple-500/30 pb-3 mb-4">
                  معلومات الاتصال والأشخاص المسؤولة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.sender && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">المرسل/الوكيل</p>
                      <p className="text-white font-medium">{property.sender}</p>
                    </div>
                  )}
                  
                  {property.name && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">الاسم</p>
                      <p className="text-white font-medium">{property.name}</p>
                    </div>
                  )}
                  
                  {property.property_offered_by && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">معروض من قبل</p>
                      <p className="text-white font-medium">{property.property_offered_by}</p>
                    </div>
                  )}
                  
                  {property.mobile_no && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">رقم الموبايل</p>
                      <a href={`tel:${property.mobile_no}`} className="text-green-400 font-medium hover:text-green-300 block">
                        {property.mobile_no}
                      </a>
                    </div>
                  )}
                  
                  {property.agent_phone && property.agent_phone !== 'غير متوفر' && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">هاتف الوكيل</p>
                      <a href={`tel:${property.agent_phone}`} className="text-green-400 font-medium hover:text-green-300 block">
                        {property.agent_phone}
                      </a>
                    </div>
                  )}
                  
                  {property.tel && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">الهاتف الأرضي</p>
                      <a href={`tel:${property.tel}`} className="text-green-400 font-medium hover:text-green-300 block">
                        {property.tel}
                      </a>
                    </div>
                  )}
                  
                  {property.handler && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">المسؤول/المعالج</p>
                      <p className="text-white font-medium">{property.handler}</p>
                    </div>
                  )}
                  
                  {property.sales && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">موظف المبيعات</p>
                      <p className="text-white font-medium">{property.sales}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Descriptions and Notes */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-cyan-300 border-b border-cyan-500/30 pb-3 mb-4">
                  الأوصاف والملاحظات
                </h3>
                <div className="space-y-4">
                  {/* Main Message */}
                  <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-lg">
                    <h4 className="text-blue-300 font-medium mb-2">الرسالة الأساسية</h4>
                    <p className="text-gray-300 leading-relaxed">{property.message}</p>
                  </div>

                  {/* Property Description */}
                  {property.description && property.description !== property.message && (
                    <div className="bg-purple-600/10 border border-purple-600/30 p-4 rounded-lg">
                      <h4 className="text-purple-300 font-medium mb-2">وصف العقار</h4>
                      <p className="text-gray-300 leading-relaxed">{property.description}</p>
                    </div>
                  )}

                  {/* Full Description */}
                  {property.full_description && property.full_description !== property.message && (
                    <div className="bg-green-600/10 border border-green-600/30 p-4 rounded-lg">
                      <h4 className="text-green-300 font-medium mb-2">الوصف التفصيلي</h4>
                      <p className="text-gray-300 leading-relaxed">{property.full_description}</p>
                    </div>
                  )}

                  {/* Agent Description */}
                  {property.agent_description && (
                    <div className="bg-orange-600/10 border border-orange-600/30 p-4 rounded-lg">
                      <h4 className="text-orange-300 font-medium mb-2">وصف الوكيل</h4>
                      <p className="text-gray-300 leading-relaxed">{property.agent_description}</p>
                    </div>
                  )}

                  {/* Sales Notes */}
                  {property.zain_house_sales_notes && (
                    <div className="bg-yellow-600/10 border border-yellow-600/30 p-4 rounded-lg">
                      <h4 className="text-yellow-300 font-medium mb-2">ملاحظات المبيعات</h4>
                      <p className="text-gray-300 leading-relaxed">{property.zain_house_sales_notes}</p>
                    </div>
                  )}

                  {/* Keywords */}
                  {property.keywords && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-3">الكلمات المفتاحية</h4>
                      <div className="flex flex-wrap gap-2">
                        {property.keywords.split(',').map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-600/30"
                          >
                            #{keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-red-300 border-b border-red-500/30 pb-3 mb-4">
                  المعلومات الإدارية والتقنية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.created_time && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">تاريخ الإنشاء</p>
                      <p className="text-white font-medium">{property.created_time}</p>
                    </div>
                  )}
                  
                  {property.modified_time && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">تاريخ التعديل</p>
                      <p className="text-white font-medium">{property.modified_time}</p>
                    </div>
                  )}
                  
                  {property.timestamp && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">الطابع الزمني</p>
                      <p className="text-white font-medium">{property.timestamp}</p>
                    </div>
                  )}
                  
                  {property.created_at && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">تاريخ الإضافة للنظام</p>
                      <p className="text-white font-medium">{new Date(property.created_at).toLocaleString('ar-EG')}</p>
                    </div>
                  )}
                  
                  {property.imported_at && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">تاريخ الاستيراد</p>
                      <p className="text-white font-medium">{new Date(property.imported_at).toLocaleString('ar-EG')}</p>
                    </div>
                  )}
                  
                  {property.last_modified_by && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">آخر تعديل بواسطة</p>
                      <p className="text-white font-medium">{property.last_modified_by}</p>
                    </div>
                  )}
                  
                  {property.update_unit && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">وحدة التحديث</p>
                      <p className="text-white font-medium">{property.update_unit}</p>
                    </div>
                  )}
                  
                  {property.property_image && (
                    <div className="bg-gray-700/50 p-4 rounded-lg md:col-span-2">
                      <p className="text-xs text-gray-400 mb-1">رابط صورة العقار</p>
                      <p className="text-blue-400 font-medium break-all">{property.property_image}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Database Relations & IDs */}
              {(property.property_id || property.agent_id || property.property_type_id || property.area_id) && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-indigo-300 border-b border-indigo-500/30 pb-3 mb-4">
                    الروابط والمعرفات في قاعدة البيانات
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {property.property_id && (
                      <div className="bg-gray-600 p-3 rounded text-center">
                        <p className="text-gray-400 text-xs mb-1">معرف العقار المرتبط</p>
                        <p className="text-white font-bold">{property.property_id}</p>
                      </div>
                    )}
                    {property.agent_id && (
                      <div className="bg-gray-600 p-3 rounded text-center">
                        <p className="text-gray-400 text-xs mb-1">معرف الوكيل</p>
                        <p className="text-white font-bold">{property.agent_id}</p>
                      </div>
                    )}
                    {property.property_type_id && (
                      <div className="bg-gray-600 p-3 rounded text-center">
                        <p className="text-gray-400 text-xs mb-1">معرف نوع العقار</p>
                        <p className="text-white font-bold">{property.property_type_id}</p>
                      </div>
                    )}
                    {property.area_id && (
                      <div className="bg-gray-600 p-3 rounded text-center">
                        <p className="text-gray-400 text-xs mb-1">معرف المنطقة</p>
                        <p className="text-white font-bold">{property.area_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Raw Data Display (for debugging) */}
              <div className="mt-8 pt-6 border-t border-gray-600">
                <details className="bg-gray-700/30 p-4 rounded-lg">
                  <summary className="text-gray-400 cursor-pointer hover:text-white">
                    عرض البيانات الخام (للمطورين)
                  </summary>
                  <pre className="mt-4 bg-black/50 p-4 rounded text-xs text-green-400 overflow-auto max-h-96">
                    {JSON.stringify(property, null, 2)}
                  </pre>
                </details>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">معلومات الاتصال</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.sender && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">المرسل/الوكيل</p>
                    <p className="text-white font-medium">{property.sender}</p>
                  </div>
                )}

                {property.name && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">الاسم</p>
                    <p className="text-white font-medium">{property.name}</p>
                  </div>
                )}

                {property.mobile_no && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">رقم الموبايل</p>
                    <a href={`tel:${property.mobile_no}`} className="text-green-400 font-medium hover:text-green-300">
                      {property.mobile_no}
                    </a>
                  </div>
                )}

                {property.agent_phone && property.agent_phone !== 'غير متوفر' && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">هاتف الوكيل</p>
                    <a href={`tel:${property.agent_phone}`} className="text-green-400 font-medium hover:text-green-300">
                      {property.agent_phone}
                    </a>
                  </div>
                )}

                {property.tel && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">الهاتف الأرضي</p>
                    <a href={`tel:${property.tel}`} className="text-green-400 font-medium hover:text-green-300">
                      {property.tel}
                    </a>
                  </div>
                )}

                {property.handler && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">المسؤول</p>
                    <p className="text-white font-medium">{property.handler}</p>
                  </div>
                )}

                {property.sales && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">المبيعات</p>
                    <p className="text-white font-medium">{property.sales}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Descriptions */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">الأوصاف والتفاصيل</h3>
              
              <div className="space-y-4">
                {/* Main Message */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">الرسالة الأساسية</h4>
                  <p className="text-gray-300 leading-relaxed">{property.message}</p>
                </div>

                {/* Full Description */}
                {property.full_description && property.full_description !== property.message && (
                  <div className="bg-blue-600/10 border border-blue-600/30 p-4 rounded-lg">
                    <h4 className="text-blue-300 font-medium mb-2">الوصف التفصيلي</h4>
                    <p className="text-gray-300 leading-relaxed">{property.full_description}</p>
                  </div>
                )}

                {/* Additional Description */}
                {property.description && property.description !== property.message && (
                  <div className="bg-purple-600/10 border border-purple-600/30 p-4 rounded-lg">
                    <h4 className="text-purple-300 font-medium mb-2">وصف إضافي</h4>
                    <p className="text-gray-300 leading-relaxed">{property.description}</p>
                  </div>
                )}

                {/* Agent Description */}
                {property.agent_description && (
                  <div className="bg-green-600/10 border border-green-600/30 p-4 rounded-lg">
                    <h4 className="text-green-300 font-medium mb-2">وصف الوكيل</h4>
                    <p className="text-gray-300 leading-relaxed">{property.agent_description}</p>
                  </div>
                )}

                {/* Sales Notes */}
                {property.zain_house_sales_notes && (
                  <div className="bg-yellow-600/10 border border-yellow-600/30 p-4 rounded-lg">
                    <h4 className="text-yellow-300 font-medium mb-2">ملاحظات المبيعات</h4>
                    <p className="text-gray-300 leading-relaxed">{property.zain_house_sales_notes}</p>
                  </div>
                )}

                {/* Keywords */}
                {property.keywords && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">الكلمات المفتاحية</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.keywords.split(',').map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-600/30"
                        >
                          #{keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Administrative Information */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">المعلومات الإدارية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.created_time && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">تاريخ الإنشاء</p>
                    <p className="text-white font-medium">{property.created_time}</p>
                  </div>
                )}

                {property.modified_time && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">تاريخ التعديل</p>
                    <p className="text-white font-medium">{property.modified_time}</p>
                  </div>
                )}

                {property.timestamp && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">الطابع الزمني</p>
                    <p className="text-white font-medium">{property.timestamp}</p>
                  </div>
                )}

                {property.created_at && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">تاريخ الإضافة للنظام</p>
                    <p className="text-white font-medium">{new Date(property.created_at).toLocaleString('ar-EG')}</p>
                  </div>
                )}

                {property.imported_at && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">تاريخ الاستيراد</p>
                    <p className="text-white font-medium">{new Date(property.imported_at).toLocaleString('ar-EG')}</p>
                  </div>
                )}

                {property.last_modified_by && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">آخر تعديل بواسطة</p>
                    <p className="text-white font-medium">{property.last_modified_by}</p>
                  </div>
                )}

                {property.update_unit && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">وحدة التحديث</p>
                    <p className="text-white font-medium">{property.update_unit}</p>
                  </div>
                )}

                {property.property_image && (
                  <div className="bg-gray-700 p-3 rounded-lg md:col-span-2">
                    <p className="text-gray-400 text-sm">صورة العقار</p>
                    <p className="text-white font-medium">{property.property_image}</p>
                  </div>
                )}

                {/* Database Relations */}
                {(property.property_id || property.agent_id || property.property_type_id || property.area_id) && (
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-medium text-white mb-3">الروابط والمعرفات</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {property.property_id && (
                        <div className="bg-gray-600 p-2 rounded text-center">
                          <p className="text-gray-400 text-xs">معرف العقار</p>
                          <p className="text-white text-sm">{property.property_id}</p>
                        </div>
                      )}
                      {property.agent_id && (
                        <div className="bg-gray-600 p-2 rounded text-center">
                          <p className="text-gray-400 text-xs">معرف الوكيل</p>
                          <p className="text-white text-sm">{property.agent_id}</p>
                        </div>
                      )}
                      {property.property_type_id && (
                        <div className="bg-gray-600 p-2 rounded text-center">
                          <p className="text-gray-400 text-xs">معرف النوع</p>
                          <p className="text-white text-sm">{property.property_type_id}</p>
                        </div>
                      )}
                      {property.area_id && (
                        <div className="bg-gray-600 p-2 rounded text-center">
                          <p className="text-gray-400 text-xs">معرف المنطقة</p>
                          <p className="text-white text-sm">{property.area_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Information (without contact details) */}
            {property.sender && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">
                  {language === 'arabic' ? 'معلومات الوسيط' : 'Agent Information'}
                </h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {property.sender.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{property.sender}</h4>
                    <p className="text-gray-400">
                      {language === 'arabic' ? 'وسيط عقاري' : 'Real Estate Agent'}
                    </p>
                  </div>
                </div>

                {property.agent_description && (
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="text-gray-300 leading-relaxed">
                      {property.agent_description}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg text-center">
                  <BuildingOffice2Icon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">
                    {language === 'arabic' ? 'وسيط عقاري معتمد' : 'Certified Real Estate Agent'}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    {language === 'arabic' 
                      ? 'للحصول على بيانات الاتصال الكاملة ومعلومات الوسيط' 
                      : 'To get complete contact details and agent information'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === 'arabic' ? 'تسجيل الدخول' : 'Login'}
                  </button>
                </div>
              </div>
            )}

            {/* Contact Information Login Prompt */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                {language === 'arabic' ? 'معلومات التواصل' : 'Contact Information'}
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg text-center">
                  <BuildingOffice2Icon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">
                    {language === 'arabic' ? 'وسيط عقاري معتمد' : 'Certified Real Estate Agent'}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    {language === 'arabic' 
                      ? 'للحصول على بيانات الاتصال الكاملة ومعلومات الوسيط' 
                      : 'To get complete contact details and agent information'
                    }
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === 'arabic' ? 'تسجيل الدخول' : 'Login'}
                  </button>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg">
                  <h5 className="text-white font-medium mb-2">
                    {language === 'arabic' ? 'نصائح مهمة' : 'Important Tips'}
                  </h5>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• {language === 'arabic' ? 'تأكد من صحة المعلومات' : 'Verify all information'}</li>
                    <li>• {language === 'arabic' ? 'قم بزيارة العقار شخصياً' : 'Visit the property in person'}</li>
                    <li>• {language === 'arabic' ? 'اطلب المستندات القانونية' : 'Request legal documents'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                {language === 'arabic' ? 'إحصائيات العقار' : 'Property Stats'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">
                    {language === 'arabic' ? 'المشاهدات' : 'Views'}
                  </span>
                  <span className="text-white font-medium">{Math.floor(Math.random() * 100) + 50}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">
                    {language === 'arabic' ? 'الاستفسارات' : 'Inquiries'}
                  </span>
                  <span className="text-white font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">
                    {language === 'arabic' ? 'آخر تحديث' : 'Last Updated'}
                  </span>
                  <span className="text-white font-medium">
                    {language === 'arabic' ? 'اليوم' : 'Today'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
