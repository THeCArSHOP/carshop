// ========================================
// CAR SHOP CONFIGURATION FILE
// ========================================
// Change your settings here instead of in the code files!

window.CARSHOP_CONFIG = {
    // ========================================
    // CONTACT INFORMATION
    // ========================================
    contact: {
        // Your email address where you want to receive inquiries
        email: 'charbel04rk@gmail.com',
        
        // Your phone number (displayed on website)
        phone: '+961 1111111111',
        
        // Your Instagram account
        instagram: '@motivation_top12',
        
        // Your business address
        address: '123 Main Street, City, State 12345',
        
        // Business hours
        hours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM, Sun: Closed'
    },

    // ========================================
    // EMAILJS SETTINGS
    // ========================================
    emailjs: {
        // Get these from your EmailJS account
        serviceId: 'YOUR_SERVICE_ID',
        templateId: 'YOUR_TEMPLATE_ID', 
        publicKey: 'YOUR_PUBLIC_KEY'
    },

    // ========================================
    // BUSINESS INFORMATION
    // ========================================
    business: {
        name: 'Car Shop',
        tagline: 'Your Trusted Auto Dealer',
        description: 'We offer the best selection of quality used and new vehicles at competitive prices.'
    },

    // ========================================
    // SOCIAL MEDIA LINKS
    // ========================================
    social: {
        instagram: 'https://instagram.com/motivation_top12',
        facebook: 'https://facebook.com/yourcarshop',
        twitter: 'https://twitter.com/yourcarshop',
        youtube: 'https://youtube.com/yourcarshop'
    },

    // ========================================
    // WEBSITE SETTINGS
    // ========================================
    website: {
        // Maximum number of featured cars (default: 3)
        maxFeaturedCars: 3,
        
        // Items per page for inventory
        itemsPerPage: 12,
        
        // Enable/disable features
        enableFavorites: true,
        enableCompare: true,
        enableInquiryForm: true
    }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

// Get contact email for inquiries
window.getContactEmail = function() {
    return window.CARSHOP_CONFIG.contact.email;
};

// Get phone number
window.getPhoneNumber = function() {
    return window.CARSHOP_CONFIG.contact.phone;
};

// Get Instagram handle
window.getInstagram = function() {
    return window.CARSHOP_CONFIG.contact.instagram;
};

// Get Instagram URL
window.getInstagramUrl = function() {
    return window.CARSHOP_CONFIG.social.instagram;
};

// Get business name
window.getBusinessName = function() {
    return window.CARSHOP_CONFIG.business.name;
};

// Get EmailJS config
window.getEmailJSConfig = function() {
    return window.CARSHOP_CONFIG.emailjs;
};

console.log('Car Shop Configuration Loaded:', window.CARSHOP_CONFIG);
