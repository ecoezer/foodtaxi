# FoodsTaxi-Gronau 🚕

A modern food delivery website for FoodsTaxi-Gronau with WhatsApp ordering and email notifications.

## Features

- 📱 Responsive design optimized for mobile and desktop
- 🍕 Complete menu with pizzas, döner, burgers, pasta, and more
- 🛒 Shopping cart with item customization
- 📞 WhatsApp integration for order placement
- 📧 Email notifications for restaurant staff
- ⏰ Real-time opening hours display
- 🚚 Delivery zone management with minimum order requirements
- 🎨 Modern UI with smooth animations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase Edge Functions
- **Email Service**: Resend
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

Fill in your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (for Edge Function)
RESEND_API_KEY=your_resend_api_key
RESTAURANT_EMAIL=orders@your-restaurant.com
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. The Edge Function will be automatically deployed when you connect to Supabase

### 4. Email Service Setup

1. Sign up for [Resend](https://resend.com)
2. Get your API key from the Resend dashboard
3. Add your API key to the Supabase Edge Function environment variables:
   - Go to your Supabase project dashboard
   - Navigate to Edge Functions → Environment Variables
   - Add `RESEND_API_KEY` with your Resend API key
   - Add `RESTAURANT_EMAIL` with your restaurant's email address

### 5. Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 6. Production Build

```bash
npm run build
npm run preview
```

## Email Notification System

The application includes an automated email notification system:

- **Trigger**: Automatically sends when an order is submitted
- **Content**: Complete order details, customer info, and totals
- **Fallback**: WhatsApp ordering continues to work even if email fails
- **Service**: Uses Resend for reliable email delivery

### Email Features:
- Professional HTML email template
- Complete order breakdown with pricing
- Customer contact information
- Delivery details and special instructions
- Mobile-responsive email design

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