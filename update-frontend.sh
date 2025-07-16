#!/bin/bash

echo "🎨 Starting Frontend Migration for Real Estate Chat App..."

# Function to update Vue.js files
update_vue_files() {
    echo "📝 Updating Vue.js components..."
    
    # Find all Vue files
    find src -name "*.vue" -type f | while read file; do
        echo "Processing: $file"
        
        # Update v-model bindings
        sed -i 's/v-model="chatContent"/v-model="message_text"/g' "$file"
        sed -i 's/v-model="oldFieldName"/v-model="purpose"/g' "$file"
        sed -i 's/v-model="legacyDesc"/v-model="description"/g' "$file"
        sed -i 's/v-model="agentPhone"/v-model="broker_mobile"/g' "$file"
        sed -i 's/v-model="agentName"/v-model="broker_name"/g' "$file"
        
        # Update :value bindings
        sed -i 's/:value="oldProp"/:value="area"/g' "$file"
        sed -i 's/:value="outdatedField"/:value="price"/g' "$file"
        
        # Update form field names
        sed -i 's/name="chatContent"/name="message_text"/g' "$file"
        sed -i 's/name="oldFieldName"/name="purpose"/g' "$file"
        sed -i 's/name="descriptionText"/name="description"/g' "$file"
        sed -i 's/name="agentPhone"/name="broker_mobile"/g' "$file"
        sed -i 's/name="agentName"/name="broker_name"/g' "$file"
        
        # Update table headers
        sed -i 's/<th[^>]*>Chat Content<\/th>/<th>Message Text<\/th>/g' "$file"
        sed -i 's/<th[^>]*>Old Header<\/th>/<th>Purpose<\/th>/g' "$file"
        sed -i 's/<th[^>]*>Legacy Field<\/th>/<th>Area<\/th>/g' "$file"
        
        # Update API response mappings in template
        sed -i 's/{{[[:space:]]*data\.chatContent[[:space:]]*}}/{{ data.message_text }}/g' "$file"
        sed -i 's/{{[[:space:]]*response\.oldKey[[:space:]]*}}/{{ response.purpose }}/g' "$file"
        sed -i 's/{{[[:space:]]*item\.legacyField[[:space:]]*}}/{{ item.area }}/g' "$file"
        
    done
}

# Function to update JavaScript files
update_js_files() {
    echo "⚡ Updating JavaScript files..."
    
    # Find all JS/TS files in src
    find src -name "*.js" -o -name "*.ts" | while read file; do
        echo "Processing: $file"
        
        # Update variable declarations
        sed -i 's/\blet chatData\b/let messageData/g' "$file"
        sed -i 's/\bconst oldField\b/const purpose/g' "$file"
        sed -i 's/\bvar legacyData\b/var propertyData/g' "$file"
        
        # Update object property access
        sed -i 's/\.chatContent\b/.message_text/g' "$file"
        sed -i 's/\.oldKey\b/.purpose/g' "$file"
        sed -i 's/\.legacyField\b/.area/g' "$file"
        sed -i 's/\.agentPhone\b/.broker_mobile/g' "$file"
        sed -i 's/\.agentName\b/.broker_name/g' "$file"
        
        # Update API endpoints if any
        sed -i 's/\/api\/chat-content/\/api\/messages/g' "$file"
        sed -i 's/\/api\/legacy-data/\/api\/properties/g' "$file"
        
    done
}

# Function to update API files
update_api_files() {
    echo "🔌 Updating API files..."
    
    find api -name "*.js" | while read file; do
        echo "Processing API: $file"
        
        # Update database column references
        sed -i 's/chat_content/message_text/g' "$file"
        sed -i 's/legacy_desc/description/g' "$file"
        sed -i 's/agent_number/broker_mobile/g' "$file"
        sed -i 's/agent_name/broker_name/g' "$file"
        
        # Update response object keys
        sed -i 's/"chatContent"/"message_text"/g' "$file"
        sed -i 's/"oldKey"/"purpose"/g' "$file"
        sed -i 's/"legacyField"/"area"/g' "$file"
        
    done
}

# Function to create updated components
create_enhanced_components() {
    echo "🧩 Creating enhanced components..."
    
    # Create PropertyCard component
    cat > src/components/PropertyCard.vue << 'EOF'
<template>
  <div class="property-card bg-white rounded-lg shadow-md p-6 mb-4">
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-semibold text-gray-800">
        {{ property.purpose || 'Unknown Purpose' }}
      </h3>
      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
        {{ property.property_type || 'Property' }}
      </span>
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div v-if="property.area">
        <label class="text-sm text-gray-600">Area:</label>
        <p class="font-medium">{{ property.area }}</p>
      </div>
      
      <div v-if="property.price">
        <label class="text-sm text-gray-600">Price:</label>
        <p class="font-medium text-green-600">
          {{ formatPrice(property.price) }}
        </p>
      </div>
    </div>
    
    <div v-if="property.description" class="mb-4">
      <label class="text-sm text-gray-600">Description:</label>
      <p class="text-gray-800">{{ property.description }}</p>
    </div>
    
    <div v-if="property.broker_name || property.broker_mobile" class="border-t pt-3">
      <label class="text-sm text-gray-600">Broker Info:</label>
      <div class="flex justify-between items-center">
        <span v-if="property.broker_name">{{ property.broker_name }}</span>
        <a v-if="property.broker_mobile" 
           :href="`tel:${property.broker_mobile}`"
           class="text-blue-600 hover:underline">
          {{ property.broker_mobile }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertyCard',
  props: {
    property: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatPrice(price) {
      if (!price) return '';
      return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP'
      }).format(price);
    }
  }
}
</script>
EOF

    # Create PropertySearch component
    cat > src/components/PropertySearch.vue << 'EOF'
<template>
  <div class="property-search bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold mb-4">Search Properties</h2>
    
    <form @submit.prevent="handleSearch" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Purpose
          </label>
          <select v-model="searchForm.purpose" class="w-full border rounded-lg px-3 py-2">
            <option value="">Any Purpose</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
            <option value="wanted">Wanted</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <input v-model="searchForm.area" 
                 type="text" 
                 placeholder="e.g., New Cairo, Maadi"
                 class="w-full border rounded-lg px-3 py-2">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input v-model="searchForm.price" 
                 type="number" 
                 placeholder="Maximum price"
                 class="w-full border rounded-lg px-3 py-2">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Broker Mobile
        </label>
        <input v-model="searchForm.broker_mobile" 
               type="tel" 
               placeholder="e.g., 01234567890"
               class="w-full border rounded-lg px-3 py-2">
      </div>
      
      <button type="submit" 
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
        Search Properties
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'PropertySearch',
  data() {
    return {
      searchForm: {
        purpose: '',
        area: '',
        price: '',
        broker_mobile: ''
      }
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', { ...this.searchForm });
    }
  }
}
</script>
EOF

    echo "✅ Enhanced components created!"
}

# Execute all updates
echo "🚀 Starting frontend migration..."

update_vue_files
update_js_files  
update_api_files
create_enhanced_components

echo "✅ Frontend migration completed!"

# Update package.json scripts if needed
if grep -q "legacy" package.json; then
    echo "📦 Updating package.json scripts..."
    sed -i 's/legacy/modern/g' package.json
fi

echo "🎉 Frontend migration summary:"
echo "   - Updated all v-model bindings"
echo "   - Fixed API response mappings"
echo "   - Updated form field names"
echo "   - Modernized table headers"
echo "   - Created enhanced property components"
echo "   - Updated JavaScript variable names"
echo ""
echo "Ready for testing and deployment! 🚀"
