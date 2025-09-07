# 🚗 Car Shop - Complete File Guide

## 📁 Project Overview
This is a complete car dealership website with admin panel, inventory management, and customer inquiry system.

---

## 🎯 **Main Website Files**

### **📄 HTML Pages**
| File | Purpose | Description |
|------|---------|-------------|
| `index.html` | **Home Page** | Main landing page with featured cars, hero section, and navigation |
| `inventory.html` | **Car Inventory** | Browse all available cars with filtering and search |
| `car.html` | **Car Details** | Individual car detail page with gallery and inquiry form |
| `favorites.html` | **Favorites** | Customer's saved favorite cars |
| `compare.html` | **Car Comparison** | Side-by-side comparison of multiple cars |
| `admin.html` | **Admin Panel** | Login-protected admin interface for managing cars |

---

## ⚙️ **JavaScript Files**

### **🔧 Core Functionality**
| File | Purpose | Description |
|------|---------|-------------|
| `firebase.js` | **Database & Auth** | Firebase connection, car CRUD operations, user authentication |
| `app.js` | **Main App Logic** | Home page functionality, car display, search, and filtering |
| `car-detail.js` | **Car Details** | Individual car page logic, image gallery, inquiry form |
| `admin.js` | **Admin Management** | Admin panel for creating, editing, deleting cars |
| `favorites.js` | **Favorites System** | Save/remove favorite cars, local storage management |
| `compare.js` | **Car Comparison** | Compare multiple cars side-by-side |

---

## 🎨 **Configuration & Styling**

### **📋 Configuration**
| File | Purpose | Description |
|------|---------|-------------|
| `config.js` | **Settings File** | **MAIN CONFIG** - Change email, phone, Instagram, business info |
| `styles.css` | **Website Styling** | All CSS styles for the entire website |

---

## 📚 **Documentation**
| File | Purpose | Description |
|------|---------|-------------|
| `README.md` | **This File** | Complete guide to all project files |
| `CONFIG-README.md` | **Config Guide** | How to use config.js to change settings |

---

## 🧪 **Test & Debug Files**
| File | Purpose | Description |
|------|---------|-------------|
| `bypass-test.html` | **Auth Bypass Test** | Test Firebase authentication |
| `check-uid.html` | **User ID Check** | Debug user authentication |
| `debug-firestore.html` | **Database Debug** | Test Firebase Firestore connection |
| `firestore-debug.html` | **Firestore Debug** | Advanced database debugging |
| `firestore-simple-test.html` | **Simple DB Test** | Basic database operations test |
| `firestore-test.html` | **Database Test** | Comprehensive database testing |
| `firestore-test-site.html` | **Full DB Test** | Complete database functionality test |
| `image-debug.html` | **Image Debug** | Test car image loading and display |
| `minimal-firestore-test.html` | **Minimal DB Test** | Basic database connection test |
| `rest-api-test.html` | **API Test** | Test REST API endpoints |
| `simple-write-test.html` | **Write Test** | Test writing data to database |
| `test-firebase.html` | **Firebase Test** | Test Firebase configuration |
| `test-firestore.html` | **Firestore Test** | Test Firestore database |
| `test-no-images.html` | **No Images Test** | Test car display without images |
| `test-rules.html` | **Security Rules Test** | Test Firebase security rules |
| `timeout-write-test.html` | **Timeout Test** | Test database operations with timeouts |
| `uid-check.html` | **User ID Check** | Check user authentication status |

---

## 🚀 **How to Use**

### **1. Main Website**
- Open `index.html` to see the home page
- Browse cars in `inventory.html`
- View car details in `car.html`
- Use favorites and compare features

### **2. Admin Panel**
- Go to `admin.html`
- Login with your admin credentials
- Add, edit, or delete cars
- Manage your inventory

### **3. Configuration**
- Edit `config.js` to change:
  - Your email address
  - Phone number
  - Instagram account
  - Business information
  - EmailJS settings

---

## 📧 **Contact Information**
- **Email:** charbel04rk@gmail.com
- **Phone:** +961 1111111111
- **Instagram:** @motivation_top12

---

## 🔧 **Technical Details**

### **Database:** Firebase Firestore
### **Authentication:** Firebase Auth
### **Email Service:** EmailJS
### **Storage:** Firebase Storage
### **Frontend:** Vanilla JavaScript, HTML5, CSS3

---

## 📝 **File Structure**
```
public/
├── 📄 Main Pages
│   ├── index.html (Home)
│   ├── inventory.html (Browse Cars)
│   ├── car.html (Car Details)
│   ├── favorites.html (Saved Cars)
│   ├── compare.html (Compare Cars)
│   └── admin.html (Admin Panel)
├── ⚙️ JavaScript
│   ├── firebase.js (Database)
│   ├── app.js (Main Logic)
│   ├── car-detail.js (Car Details)
│   ├── admin.js (Admin Functions)
│   ├── favorites.js (Favorites)
│   └── compare.js (Comparison)
├── 🎨 Styling
│   └── styles.css (All Styles)
├── 📋 Configuration
│   ├── config.js (Main Settings)
│   └── CONFIG-README.md (Config Guide)
└── 🧪 Test Files
    └── (Various test and debug files)
```

---

## 🎯 **Quick Start**
1. **Run the website:** `python -m http.server 8000`
2. **Open browser:** `http://localhost:8000`
3. **Configure settings:** Edit `config.js`
4. **Manage cars:** Use `admin.html`

**Your car shop is ready to go!** 🚗✨
