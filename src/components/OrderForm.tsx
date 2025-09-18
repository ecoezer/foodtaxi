import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AsYouType } from 'libphonenumber-js';
import { Phone, ShoppingCart, X, Minus, Plus, Clock, MapPin, User, MessageSquare, AlertTriangle, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
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
  selectedPastaType?: string;
  selectedSauce?: string;
}

interface OrderFormProps {
  orderItems: OrderItem[];
  onRemoveItem: (id: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string) => void;
  onUpdateQuantity: (id: number, quantity: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string) => void;
  onClearCart?: () => void;
}

// Constants - Delivery zones sorted alphabetically
const DELIVERY_ZONES = {
  'banteln': { label: 'Banteln', minOrder: 25, fee: 2.5 },
  'barfelde': { label: 'Barfelde', minOrder: 20, fee: 2.5 },
  'betheln': { label: 'Betheln', minOrder: 25, fee: 3 },
  'brueggen': { label: 'Brüggen', minOrder: 35, fee: 3 },
  'burgstemmen': { label: 'Burgstemmen', minOrder: 35, fee: 4 },
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
    
    // Friday, Saturday, Sunday: 12:00 - 21:30
    const isWeekendOrFriday = day === 0 || day === 5 || day === 6;
    
    // Monday, Wednesday, Thursday: 12:00 - 21:30
    const isRegularDay = day === 1 || day === 3 || day === 4;

    let startHour: number;
    let endHour: number;

    if (isTuesday) {
      // Tuesday is closed - no available hours
      return { availableHours: [], getAvailableMinutes: () => [] };
    } else if (isWeekendOrFriday || isRegularDay) {
      // All open days: 12:00 - 21:30
      startHour = 12; // Restaurant opens at 12:00
      endHour = 21; // Last order at 21:00 for 21:30 closing
    } else {
      return { availableHours: [], getAvailableMinutes: () => [] };
    }

    // Generate all possible hours from start to end
    const allHours = Array.from(
      { length: endHour - startHour + 1 },
      (_, i) => startHour + i
    );

    // Filter available hours based on current time
    // Only show future time slots (at least 30 minutes from now)
    const availableHours = allHours.filter(hour => {
      if (hour > currentHour) {
        return true; // Future hours are always available
      } else if (hour === currentHour) {
        // For current hour, check if there are available minutes
        const availableMinutes = AVAILABLE_MINUTES.filter(min => parseInt(min) > currentMinute + 30);
        return availableMinutes.length > 0;
      }
      return false; // Past hours are not available
    });

    const getAvailableMinutes = (selectedHour: number): string[] => {
      if (selectedHour === currentHour) {
        // For current hour, only show minutes that are at least 30 minutes from now
        return AVAILABLE_MINUTES.filter(min => parseInt(min) > currentMinute + 30);
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

    // Check minimum order requirement for delivery
    const minOrderMet = orderType === 'pickup' || !deliveryZone || subtotal >= DELIVERY_ZONES[deliveryZone].minOrder;
    const minOrderRequired = orderType === 'delivery' && deliveryZone ? DELIVERY_ZONES[deliveryZone].minOrder : 0;
    const missingAmount = minOrderRequired > subtotal ? minOrderRequired - subtotal : 0;

    return { subtotal, deliveryFee, total, minOrderMet, minOrderRequired, missingAmount };
  }, [orderItems, orderType, deliveryZone]);
};

