# 🚗 Car Shop Configuration Guide

## 📁 config.js - Your One-Stop Settings File

Instead of editing code files, you can now change all your contact information and settings in **ONE PLACE** - the `config.js` file!

## 🔧 How to Use

### 1. Open `config.js` file
### 2. Change the values you want
### 3. Save the file
### 4. Your website will automatically use the new settings!

## 📧 Contact Information

```javascript
contact: {
    // Your email address where you want to receive inquiries
    email: 'your-email@example.com',
    
    // Your phone number (displayed on website)
    phone: '+1 (555) 123-4567',
    
    // Your Instagram account
    instagram: '@yourcarshop',
    
    // Your business address
    address: '123 Main Street, City, State 12345',
    
    // Business hours
    hours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM, Sun: Closed'
}
```

## 📱 Social Media Links

```javascript
social: {
    instagram: 'https://instagram.com/yourcarshop',
    facebook: 'https://facebook.com/yourcarshop',
    twitter: 'https://twitter.com/yourcarshop',
    youtube: 'https://youtube.com/yourcarshop'
}
```

## 📨 EmailJS Settings (for email notifications)

```javascript
emailjs: {
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID', 
    publicKey: 'YOUR_PUBLIC_KEY'
}
```

## 🏢 Business Information

```javascript
business: {
    name: 'Car Shop',
    tagline: 'Your Trusted Auto Dealer',
    description: 'We offer the best selection of quality used and new vehicles at competitive prices.'
}
```

## ⚙️ Website Settings

```javascript
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
```

## 🎯 What Gets Updated Automatically

When you change values in `config.js`, these will update across your entire website:

- ✅ **Email links** in all footers
- ✅ **Phone number links** in all footers  
- ✅ **Instagram links** in all footers
- ✅ **Email notifications** when customers submit inquiries
- ✅ **Business information** throughout the site

## 🚀 Quick Setup Steps

1. **Change your email**: Update `contact.email` to your real email
2. **Change your phone**: Update `contact.phone` to your real phone number
3. **Change your Instagram**: Update `contact.instagram` and `social.instagram`
4. **Set up EmailJS**: Get your EmailJS credentials and update the `emailjs` section
5. **Save the file** - that's it!

## 📝 Example Configuration

```javascript
contact: {
    email: 'sales@mycarshop.com',
    phone: '+1 (555) 123-4567',
    instagram: '@mycarshop',
    address: '456 Auto Lane, Detroit, MI 48201',
    hours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM, Sun: Closed'
}
```

**No more editing code files - just update `config.js` and you're done!** 🎉
