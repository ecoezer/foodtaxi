import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AsYouType } from 'libphonenumber-js';
import { Phone, ShoppingCart, X, Minus, Plus, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import { PizzaSize } from '../types';

// Types
interface OrderItem {
  menuItem: {
    id: number;
    name: string;
    price: number;
    number: string;
  };
  quantity: number;
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
  selectedExtras?: string[];
}

interface OrderFormProps {
  orderItems: OrderItem[];
  onRemoveItem: (id: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[]) => void;
  onUpdateQuantity: (id: number, quantity: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[]) => void;
}

// Constants
const DELIVERY_ZONES = {
  'zone1': { label: '0-2km', fee: 2 },
  'zone2': { label: '2-4km', fee: 3 },
  'zone3': { label: '4-6km', fee: 3.5 }
} as const;

const AVAILABLE_MINUTES = ['00', '15', '30', '45'];

// Custom Hooks
const useTimeSlots = () => {
  return useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Tuesday is closed (Ruhetag)
    const isTuesday = day === 2;
    
    // Friday, Saturday, Sunday: 12:00 - 23:00
    const isWeekendOrFriday = day === 0 || day === 5 || day === 6;
    
    // Monday, Wednesday, Thursday: 11:00 - 22:00
    const isRegularDay = day === 1 || day === 3 || day === 4;

    let startHour: number;
    let endHour: number;

    if (isTuesday) {
      // Tuesday is closed - no available hours
      return { availableHours: [], getAvailableMinutes: () => [] };
    } else if (isWeekendOrFriday) {
      startHour = 12;
      endHour = 22; // Last order at 22:00 for 23:00 closing
    } else if (isRegularDay) {
      startHour = 11;
      endHour = 21; // Last order at 21:00 for 22:00 closing
    } else {
      return { availableHours: [], getAvailableMinutes: () => [] };
    }

    const availableHours = Array.from(
      { length: endHour - startHour + 1 },
      (_, i) => startHour + i
    ).filter(hour => hour >= currentHour || currentHour > endHour);

    const getAvailableMinutes = (selectedHour: number): string[] => {
      if (selectedHour === currentHour) {
        return AVAILABLE_MINUTES.filter(min => parseInt(min) > currentMinute);
      }
      return AVAILABLE_MINUTES;
    };

    return { availableHours, getAvailableMinutes };
  }, []);
};

const useOrderCalculation = (orderItems: OrderItem[], orderType: 'pickup' | 'delivery', deliveryZone?: keyof typeof DELIVERY_ZONES) => {
  return useMemo(() => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
    const deliveryFee = orderType === 'delivery' && deliveryZone ? DELIVERY_ZONES[deliveryZone].fee : 0;
    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, total };
  }, [orderItems, orderType, deliveryZone]);
};

// Validation Schema
const orderFormSchema = z
  .object({
    orderType: z.enum(['pickup', 'delivery'], {
      errorMap: () => ({ message: 'Bitte wählen Sie Abholung oder Lieferung' })
    }),
    deliveryZone: z.enum(['zone1', 'zone2', 'zone3']).optional(),
    deliveryTime: z.enum(['asap', 'specific'], {
      errorMap: () => ({ message: 'Bitte wählen Sie eine Lieferzeit' })
    }),
    specificTime: z.string().optional(),
    name: z
      .string()
      .min(2, 'Name muss mindestens 2 Zeichen haben')
      .max(50, 'Name darf maximal 50 Zeichen haben'),
    phone: z
      .string()
      .min(10, 'Telefonnummer ist zu kurz')
      .max(16, 'Telefonnummer ist zu lang')
      .refine(val => /^\+49\s?[1-9]\d{1,4}\s?\d{5,10}$/.test(val), {
        message: 'Gültige deutsche Telefonnummer eingeben (+49 Format)'
      }),
    street: z.string().optional(),
    houseNumber: z.string().optional(),
    postcode: z.string().optional(),
    note: z
      .string()
      .max(500, 'Anmerkung darf maximal 500 Zeichen haben')
      .optional()
  })
  .refine(
    data => data.deliveryTime !== 'specific' || (data.specificTime && data.specificTime.length > 0),
    { message: 'Bitte wählen Sie eine Uhrzeit', path: ['specificTime'] }
  )
  .refine(
    data => data.orderType !== 'delivery' || !!data.deliveryZone,
    { message: 'Bitte wählen Sie eine Lieferzone', path: ['deliveryZone'] }
  )
  .refine(
    data => data.orderType !== 'delivery' || (data.street && data.street.length >= 3),
    { message: 'Straße ist bei Lieferung erforderlich', path: ['street'] }
  )
  .refine(
    data => data.orderType !== 'delivery' || (data.houseNumber && /^[0-9]+[a-zA-Z]*$/.test(data.houseNumber)),
    { message: 'Gültige Hausnummer eingeben (z.B. 123 oder 123a)', path: ['houseNumber'] }
  )
  .refine(
    data => data.orderType !== 'delivery' || (data.postcode && /^3102[0-9]$/.test(data.postcode)),
    { message: 'Postleitzahl muss mit 3102 beginnen', path: ['postcode'] }
  );