// Validation Schema - Updated postcode validation to be more flexible
const orderFormSchema = z
  .object({
    orderType: z.enum(['pickup', 'delivery'], {
      errorMap: () => ({ message: 'Bitte wählen Sie Abholung oder Lieferung' })
    }),
    deliveryZone: z.enum([
      'banteln', 'barfelde', 'betheln', 'brueggen', 'deinsen', 'duingen', 
      'burgstemmen',
      'dunsen-gime', 'eime', 'eitzum', 'elze', 'gronau', 'gronau-doetzum', 
      'gronau-eddighausen', 'haus-escherde', 'heinum', 'kolonie-godenau', 
      'mehle-elze', 'nienstedt', 'nordstemmen', 'rheden-elze', 'sibesse', 
      'sorsum-elze', 'wallensted'
    ]).optional(),
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
    { message: 'Bitte wählen Sie ein Liefergebiet', path: ['deliveryZone'] }
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
    data => data.orderType !== 'delivery' || (data.postcode && /^3\d{4}$/.test(data.postcode)),
    { message: 'Postleitzahl muss 5 Ziffern haben und mit 3 beginnen', path: ['postcode'] }
  );

type OrderFormData = z.infer<typeof orderFormSchema>;

// Sub-components
const OrderItemComponent = memo<{
  item: OrderItem;
  onRemove: (id: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string) => void;
  onUpdateQuantity: (id: number, quantity: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string) => void;
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
        {item.selectedPastaType && (
          <span className="text-xs text-yellow-600 ml-1 sm:ml-2 block">
            Nudelsorte: {item.selectedPastaType}
          </span>
        )}
        {item.selectedSauce && (
          <span className="text-xs text-red-600 ml-1 sm:ml-2 block">
            Soße: {item.selectedSauce}
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
          onClick={() => onUpdateQuantity(item.menuItem.id, Math.max(0, item.quantity - 1), item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType, item.selectedSauce)}
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
          onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType, item.selectedSauce)}
          className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
          aria-label="Menge erhöhen"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.menuItem.id, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType, item.selectedSauce)}
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
  minOrderMet: boolean;
  minOrderRequired: number;
  missingAmount: number;
}>(({ subtotal, deliveryFee, total, orderType, minOrderMet, minOrderRequired, missingAmount }) => (
  <div className="flex flex-col space-y-2 py-3 sm:py-4 border-t border-b border-gray-100 bg-gray-50 px-3 sm:px-4 rounded-lg">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-900 text-sm sm:text-base">Zwischensumme:</span>
      <span className="font-medium text-gray-900 text-sm sm:text-base">
        {subtotal.toFixed(2).replace('.', ',')} €
      </span>
    </div>

    {orderType === 'delivery' && (
      <>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 text-sm sm:text-base">Liefergebühr:</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {deliveryFee.toFixed(2).replace('.', ',')} €
          </span>
        </div>
        
        {minOrderRequired > 0 && (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 text-sm">Mindestbestellwert:</span>
            <span className="font-medium text-gray-700 text-sm">
              {minOrderRequired.toFixed(2).replace('.', ',')} €
            </span>
          </div>
        )}
        
        {!minOrderMet && missingAmount > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-2">
            <span className="font-medium text-red-700 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Noch benötigt:
            </span>
            <span className="font-bold text-red-700 text-sm">
              {missingAmount.toFixed(2).replace('.', ',')} €
            </span>
          </div>
        )}
      </>
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

// Enhanced Delivery Zone Selector with scroll indicators
const DeliveryZoneSelector = memo<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
}>(({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  const checkScrollability = useCallback(() => {
    const select = selectRef.current;
    if (!select) return;

    const { scrollTop, scrollHeight, clientHeight } = select;
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight);
  }, []);

  useEffect(() => {
    const select = selectRef.current;
    if (!select) return;

    const handleScroll = () => checkScrollability();
    select.addEventListener('scroll', handleScroll);
    
    // Initial check
    setTimeout(checkScrollability, 100);

    return () => select.removeEventListener('scroll', handleScroll);
  }, [checkScrollability]);

  return (
    <div className="relative">
      <div className="relative">
        <select
          ref={selectRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            setTimeout(checkScrollability, 100);
          }}
          onBlur={() => setIsOpen(false)}
          className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 transition-colors text-sm appearance-none pr-10 ${
            error ? 'border-red-500' : ''
          }`}
          style={{ maxHeight: '200px' }}
        >
          <option value="">Bitte wählen Sie Ihr Liefergebiet</option>
          {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
            <option key={key} value={key}>
              {zone.label} - Min. {zone.minOrder.toFixed(2).replace('.', ',')}€ - Lieferung {zone.fee.toFixed(2).replace('.', ',')}€
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Scroll indicators - only show when dropdown is focused and scrollable */}
      {isOpen && (canScrollUp || canScrollDown) && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 pointer-events-none z-10">
          {canScrollUp && (
            <div className="bg-orange-500 text-white rounded-full p-1 shadow-lg animate-bounce">
              <ChevronUp className="w-3 h-3" />
            </div>
          )}
          {canScrollDown && (
            <div className="bg-orange-500 text-white rounded-full p-1 shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
              <ChevronDown className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Main Component
const OrderForm: React.FC<OrderFormProps> = ({ orderItems, onRemoveItem, onUpdateQuantity, onClearCart }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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
  
  const { subtotal, deliveryFee, total, minOrderMet, minOrderRequired, missingAmount } = useOrderCalculation(orderItems, orderType, deliveryZone);

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
  const handleClearCart = useCallback(() => {
    if (onClearCart) {
      onClearCart();
      setShowClearConfirm(false);
    }
  }, [onClearCart]);

  const onSubmit = useCallback(async (data: OrderFormData) => {
    if (isSubmitting) return;
    
    // Prevent double submission on mobile
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
    }
    
    // Check minimum order requirement for delivery
    if (data.orderType === 'delivery' && !minOrderMet) {
      if (submitButton) {
        submitButton.disabled = false;
      }
      return; // Don't submit if minimum order not met
    }
    
    setIsSubmitting(true);
    
    console.log('Order submission started on mobile:', {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      orderData: data,
      orderItems: orderItems.length
    });
    
    try {
      // Prepare order data for email
      const orderData = {
        orderType: data.orderType,
        deliveryZone: data.deliveryZone,
        deliveryTime: data.deliveryTime,
        specificTime: data.specificTime,
        name: data.name,
        phone: data.phone,
        street: data.street,
        houseNumber: data.houseNumber,
        postcode: data.postcode,
        note: data.note,
        orderItems: orderItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total
      };

      // Send email notification (don't block WhatsApp if this fails)
      try {
        // Use environment variables for Supabase function URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const emailApiUrl = supabaseUrl 
          ? `${supabaseUrl}/functions/v1/send-order-email`
          : '/api/send-order-email'; // Fallback for local development
        
        const emailResponse = await fetch(emailApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(orderData),
        });

        if (emailResponse.ok) {
          console.log('Order email sent successfully');
        } else {
          console.warn('Failed to send order email, but continuing with WhatsApp');
        }
      } catch (emailError) {
        console.warn('Email service error, but continuing with WhatsApp:', emailError);
      }

      const orderDetails = orderItems
        .map(item => {
          let itemText = `${item.quantity}x Nr. ${item.menuItem.number} ${item.menuItem.name}`;
          if (item.selectedSize) {
            itemText += ` (${item.selectedSize.name}${item.selectedSize.description ? ` - ${item.selectedSize.description}` : ''})`;
          }
          if (item.selectedPastaType) {
            itemText += ` - Nudelsorte: ${item.selectedPastaType}`;
          }
          if (item.selectedSauce) {
            itemText += ` - Soße: ${item.selectedSauce}`;
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
        const zone = DELIVERY_ZONES[data.deliveryZone!];
        messageText += `📍 Lieferadresse:\n`;
        messageText += `   ${data.street} ${data.houseNumber}\n`;
        messageText += `   ${data.postcode}\n`;
        messageText += `   Liefergebiet: ${zone.label}\n\n`;
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

      const whatsappURL = `https://wa.me/+4915259630500?text=${encodeURIComponent(messageText)}`;
      
      // Enhanced mobile detection and WhatsApp opening
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      console.log('Opening WhatsApp:', { isMobile, isIOS, isAndroid, url: whatsappURL });
      
      if (isMobile) {
        // For mobile devices, use the most compatible approach
        try {
          if (isIOS && isSafari) {
            // iOS Safari - use location.href directly
            console.log('iOS Safari detected - using location.href');
            window.location.href = whatsappURL;
          } else if (isAndroid) {
            // Android - try window.open first, then location.href
            console.log('Android detected - trying window.open');
            const whatsappWindow = window.open(whatsappURL, '_blank', 'noopener,noreferrer');
            
            // Check if window.open was blocked
            setTimeout(() => {
              if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
                console.log('Window.open blocked on Android - using location.href');
                window.location.href = whatsappURL;
              }
            }, 100);
          } else {
            // Other mobile browsers - try window.open with fallback
            console.log('Other mobile browser - trying window.open with fallback');
            const whatsappWindow = window.open(whatsappURL, '_blank', 'noopener,noreferrer');
            
            setTimeout(() => {
              if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
                console.log('Window.open failed - using location.href');
                window.location.href = whatsappURL;
              }
            }, 100);
          }
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          // Ultimate fallback - direct navigation
          try {
            window.location.href = whatsappURL;
          } catch (fallbackError) {
            console.error('All WhatsApp opening methods failed:', fallbackError);
            alert('WhatsApp konnte nicht geöffnet werden. Bitte rufen Sie uns direkt an: 01525 9630500');
          }
        }
      } else {
        // For desktop, use window.open
        window.open(whatsappURL, '_blank', 'noopener,noreferrer');
      }
      
    } catch (error) {
      console.error('Error submitting order:', error);
      // Show user-friendly error message
      alert('Es gab ein Problem beim Senden der Bestellung. Bitte versuchen Sie es erneut oder rufen Sie uns direkt an: 01525 9630500');
    } finally {
      setIsSubmitting(false);
      // Re-enable submit button
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }, [orderItems, subtotal, total, isSubmitting, minOrderMet]);

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
              Mo, Mi, Do: 12:00–21:30<br />
              Fr, Sa, So & Feiertage: 12:00–21:30<br />
              Di: Ruhetag
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-full flex flex-col gap-4 sm:gap-6 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ihre Bestellung</h3>
          <span className="bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full text-center">
            {orderItems.length} Artikel
          </span>
        </div>
        
        {/* Clear Cart Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-xs sm:text-sm font-medium border border-red-200 hover:border-red-300"
            title="Warenkorb leeren"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Alles löschen</span>
          </button>
          
          {/* Confirmation Dialog */}
          {showClearConfirm && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-4 z-50 min-w-[200px] sm:min-w-[250px]">
              <p className="text-sm text-gray-700 mb-3">
                Möchten Sie wirklich alle Artikel aus dem Warenkorb entfernen?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Ja, löschen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
        {orderItems.map((item, index) => (
          <OrderItemComponent
            key={`${item.menuItem.id}-${item.selectedSize?.name || 'default'}-${item.selectedIngredients?.join(',') || 'none'}-${item.selectedExtras?.join(',') || 'none'}-${item.selectedPastaType || 'none'}-${item.selectedSauce || 'none'}-${index}`}
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
              <FormField label="Liefergebiet *" error={errors.deliveryZone?.message}>
                <DeliveryZoneSelector
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.deliveryZone?.message}
                />
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
                    placeholder="Postleitzahl (5 Ziffern, beginnt mit 3) *"
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
          minOrderMet={minOrderMet}
          minOrderRequired={minOrderRequired}
          missingAmount={missingAmount}
        />

        <button
          type="submit"
          disabled={!isValid || isSubmitting || (orderType === 'delivery' && !minOrderMet)}
          className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold transition-all duration-300 transform text-sm sm:text-base touch-manipulation ${
            isValid && !isSubmitting && (orderType === 'pickup' || minOrderMet)
              ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          onTouchStart={() => {
            // Prevent iOS double-tap zoom and improve touch responsiveness
          }}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              Wird gesendet...
            </>
          ) : orderType === 'delivery' && !minOrderMet ? (
            <>
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              Mindestbestellwert nicht erreicht
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