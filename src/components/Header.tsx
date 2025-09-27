import React, { memo, useMemo } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { useOpeningHours } from '../hooks/useOpeningHours';

// Constants
const ANIMATION_DURATION = 1000;
const GRADIENT_TRANSFORM = {
  INITIAL: '-200%',
  FINAL: '200%'
};

const SHARED_CLASSES = {
  card: 'rounded-xl shadow-md transition-colors group relative overflow-hidden',
  gradientOverlay: 'absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%]',
  timeSlot: 'text-center bg-yellow-100 rounded-lg p-2'
};

// Types
interface OpeningHoursData {
  isOpen: boolean;
  currentHours: string;
  nextOpeningTime: string;
  isTuesday: boolean;
}

// Sub-components
const OpeningHoursCard: React.FC<{ data: OpeningHoursData }> = memo(({ data }) => {
  const { isOpen, nextOpeningTime, isTuesday } = data;

  return (
    <div className={`bg-yellow-50 border-2 border-yellow-200 hover:border-yellow-300 ${SHARED_CLASSES.card}`}>
      <div className='flex flex-col items-center text-center p-3 relative z-10' role="region" aria-live="polite" aria-label="Öffnungszeiten Status">
        <div className='flex items-center justify-center gap-2 mb-3'>
          <Clock
            className={`h-4 w-4 ${isOpen ? 'text-green-500' : 'text-red-500'}`}
            aria-hidden="true"
          />
          <h2 className='font-semibold text-gray-900 text-base'>
            Öffnungszeiten
          </h2>
        </div>

        <div className='mb-3'>
          {isTuesday ? (
            <span className='px-3 py-1 bg-gray-500 text-white rounded-full text-xs font-medium'>
              Ruhetag 😴
            </span>
          ) : isOpen ? (
            <span className='px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium'>
              Jetzt geöffnet 🚗
            </span>
          ) : (
            <div className='text-center'>
              <span className='px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium inline-block mb-1'>
                Geschlossen 🏠
              </span>
              {nextOpeningTime && (
                <p className='text-xs text-gray-700 font-medium'>
                  {nextOpeningTime}
                </p>
              )}
            </div>
          )}
        </div>

        <div className='space-y-2 w-full'>
          <div className={SHARED_CLASSES.timeSlot}>
            <span className='text-xs text-gray-700 block mb-0.5'>
              Mo, Mi, Do
            </span>
            <span className='text-base font-bold text-gray-900' style={{ marginTop: '1px' }}>
              12:00–21:30
            </span>
          </div>
          <div className={SHARED_CLASSES.timeSlot}>
            <span className='text-xs text-gray-700 block mb-0.5'>
              Fr, Sa, So & Feiertage
            </span>
            <span className='text-base font-bold text-gray-900' style={{ marginTop: '1px' }}>
              12:00–21:30
            </span>
          </div>
          <div className={`${SHARED_CLASSES.timeSlot} bg-gray-100`}>
            <span className='text-xs text-gray-700 block mb-0.5'>
              Dienstag
            </span>
            <span className='text-base font-bold text-gray-600'>
              Ruhetag
            </span>
          </div>
        </div>
      </div>
      <div 
        className={SHARED_CLASSES.gradientOverlay}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />
    </div>
  );
});

const AddressCard: React.FC = memo(() => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.open(
        'https://g.co/kgs/Ch1FBfP',
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <a
      href='https://g.co/kgs/Ch1FBfP'
      target='_blank'
      rel='noopener noreferrer'
      className={`bg-black text-white hover:bg-gray-900 flex items-center ${SHARED_CLASSES.card}`}
      aria-label="Google Maps'te konumu görüntüle - Ladestraße 3, 31028 Gronau (Leine)"
      onKeyDown={handleKeyDown}
    >
      <div className='absolute inset-0 opacity-10' aria-hidden="true">
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '16px 16px',
            backgroundPosition: '-8px -8px',
            transform: 'rotate(30deg)'
          }}
        />
      </div>
      <div className='text-center relative z-10 py-6 px-3 w-full'>
        <div className='flex items-center justify-center gap-2 mb-3'>
          <MapPin className='h-4 w-4 text-yellow-400' aria-hidden="true" />
          <h2 className='font-semibold text-white text-base'>Adresse</h2>
        </div>
        <div className='space-y-1'>
          <p className='text-lg font-bold text-yellow-400'>
            LADESTRASSE 3
            <br />
            31028 GRONAU (LEINE)
          </p>
          <p className='text-xs text-gray-300 bg-gray-800 inline-block px-3 py-1 rounded-full'>
            🚗 FoodsTaxi Lieferservice 🍕
          </p>
        </div>
      </div>
      <div 
        className={SHARED_CLASSES.gradientOverlay}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />
    </a>
  );
});