type OrderFormData = z.infer<typeof orderFormSchema>;

// Sub-components
const OrderItemComponent = memo<{
  item: OrderItem;
  onRemove: (id: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[]) => void;
  onUpdateQuantity: (id: number, quantity: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[]) => void;
}>(({ item, onRemove, onUpdateQuantity }) => (
  <div className="flex items-start justify-between bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg group hover:bg-gray-100 transition-all duration-200">
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 text-sm sm:text-base leading-tight">
        {item.menuItem.name}
        {item.selectedSize && (
          <span className="text-xs sm:text-sm text-blue-600 ml-1 sm:ml-2 block sm:inline">
            ({item.selectedSize.name} {item.selectedSize.description && `- ${item.selectedSize.description}`})
          </span>
        )}
        {item.selectedIngredients && item.selectedIngredients.length > 0 && (
          <span className="text-xs text-green-600 ml-1 sm:ml-2 block">
            Zutaten: {item.selectedIngredients.join(', ')}
          </span>
        )}
        {item.selectedExtras && item.selectedExtras.length > 0 && (
          <span className="text-xs text-purple-600 ml-1 sm:ml-2 block">
            Extras: {item.selectedExtras.join(', ')} (+{(item.selectedExtras.length * 1.50).toFixed(2)}€)
          </span>
        )}
      </p>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">
        {(item.menuItem.price * item.quantity).toFixed(2).replace('.', ',')} €
      </p>
    </div>
    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
      <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.menuItem.id, Math.max(0, item.quantity - 1), item.selectedSize, item.selectedIngredients, item.selectedExtras)}
          className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
          aria-label="Menge verringern"
        >
          <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <span className="w-6 sm:w-8 text-center font-medium text-gray-900 text-sm">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1, item.selectedSize, item.selectedIngredients, item.selectedExtras)}
          className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
          aria-label="Menge erhöhen"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.menuItem.id, item.selectedSize, item.selectedIngredients, item.selectedExtras)}
        className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded-full"
        aria-label="Artikel entfernen"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  </div>
));

const FormField = memo<{
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}>(({ label, error, icon, children }) => (
  <div className="space-y-1">
    {label && (
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </label>
    )}
    {children}
    {error && (
      <p className="text-red-500 text-sm animate-pulse" role="alert">
        {error}
      </p>
    )}
  </div>
));

