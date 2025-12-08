# FoodsTaxi-Gronau 🚕

A modern food delivery website for FoodsTaxi-Gronau with WhatsApp ordering and Firebase backend.

## Features

- 📱 Responsive design optimized for mobile and desktop
- 🍕 Complete menu with pizzas, döner, burgers, pasta, and more
- 🛒 Shopping cart with item customization
- 📞 WhatsApp integration for order placement
- 💾 Order management with Firebase Firestore
- 👤 Admin dashboard for order tracking and analytics
- ⏰ Real-time opening hours display
- 🚚 Delivery zone management with minimum order requirements
- 🎨 Modern UI with smooth animations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd foodstaxi-gronau
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database in your Firebase project
3. Enable Authentication (optional, for admin panel)
4. Get your Firebase config from Project Settings
5. Add the config values to your `.env` file

### 4. Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Production Build

```bash
npm run build
npm run preview
```

## Order Management

The application stores all orders in Firebase Firestore:

- **Storage**: Orders are automatically saved to Firestore when submitted
- **Admin Panel**: Access order history and analytics at `/admin/login`
- **WhatsApp**: Orders are sent via WhatsApp for immediate notification
- **Device Tracking**: Captures device information for analytics

### Admin Features:
- Real-time order tracking
- Order history with search and filtering
- Analytics dashboard with sales insights
- Device and browser statistics
- Peak hours analysis
- Delivery zone performance metrics

## Menu Management

The menu is defined in `src/data/menuItems.ts` and includes:

- **Spezialitäten**: Döner dishes and specialties
- **Pizza**: Various sizes with customizable toppings
- **Hamburger**: Different patty sizes and toppings
- **Pasta & Al Forno**: Pasta dishes with sauce selection
- **Schnitzel**: Schnitzel variations with sides
- **Finger Food**: Snacks and sides
- **Salate**: Salads with dressing options
- **Desserts**: Sweet treats
- **Getränke**: Beverages with size options
- **Dips**: Various sauces and dips

## Delivery Zones

The application supports multiple delivery zones with individual:
- Minimum order requirements
- Delivery fees
- Zone-specific validation

## Opening Hours

- **Monday, Wednesday, Thursday**: 12:00 - 21:30
- **Friday, Saturday, Sunday & Holidays**: 12:00 - 21:30
- **Tuesday**: Closed (Ruhetag)

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for FoodsTaxi-Gronau.