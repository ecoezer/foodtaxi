/*
  # Send Order Email Edge Function

  1. Purpose
    - Receives order data from the frontend
    - Formats order into HTML email
    - Sends email notification to restaurant
    - Returns success/failure status

  2. Email Service
    - Uses Resend for reliable email delivery
    - Formats order data into professional HTML template
    - Includes all order details, customer info, and totals

  3. Error Handling
    - Graceful error handling to not break WhatsApp flow
    - Detailed logging for debugging
    - CORS support for frontend requests
*/

import { corsHeaders } from '../_shared/cors.ts';

interface OrderItem {
  menuItem: {
    id: number;
    name: string;
    price: number;
    number: string;
  };
  quantity: number;
  selectedSize?: {
    name: string;
    description?: string;
  };
  selectedIngredients?: string[];
  selectedExtras?: string[];
  selectedPastaType?: string;
  selectedSauce?: string;
}

interface OrderData {
  orderType: 'pickup' | 'delivery';
  deliveryZone?: string;
  deliveryTime: 'asap' | 'specific';
  specificTime?: string;
  name: string;
  phone: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  note?: string;
  orderItems: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const DELIVERY_ZONES = {
  'banteln': { label: 'Banteln', minOrder: 25, fee: 2.5 },
  'barfelde': { label: 'Barfelde', minOrder: 20, fee: 2.5 },
  'betheln': { label: 'Betheln', minOrder: 25, fee: 3 },
  'brueggen': { label: 'Brüggen', minOrder: 35, fee: 3 },
  'deinsen': { label: 'Deinsen', minOrder: 35, fee: 4 },
  'duingen': { label: 'Duingen', minOrder: 40, fee: 4 },
  'dunsen-gime': { label: 'Dunsen (Gime)', minOrder: 30, fee: 3 },
  'eime': { label: 'Eime', minOrder: 25, fee: 3 },
  'eitzum': { label: 'Eitzum', minOrder: 25, fee: 3 },
  'elze': { label: 'Elze', minOrder: 35, fee: 4 },
  'gronau': { label: 'Gronau', minOrder: 15, fee: 1.5 },
  'gronau-doetzum': { label: 'Gronau Dötzum', minOrder: 20, fee: 2 },
  'gronau-eddighausen': { label: 'Gronau Eddighausen', minOrder: 20, fee: 2.5 },
  'haus-escherde': { label: 'Haus Escherde', minOrder: 25, fee: 3 },
  'heinum': { label: 'Heinum', minOrder: 25, fee: 3 },
  'kolonie-godenau': { label: 'Kolonie Godenau', minOrder: 40, fee: 4 },
  'mehle-elze': { label: 'Mehle (Elze)', minOrder: 35, fee: 4 },
  'nienstedt': { label: 'Nienstedt', minOrder: 35, fee: 4 },
  'nordstemmen': { label: 'Nordstemmen', minOrder: 35, fee: 4 },
  'rheden-elze': { label: 'Rheden (Elze)', minOrder: 25, fee: 3 },
  'sibesse': { label: 'Sibesse', minOrder: 40, fee: 4 },
  'sorsum-elze': { label: 'Sorsum (Elze)', minOrder: 35, fee: 4 },
  'wallensted': { label: 'Wallensted', minOrder: 25, fee: 3 }
} as const;

function generateEmailHTML(orderData: OrderData): string {
  const timeInfo = orderData.deliveryTime === 'asap' 
    ? 'So schnell wie möglich' 
    : `Um ${orderData.specificTime} Uhr`;

  const deliveryZoneInfo = orderData.deliveryZone && DELIVERY_ZONES[orderData.deliveryZone as keyof typeof DELIVERY_ZONES]
    ? DELIVERY_ZONES[orderData.deliveryZone as keyof typeof DELIVERY_ZONES]
    : null;

  const orderItemsHTML = orderData.orderItems.map(item => {
    let itemDetails = `${item.quantity}x Nr. ${item.menuItem.number} ${item.menuItem.name}`;
    
    if (item.selectedSize) {
      itemDetails += ` (${item.selectedSize.name}${item.selectedSize.description ? ` - ${item.selectedSize.description}` : ''})`;
    }
    
    if (item.selectedPastaType) {
      itemDetails += ` - Nudelsorte: ${item.selectedPastaType}`;
    }
    
    if (item.selectedSauce) {
      itemDetails += ` - Soße: ${item.selectedSauce}`;
    }
    
    if (item.selectedIngredients && item.selectedIngredients.length > 0) {
      itemDetails += ` - Zutaten: ${item.selectedIngredients.join(', ')}`;
    }
    
    if (item.selectedExtras && item.selectedExtras.length > 0) {
      itemDetails += ` - Extras: ${item.selectedExtras.join(', ')} (+${(item.selectedExtras.length * 1.50).toFixed(2)}€)`;
    }

    const itemTotal = (item.menuItem.price * item.quantity).toFixed(2).replace('.', ',');
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">
          ${itemDetails}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
          ${itemTotal} €
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Neue Bestellung - FoodsTaxi-Gronau</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🍕 Neue Bestellung</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">FoodsTaxi-Gronau 🚕</p>
        </div>

        <!-- Customer Info -->
        <div style="padding: 24px; border-bottom: 2px solid #f3f4f6;">
          <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">👤 Kundeninformationen</h2>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${orderData.name}</p>
            <p style="margin: 0 0 8px 0;"><strong>Telefon:</strong> ${orderData.phone}</p>
            <p style="margin: 0;"><strong>Bestellart:</strong> ${orderData.orderType === 'pickup' ? '🏃‍♂️ Abholung' : '🚗 Lieferung'}</p>
          </div>
          
          ${orderData.orderType === 'delivery' && deliveryZoneInfo ? `
            <div style="background-color: #dbeafe; padding: 16px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <h3 style="margin: 0 0 8px 0; color: #1e40af;">📍 Lieferadresse</h3>
              <p style="margin: 0 0 4px 0;">${orderData.street} ${orderData.houseNumber}</p>
              <p style="margin: 0 0 4px 0;">${orderData.postcode}</p>
              <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Liefergebiet:</strong> ${deliveryZoneInfo.label}</p>
            </div>
          ` : ''}
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 16px;">
            <p style="margin: 0;"><strong>⏰ Lieferzeit:</strong> ${timeInfo}</p>
          </div>
        </div>

        <!-- Order Items -->
        <div style="padding: 24px; border-bottom: 2px solid #f3f4f6;">
          <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">🛒 Bestellung</h2>
          <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background-color: #374151; color: white;">
                <th style="padding: 12px; text-align: left; font-weight: bold;">Artikel</th>
                <th style="padding: 12px; text-align: right; font-weight: bold;">Preis</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHTML}
            </tbody>
          </table>
        </div>

        <!-- Order Summary -->
        <div style="padding: 24px; background-color: #f9fafb;">
          <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">💰 Zusammenfassung</h2>
          <div style="background-color: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Zwischensumme:</span>
              <span style="font-weight: bold;">${orderData.subtotal.toFixed(2).replace('.', ',')} €</span>
            </div>
            
            ${orderData.orderType === 'delivery' ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Liefergebühr:</span>
                <span style="font-weight: bold;">${orderData.deliveryFee.toFixed(2).replace('.', ',')} €</span>
              </div>
            ` : ''}
            
            <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #dc2626;">
              <span>Gesamtbetrag:</span>
              <span>${orderData.total.toFixed(2).replace('.', ',')} €</span>
            </div>
          </div>
        </div>

        ${orderData.note ? `
          <!-- Special Notes -->
          <div style="padding: 24px; border-top: 2px solid #f3f4f6;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">📝 Anmerkungen</h2>
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-style: italic;">${orderData.note}</p>
            </div>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="padding: 24px; text-align: center; background-color: #f3f4f6; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Bestellung eingegangen am ${new Date().toLocaleString('de-DE')}
          </p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
            FoodsTaxi-Gronau 🚕 | Ladestraße 3, 31028 Gronau (Leine)
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const orderData: OrderData = await req.json();

    // Validate required fields
    if (!orderData.name || !orderData.phone || !orderData.orderItems || orderData.orderItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required order data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate email HTML
    const emailHTML = generateEmailHTML(orderData);

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const restaurantEmail = Deno.env.get('RESTAURANT_EMAIL') || 'orders@foodstaxi-gronau.de';

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FoodsTaxi-Gronau <noreply@foodstaxi-gronau.de>',
        to: [restaurantEmail],
        subject: `🍕 Neue Bestellung von ${orderData.name} - ${orderData.total.toFixed(2).replace('.', ',')} €`,
        html: emailHTML,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order email sent successfully',
        emailId: emailResult.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});