const TimeSelector = memo<{
  availableHours: number[];
  getAvailableMinutes: (hour: number) => string[];
  onTimeChange: (time: string) => void;
  error?: string;
}>(({ availableHours, getAvailableMinutes, onTimeChange, error }) => {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<string>('');

  const availableMinutes = useMemo(() => 
    selectedHour !== null ? getAvailableMinutes(selectedHour) : [],
    [selectedHour, getAvailableMinutes]
  );

  const handleHourChange = useCallback((hour: string) => {
    const hourNum = parseInt(hour) || null;
    setSelectedHour(hourNum);
    setSelectedMinute('');
    
    if (hourNum && selectedMinute) {
      onTimeChange(`${hourNum}:${selectedMinute}`);
    }
  }, [selectedMinute, onTimeChange]);

  const handleMinuteChange = useCallback((minute: string) => {
    setSelectedMinute(minute);
    
    if (selectedHour !== null && minute) {
      onTimeChange(`${selectedHour}:${minute}`);
    }
  }, [selectedHour, onTimeChange]);

  // Check if restaurant is closed today (Tuesday)
  const now = new Date();
  const isTuesday = now.getDay() === 2;

  if (isTuesday) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600 font-medium">
          Dienstag ist Ruhetag. Bestellungen sind nicht möglich.
        </p>
      </div>
    );
  }

  if (availableHours.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600 font-medium">
          Heute sind keine weiteren Bestellzeiten verfügbar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4">
      <FormField label="Stunde *" icon={<Clock className="w-4 h-4" />}>
        <select
          value={selectedHour?.toString() || ''}
          onChange={e => handleHourChange(e.target.value)}
          className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
            error ? 'border-red-500' : ''
          }`}
        >
          <option value="">Stunde wählen</option>
          {availableHours.map(hour => (
            <option key={hour} value={hour.toString()}>
              {hour}:00
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Minute *">
        <select
          value={selectedMinute}
          onChange={e => handleMinuteChange(e.target.value)}
          disabled={selectedHour === null}
          className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-sm ${
            error ? 'border-red-500' : ''
          }`}
        >
          <option value="">Minute wählen</option>
          {availableMinutes.map(minute => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>
      </FormField>

      {error && (
        <p className="text-red-500 text-sm col-span-2 animate-pulse" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

const OrderSummary = memo<{
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderType: 'pickup' | 'delivery';
}>(({ subtotal, deliveryFee, total, orderType }) => (
  <div className="flex flex-col space-y-2 py-3 sm:py-4 border-t border-b border-gray-100 bg-gray-50 px-3 sm:px-4 rounded-lg">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-900 text-sm sm:text-base">Zwischensumme:</span>
      <span className="font-medium text-gray-900 text-sm sm:text-base">
        {subtotal.toFixed(2).replace('.', ',')} €
      </span>
    </div>

    {orderType === 'delivery' && (
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900 text-sm sm:text-base">Liefergebühr:</span>
        <span className="font-medium text-gray-900 text-sm sm:text-base">
          {deliveryFee.toFixed(2).replace('.', ',')} €
        </span>
      </div>
    )}

    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
      <span className="font-bold text-gray-900 text-sm sm:text-base">Gesamtbetrag:</span>
      <span className="text-lg sm:text-xl font-bold text-orange-600">
        {total.toFixed(2).replace('.', ',')} €
      </span>
    </div>
  </div>
));

const EmptyCart = memo(() => (
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center w-full max-w-full">
    <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Ihr Warenkorb ist leer</h3>
    <p className="text-gray-600 text-sm sm:text-base">Fügen Sie Artikel aus dem Menü hinzu, um eine Bestellung aufzugeben</p>
  </div>
));

// Main Component
const OrderForm: React.FC<OrderFormProps> = ({ orderItems, onRemoveItem, onUpdateQuantity }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { availableHours, getAvailableMinutes } = useTimeSlots();

  // Check if today is Tuesday (closed)
  const now = new Date();
  const isTuesday = now.getDay() === 2;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors, isValid }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',
    defaultValues: {
      orderType: 'pickup',
      deliveryZone: undefined,
      deliveryTime: 'asap',
      specificTime: '',
      name: '',
      phone: '+49 1',
      street: '',
      houseNumber: '',
      postcode: '',
      note: ''
    }
  });

  const orderType = watch('orderType');
  const deliveryZone = watch('deliveryZone');
  const deliveryTime = watch('deliveryTime');
  
  const { subtotal, deliveryFee, total } = useOrderCalculation(orderItems, orderType, deliveryZone);

  const formatPhone = useCallback((value: string): string => {
    let input = value;
    if (!input.startsWith('+49 1')) {
      input = '+49 1' + input.replace(/^\+49 1/, '');
    }
    return new AsYouType('DE').input(input);
  }, []);

  const handleTimeChange = useCallback((time: string) => {
    setValue('specificTime', time, { shouldValidate: true });
  }, [setValue]);

  const onSubmit = useCallback(async (data: OrderFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const orderDetails = orderItems
        .map(item => {
          let itemText = `${item.quantity}x Nr. ${item.menuItem.number} ${item.menuItem.name}`;
          if (item.selectedSize) {
            itemText += ` (${item.selectedSize.name}${item.selectedSize.description ? ` - ${item.selectedSize.description}` : ''})`;
          }
          if (item.selectedIngredients && item.selectedIngredients.length > 0) {
            itemText += ` - Zutaten: ${item.selectedIngredients.join(', ')}`;
          }
          if (item.selectedExtras && item.selectedExtras.length > 0) {
            itemText += ` - Extras: ${item.selectedExtras.join(', ')} (+${(item.selectedExtras.length * 1.50).toFixed(2)}€)`;
          }
          return itemText;
        })
        .join('\n');

      const timeInfo = data.deliveryTime === 'asap' 
        ? 'So schnell wie möglich' 
        : `Um ${data.specificTime} Uhr`;

      let messageText = `🍕 Neue Bestellung von ${data.name}\n\n`;
      messageText += `📞 Telefon: ${data.phone}\n\n`;
      messageText += `${data.orderType === 'pickup' ? '🏃‍♂️' : '🚗'} Bestellart: ${data.orderType === 'pickup' ? 'Abholung' : 'Lieferung'}\n`;
      messageText += `⏰ Lieferzeit: ${timeInfo}\n\n`;

      if (data.orderType === 'delivery') {
        messageText += `📍 Lieferadresse:\n`;
        messageText += `   ${data.street} ${data.houseNumber}\n`;
        messageText += `   ${data.postcode}\n\n`;
      }

      messageText += `🛒 Bestellung:\n${orderDetails}\n\n`;
      messageText += `💰 Zwischensumme: ${subtotal.toFixed(2).replace('.', ',')} €\n`;

      if (data.orderType === 'delivery' && data.deliveryZone) {
        const zone = DELIVERY_ZONES[data.deliveryZone];
        messageText += `🚚 Lieferkosten (${zone.label}): ${zone.fee.toFixed(2).replace('.', ',')} €\n`;
      }

      messageText += `💳 Gesamtbetrag: ${total.toFixed(2).replace('.', ',')} €\n\n`;
      
      if (data.note) {
        messageText += `📝 Anmerkung: ${data.note}\n`;
      }

      const whatsappURL = `https://wa.me/+4915256094733?text=${encodeURIComponent(messageText)}`;
      window.open(whatsappURL, '_blank');
      
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [orderItems, subtotal, total, isSubmitting]);

  if (orderItems.length === 0) {
    return <EmptyCart />;
  }

  // Show closed message on Tuesday
  if (isTuesday) {
    return (
      <div className="bg-white w-full max-w-full flex flex-col gap-4 sm:gap-6 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">😴</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ruhetag</h3>
          <p className="text-gray-600 mb-4">
            Dienstag ist unser Ruhetag. Wir sind geschlossen.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Öffnungszeiten:</strong><br />
              Mo, Mi, Do: 11:00–22:00<br />
              Fr, Sa, So & Feiertage: 12:00–23:00<br />
              Di: Ruhetag
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-full flex flex-col gap-4 sm:gap-6 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ihre Bestellung</h3>
        <span className="bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full">
          {orderItems.length} Artikel
        </span>
      </div>

      <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
        {orderItems.map((item, index) => (
          <OrderItemComponent
            key={`${item.menuItem.id}-${item.selectedSize?.name || 'default'}-${item.selectedIngredients?.join(',') || 'none'}-${item.selectedExtras?.join(',') || 'none'}-${index}`}
            item={item}
            onRemove={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Controller
            name="orderType"
            control={control}
            render={({ field }) => (
              <FormField label="Bestellart *" error={errors.orderType?.message}>
                <select
                  {...field}
                  className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                    errors.orderType ? 'border-red-500' : ''
                  }`}
                >
                  <option value="pickup">🏃‍♂️ Abholung</option>
                  <option value="delivery">🚗 Lieferung</option>
                </select>
              </FormField>
            )}
          />

          <Controller
            name="deliveryTime"
            control={control}
            render={({ field }) => (
              <FormField label="Lieferzeit *" error={errors.deliveryTime?.message}>
                <select
                  {...field}
                  className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                    errors.deliveryTime ? 'border-red-500' : ''
                  }`}
                >
                  <option value="asap">⚡ So schnell wie möglich</option>
                  <option value="specific">🕐 Zu bestimmter Zeit</option>
                </select>
              </FormField>
            )}
          />
        </div>

        {orderType === 'delivery' && (
          <Controller
            name="deliveryZone"
            control={control}
            render={({ field }) => (
              <FormField label="Lieferzone *" error={errors.deliveryZone?.message}>
                <select
                  {...field}
                  className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                    errors.deliveryZone ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Bitte wählen Sie Ihre Entfernung</option>
                  {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                    <option key={key} value={key}>
                      {zone.label} - {zone.fee.toFixed(2).replace('.', ',')} €
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          />
        )}

        {deliveryTime === 'specific' && (
          <>
            <TimeSelector
              availableHours={availableHours}
              getAvailableMinutes={getAvailableMinutes}
              onTimeChange={handleTimeChange}
              error={errors.specificTime?.message}
            />
            <input type="hidden" {...register('specificTime')} />
          </>
        )}

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormField label="Name *" icon={<User className="w-4 h-4" />} error={errors.name?.message}>
              <input
                {...field}
                type="text"
                placeholder="Ihr vollständiger Name"
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
            </FormField>
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormField label="Telefonnummer *" icon={<Phone className="w-4 h-4" />} error={errors.phone?.message}>
              <input
                {...field}
                type="tel"
                placeholder="+49 1XX XXXXXXX"
                value={value}
                onChange={e => onChange(formatPhone(e.target.value))}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                  errors.phone ? 'border-red-500' : ''
                }`}
              />
            </FormField>
          )}
        />

        {orderType === 'delivery' && (
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
              <MapPin className="w-4 h-4" />
              Lieferadresse
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <FormField error={errors.street?.message}>
                      <input
                        {...field}
                        type="text"
                        placeholder="Straßenname *"
                        className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                          errors.street ? 'border-red-500' : ''
                        }`}
                      />
                    </FormField>
                  )}
                />
              </div>

              <Controller
                name="houseNumber"
                control={control}
                render={({ field }) => (
                  <FormField error={errors.houseNumber?.message}>
                    <input
                      {...field}
                      type="text"
                      placeholder="Nr. *"
                      className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                        errors.houseNumber ? 'border-red-500' : ''
                      }`}
                    />
                  </FormField>
                )}
              />
            </div>

            <Controller
              name="postcode"
              control={control}
              render={({ field }) => (
                <FormField error={errors.postcode?.message}>
                  <input
                    {...field}
                    type="text"
                    placeholder="Postleitzahl (3102X) *"
                    maxLength={5}
                    className={`w-full max-w-xs rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm ${
                      errors.postcode ? 'border-red-500' : ''
                    }`}
                  />
                </FormField>
              )}
            />
          </div>
        )}

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <FormField label="Anmerkungen (optional)" icon={<MessageSquare className="w-4 h-4" />} error={errors.note?.message}>
              <textarea
                {...field}
                placeholder="z.B. Pizza in 8 Stücke schneiden, Klingel defekt, etc."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors resize-none text-sm"
                rows={3}
              />
            </FormField>
          )}
        />

        <OrderSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          orderType={orderType}
        />

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold transition-all duration-300 transform text-sm sm:text-base ${
            isValid && !isSubmitting
              ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-[1.02] shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              Wird gesendet...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              Bestellung per WhatsApp senden
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;