const Header: React.FC = memo(() => {
  const openingHoursData = useOpeningHours();
  
  // Get current day for special offers
  const currentDay = new Date().getDay();
  const isWednesday = currentDay === 3;
  const isThursday = currentDay === 4;

  // Memoize the opening hours data to prevent unnecessary re-renders
  const memoizedOpeningHours = useMemo(() => openingHoursData, [
    openingHoursData.isOpen,
    openingHoursData.currentHours,
    openingHoursData.nextOpeningTime,
    openingHoursData.isTuesday
  ]);

  // Null check for opening hours data
  if (!memoizedOpeningHours) {
    return (
      <header className='bg-white pt-6 border-b'>
        <div className='container mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col items-center max-w-5xl'>
          <div className='text-center text-gray-500'>Yükleniyor...</div>
        </div>
      </header>
    );
  }

  return (
    <header className='bg-white pt-12 border-b'>
      <div className='container mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col items-center max-w-5xl'>
        <h1 className='text-2xl sm:text-3xl font-bold tracking-tighter mb-4 text-gray-900 relative animate-fade-in text-center'>
          <span className='relative'>
            <span>FoodsTaxi-Gronau</span>
            <span className='absolute -bottom-1 left-0 w-full h-1 bg-yellow-200 transform -skew-x-12' aria-hidden="true" />
          </span>
          <span className='text-yellow-500 relative ml-2'>
            <span>🚕</span>
          </span>
        </h1>

        {/* Special Day Offers */}
        <div className='mb-6 text-center space-y-2'>
          {/* New Special Offers */}
          <div className='bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg p-4 shadow-sm'>
            <h3 className='text-lg font-bold text-green-800 mb-3'>🎯 Jeden Tag von 12 bis 14 Uhr – unser Schüler-Deal! nur zum Abholen! </h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='bg-white/80 rounded-lg p-3 border border-green-200'>
                <div className='font-bold text-green-700 text-sm mb-1'>ANGEBOT 1</div>
                <div className='text-sm text-gray-800 mb-2'>Pizza (26cm) Margherita oder Salami</div>
                <div className='text-xl font-bold text-green-600'>6€</div>
              </div>
              <div className='bg-white/80 rounded-lg p-3 border border-green-200'>
                <div className='font-bold text-green-700 text-sm mb-1'>ANGEBOT 2</div>
                <div className='text-sm text-gray-800 mb-2'>Chicken Burger mit Pommes + Mayo oder Ketchup</div>
                <div className='text-xl font-bold text-green-600'>5€</div>
              </div>
              <div className='bg-white/80 rounded-lg p-3 border border-green-200'>
                <div className='font-bold text-green-700 text-sm mb-1'>ANGEBOT 3</div>
                <div className='text-sm text-gray-800 mb-2'>Burger mit Pommes + Mayo oder Ketchup</div>
                <div className='text-xl font-bold text-green-600'>5€</div>
              </div>
            </div>
          </div>

          {/* Existing Special Day Offers */}
          <div className={`bg-gradient-to-r from-orange-100 to-yellow-100 border-2 rounded-lg p-3 shadow-sm ${
            isWednesday ? 'border-orange-500 ring-2 ring-orange-200 animate-pulse' : 'border-orange-300'
          }`}>
            <p className='text-sm font-semibold text-orange-800 mb-1'>
              🍖 Mittwoch: Rippchen-Tag – 13,00 € {isWednesday ? '🔥 HEUTE!' : ''}
            </p>
            <p className='text-xs text-orange-700'>
              (mit BBQ Sauce, Pommes und Krautsalat){isWednesday ? ' - Sparen Sie 1,90€!' : ''}
            </p>
          </div>
          <div className={`bg-gradient-to-r from-blue-100 to-indigo-100 border-2 rounded-lg p-3 shadow-sm ${
            isThursday ? 'border-blue-500 ring-2 ring-blue-200 animate-pulse' : 'border-blue-300'
          }`}>
            <p className='text-sm font-semibold text-blue-800 mb-1'>
              🍖 Donnerstag: Schnitzel-Tag – ab 11,00 € {isThursday ? '🔥 HEUTE!' : ''}
            </p>
            <p className='text-xs text-blue-700'>
              (Jäger oder Hollandaise){isThursday ? ' - Sparen Sie 1,90€!' : ''}
            </p>
          </div>
        </div>

        <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl'>
          <OpeningHoursCard data={memoizedOpeningHours} />
          <AddressCard />
        </div>
      </div>
    </header>
  );
});

// Display names for better debugging
OpeningHoursCard.displayName = 'OpeningHoursCard';
AddressCard.displayName = 'AddressCard';
Header.displayName = 'Header';

export default Header;