import React, { useState, useCallback, memo } from 'react';
import { Plus, Minus, ShoppingCart, ChefHat, Clock, Star, ArrowRight, Check } from 'lucide-react';
import { MenuItem, PizzaSize } from '../types';
import { 
  wunschPizzaIngredients, 
  pizzaExtras, 
  pastaTypes, 
  sauceTypes, 
  saladSauceTypes,
  beerTypes 
} from '../data/menuItems';

interface MenuSectionProps {
  title: string;
  description?: string;
  subTitle?: string;
  items: MenuItem[];
  bgColor?: string;
  onAddToOrder: (
    menuItem: MenuItem, 
    selectedSize?: PizzaSize, 
    selectedIngredients?: string[], 
    selectedExtras?: string[],
    selectedPastaType?: string,
    selectedSauce?: string
  ) => void;
}

interface ItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: (
    menuItem: MenuItem, 
    selectedSize?: PizzaSize, 
    selectedIngredients?: string[], 
    selectedExtras?: string[],
    selectedPastaType?: string,
    selectedSauce?: string
  ) => void;
}

type ConfigurationStep = 'size' | 'pasta' | 'sauce' | 'ingredients' | 'extras' | 'summary';

const ItemModal: React.FC<ItemModalProps> = memo(({ item, isOpen, onClose, onAddToOrder }) => {
  const [currentStep, setCurrentStep] = useState<ConfigurationStep>('size');
  const [selectedSize, setSelectedSize] = useState<PizzaSize | undefined>(
    item.sizes ? item.sizes[0] : undefined
  );
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedPastaType, setSelectedPastaType] = useState<string>('');
  const [selectedSauce, setSelectedSauce] = useState<string>('');

  const resetSelections = useCallback(() => {
    setSelectedSize(item.sizes ? item.sizes[0] : undefined);
    setSelectedIngredients([]);
    setSelectedExtras([]);
    setSelectedPastaType('');
    setSelectedSauce('');
    
    // Determine initial step based on item type
    if (item.sizes && item.sizes.length > 0) {
      setCurrentStep('size');
    } else if (item.isPasta) {
      setCurrentStep('pasta');
    } else if (item.isSpezialitaet && ![81, 82].includes(item.id)) {
      setCurrentStep('sauce');
    } else if (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) {
      setCurrentStep('sauce');
    } else if (item.isBeerSelection) {
      setCurrentStep('sauce');
    } else if (item.isWunschPizza) {
      setCurrentStep('ingredients');
    } else if (item.isPizza) {
      setCurrentStep('extras');
    } else {
      setCurrentStep('summary');
    }
  }, [item]);

  React.useEffect(() => {
    if (isOpen) {
      resetSelections();
    }
  }, [isOpen, resetSelections]);

  const handleIngredientToggle = useCallback((ingredient: string) => {
    setSelectedIngredients(prev => {
      if (ingredient === 'ohne Zutat') {
        return prev.includes(ingredient) ? [] : [ingredient];
      }
      
      const filtered = prev.filter(ing => ing !== 'ohne Zutat');
      return filtered.includes(ingredient)
        ? filtered.filter(ing => ing !== ingredient)
        : [...filtered, ingredient];
    });
  }, []);

  const handleExtraToggle = useCallback((extra: string) => {
    setSelectedExtras(prev =>
      prev.includes(extra)
        ? prev.filter(e => e !== extra)
        : [...prev, extra]
    );
  }, []);

  const handleAddToOrder = useCallback(() => {
    onAddToOrder(item, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce);
    onClose();
  }, [item, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, onAddToOrder, onClose]);

  const getCurrentPrice = useCallback(() => {
    let price = selectedSize ? selectedSize.price : item.price;
    price += selectedExtras.length * 1.50;
    return price;
  }, [selectedSize, selectedExtras, item.price]);

  const getNextStep = useCallback((): ConfigurationStep | null => {
    switch (currentStep) {
      case 'size':
        if (item.isPasta) return 'pasta';
        if (item.isSpezialitaet && ![81, 82].includes(item.id)) return 'sauce';
        if (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) return 'sauce';
        if (item.isBeerSelection) return 'sauce';
        if (item.isWunschPizza) return 'ingredients';
        if (item.isPizza) return 'extras';
        return 'summary';
      case 'pasta':
        if (item.isSpezialitaet && ![81, 82].includes(item.id)) return 'sauce';
        if (item.isWunschPizza) return 'ingredients';
        if (item.isPizza) return 'extras';
        return 'summary';
      case 'sauce':
        if (item.isWunschPizza) return 'ingredients';
        if (item.isPizza) return 'extras';
        return 'summary';
      case 'ingredients':
        if (item.isPizza || item.isWunschPizza) return 'extras';
        return 'summary';
      case 'extras':
        return 'summary';
      default:
        return null;
    }
  }, [currentStep, item]);

  const canProceedToNext = useCallback(() => {
    switch (currentStep) {
      case 'size':
        return !item.sizes || selectedSize !== undefined;
      case 'pasta':
        return !item.isPasta || selectedPastaType !== '';
      case 'sauce':
        const needsSauceSelection = (item.isSpezialitaet && ![81, 82].includes(item.id)) || 
                                   (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ||
                                   item.isBeerSelection;
        return !needsSauceSelection || selectedSauce !== '';
      case 'ingredients':
        if (!item.isWunschPizza) return true;
        const validIngredients = selectedIngredients.filter(ing => ing !== 'ohne Zutat');
        if (selectedIngredients.includes('ohne Zutat')) {
          return validIngredients.length === 0;
        }
        return validIngredients.length === 4;
      case 'extras':
        return true; // Extras are optional
      default:
        return true;
    }
  }, [currentStep, item, selectedSize, selectedPastaType, selectedSauce, selectedIngredients]);

  const handleNext = useCallback(() => {
    if (!canProceedToNext()) return;
    
    const nextStep = getNextStep();
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }, [canProceedToNext, getNextStep]);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'pasta':
        if (item.sizes && item.sizes.length > 0) {
          setCurrentStep('size');
        }
        break;
      case 'sauce':
        if (item.isPasta) {
          setCurrentStep('pasta');
        } else if (item.sizes && item.sizes.length > 0) {
          setCurrentStep('size');
        }
        break;
      case 'ingredients':
        if (item.isSpezialitaet && ![81, 82].includes(item.id)) {
          setCurrentStep('sauce');
        } else if (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) {
          setCurrentStep('sauce');
        } else if (item.isBeerSelection) {
          setCurrentStep('sauce');
        } else if (item.isPasta) {
          setCurrentStep('pasta');
        } else if (item.sizes && item.sizes.length > 0) {
          setCurrentStep('size');
        }
        break;
      case 'extras':
        if (item.isWunschPizza) {
          setCurrentStep('ingredients');
        } else if (item.isSpezialitaet && ![81, 82].includes(item.id)) {
          setCurrentStep('sauce');
        } else if (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) {
          setCurrentStep('sauce');
        } else if (item.isBeerSelection) {
          setCurrentStep('sauce');
        } else if (item.isPasta) {
          setCurrentStep('pasta');
        } else if (item.sizes && item.sizes.length > 0) {
          setCurrentStep('size');
        }
        break;
      case 'summary':
        if (item.isPizza || item.isWunschPizza) {
          setCurrentStep('extras');
        } else if (item.isWunschPizza) {
          setCurrentStep('ingredients');
        } else if (item.isSpezialitaet && ![81, 82].includes(item.id)) {
          setCurrentStep('sauce');
        } else if (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) {
          setCurrentStep('sauce');
        } else if (item.isBeerSelection) {
          setCurrentStep('sauce');
        } else if (item.isPasta) {
          setCurrentStep('pasta');
        } else if (item.sizes && item.sizes.length > 0) {
          setCurrentStep('size');
        }
        break;
    }
  }, [currentStep, item]);

  const renderStepIndicator = () => {
    const steps: { key: ConfigurationStep; label: string; required: boolean }[] = [];
    
    if (item.sizes && item.sizes.length > 0) {
      steps.push({ key: 'size', label: 'Größe', required: true });
    }
    if (item.isPasta) {
      steps.push({ key: 'pasta', label: 'Nudelsorte', required: true });
    }
    if (item.isSpezialitaet && ![81, 82].includes(item.id)) {
      steps.push({ key: 'sauce', label: 'Soße', required: true });
    }
    if (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) {
      steps.push({ key: 'sauce', label: 'Dressing', required: true });
    }
    if (item.isBeerSelection) {
      steps.push({ key: 'sauce', label: 'Bier', required: true });
    }
    if (item.isWunschPizza) {
      steps.push({ key: 'ingredients', label: '4 Zutaten', required: true });
    }
    if (item.isPizza || item.isWunschPizza) {
      steps.push({ key: 'extras', label: 'Extras', required: false });
    }
    steps.push({ key: 'summary', label: 'Bestätigung', required: false });

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-6 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max px-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                index === currentIndex 
                  ? 'bg-orange-500 text-white' 
                  : index < currentIndex
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index < currentIndex && <Check className="w-4 h-4" />}
                <span>{step.label}</span>
                {step.required && <span className="text-red-300">*</span>}
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'size':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg text-center">
              {item.isPizza ? 'Größe wählen *' : 'Größe wählen *'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.sizes?.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSize?.name === size.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-lg">{size.name}</span>
                      {size.description && (
                        <span className="text-sm text-gray-600 block">{size.description}</span>
                      )}
                    </div>
                    <span className="font-bold text-orange-600 text-lg">
                      {size.price.toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'pasta':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg text-center">Nudelsorte wählen *</h4>
            <div className="grid grid-cols-2 gap-3">
              {pastaTypes.map((pastaType) => (
                <button
                  key={pastaType.name}
                  onClick={() => setSelectedPastaType(pastaType.name)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPastaType === pastaType.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <span className="font-medium text-lg">{pastaType.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'sauce':
        const sauceTitle = item.isBeerSelection ? 'Bier wählen *' : 
                          (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ? 'Dressing wählen *' : 
                          'Soße wählen *';
        const sauceOptions = item.isBeerSelection ? beerTypes :
                           (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ? saladSauceTypes :
                           sauceTypes;
        
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg text-center">{sauceTitle}</h4>
            <div className="grid grid-cols-1 gap-3">
              {sauceOptions.map((sauce) => (
                <button
                  key={sauce.name}
                  onClick={() => setSelectedSauce(sauce.name)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedSauce === sauce.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <span className="font-medium text-lg">{sauce.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'ingredients':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg text-center">
              Zutaten wählen * (genau 4 Zutaten oder "ohne Zutat")
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {wunschPizzaIngredients.map((ingredient) => (
                <button
                  key={ingredient.name}
                  onClick={() => handleIngredientToggle(ingredient.name)}
                  disabled={ingredient.disabled}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    selectedIngredients.includes(ingredient.name)
                      ? 'border-orange-500 bg-orange-50'
                      : ingredient.disabled
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {ingredient.name}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Ausgewählt: {selectedIngredients.length} / {selectedIngredients.includes('ohne Zutat') ? '0' : '4'}
            </p>
          </div>
        );

      case 'extras':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg text-center">
              Extras hinzufügen (je +1,50€)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {pizzaExtras.map((extra) => (
                <button
                  key={extra.name}
                  onClick={() => handleExtraToggle(extra.name)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    selectedExtras.includes(extra.name)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {extra.name}
                </button>
              ))}
            </div>
            {selectedExtras.length > 0 && (
              <p className="text-sm text-gray-600 text-center">
                Extras: +{(selectedExtras.length * 1.50).toFixed(2).replace('.', ',')} €
              </p>
            )}
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg text-center">Bestellung bestätigen</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="font-medium text-gray-900">{item.name}</div>
              {selectedSize && (
                <div className="text-sm text-blue-600">
                  Größe: {selectedSize.name} {selectedSize.description && `- ${selectedSize.description}`}
                </div>
              )}
              {selectedPastaType && (
                <div className="text-sm text-yellow-600">
                  Nudelsorte: {selectedPastaType}
                </div>
              )}
              {selectedSauce && (
                <div className="text-sm text-red-600">
                  {item.isBeerSelection ? 'Bier' : (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ? 'Dressing' : 'Soße'}: {selectedSauce}
                </div>
              )}
              {selectedIngredients.length > 0 && (
                <div className="text-sm text-green-600">
                  Zutaten: {selectedIngredients.join(', ')}
                </div>
              )}
              {selectedExtras.length > 0 && (
                <div className="text-sm text-purple-600">
                  Extras: {selectedExtras.join(', ')} (+{(selectedExtras.length * 1.50).toFixed(2).replace('.', ',')}€)
                </div>
              )}
              <div className="text-xl font-bold text-orange-600 pt-2 border-t">
                Preis: {getCurrentPrice().toFixed(2).replace('.', ',')} €
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
              {item.description && (
                <p className="text-gray-600 mt-1">{item.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {renderStepIndicator()}

          <div className="min-h-[400px] flex flex-col justify-center">
            {renderCurrentStep()}
          </div>

          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === (item.sizes?.length ? 'size' : item.isPasta ? 'pasta' : item.isSpezialitaet && ![81, 82].includes(item.id) ? 'sauce' : item.id >= 568 && item.id <= 573 && item.isSpezialitaet ? 'sauce' : item.isBeerSelection ? 'sauce' : item.isWunschPizza ? 'ingredients' : item.isPizza ? 'extras' : 'summary')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === (item.sizes?.length ? 'size' : item.isPasta ? 'pasta' : item.isSpezialitaet && ![81, 82].includes(item.id) ? 'sauce' : item.id >= 568 && item.id <= 573 && item.isSpezialitaet ? 'sauce' : item.isBeerSelection ? 'sauce' : item.isWunschPizza ? 'ingredients' : item.isPizza ? 'extras' : 'summary')
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Zurück
            </button>

            <div className="text-xl font-bold text-orange-600">
              {getCurrentPrice().toFixed(2).replace('.', ',')} €
            </div>

            {currentStep === 'summary' ? (
              <button
                onClick={handleAddToOrder}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                In den Warenkorb
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  canProceedToNext()
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Weiter
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const MenuSection: React.FC<MenuSectionProps> = ({ title, description, subTitle, items, bgColor = 'bg-orange-500', onAddToOrder }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleItemClick = useCallback((item: MenuItem) => {
    // Items that need configuration
    const needsConfiguration = item.sizes || 
                              item.isWunschPizza || 
                              item.isPizza || 
                              item.isPasta ||
                              item.isBeerSelection ||
                              (item.isSpezialitaet && ![81, 82].includes(item.id)) || // Exclude Gyros Hollandaise and Gyros Topf
                              (item.id >= 568 && item.id <= 573 && item.isSpezialitaet); // Salads

    if (needsConfiguration) {
      setSelectedItem(item);
    } else {
      onAddToOrder(item);
    }
  }, [onAddToOrder]);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  if (!items || items.length === 0) {
    return (
      <section className="mb-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Keine Artikel in dieser Kategorie verfügbar.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className={`${bgColor} text-white p-3 sm:p-4 rounded-t-xl`}>
        <div className="flex items-center gap-2 mb-1">
          <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
          <h2 className="text-sm sm:text-sm md:text-base font-bold">{title}</h2>
        </div>
        {description && (
          <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{description}</p>
        )}
        {subTitle && (
          <p className="text-xs sm:text-sm opacity-80 mt-1 italic">{subTitle}</p>
        )}
      </div>

      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200/60">
          {items.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="p-4 sm:p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50/30 transition-all duration-200 group cursor-pointer relative"
              onClick={() => handleItemClick(item)}
            >
              {/* Subtle shaded background for alternating items */}
              {index % 2 === 1 && (
                <div className="absolute inset-0 bg-gray-50/40 pointer-events-none" />
              )}
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm sm:text-base font-bold">
                      {item.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.allergens && (
                        <p className="text-xs text-gray-500 mt-2">
                          <span className="font-medium">Allergene:</span> {item.allergens}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-right">
                    {item.sizes && item.sizes.length > 0 ? (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">ab</div>
                        <div className="text-lg sm:text-xl font-bold text-orange-600">
                          {Math.min(...item.sizes.map(s => s.price)).toFixed(2).replace('.', ',')} €
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg sm:text-xl font-bold text-orange-600">
                        {item.price.toFixed(2).replace('.', ',')} €
                      </div>
                    )}
                  </div>

                  <button
                    className="flex items-center gap-1.5 bg-orange-500 text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Hinzufügen</span>
                    <span className="sm:hidden">+</span>
                  </button>
                </div>
              </div>

              {/* Configuration indicators */}
              <div className="flex flex-wrap gap-2 mt-3">
                {item.sizes && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Star className="w-3 h-3" />
                    Größen verfügbar
                  </span>
                )}
                {item.isWunschPizza && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    <ChefHat className="w-3 h-3" />
                    4 Zutaten wählbar
                  </span>
                )}
                {(item.isPizza && !item.isWunschPizza) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <Plus className="w-3 h-3" />
                    Extras verfügbar
                  </span>
                )}
                {item.isWunschPizza && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <Plus className="w-3 h-3" />
                    Extras verfügbar
                  </span>
                )}
                {item.isPasta && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    <Clock className="w-3 h-3" />
                    Nudelsorte wählbar
                  </span>
                )}
                {item.isSpezialitaet && ![81, 82].includes(item.id) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    <ChefHat className="w-3 h-3" />
                    Soße wählbar
                  </span>
                )}
                {item.id >= 568 && item.id <= 573 && item.isSpezialitaet && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    <ChefHat className="w-3 h-3" />
                    Dressing wählbar
                  </span>
                )}
                {item.isBeerSelection && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    <ChefHat className="w-3 h-3" />
                    Bier wählbar
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={closeModal}
          onAddToOrder={onAddToOrder}
        />
      )}
    </section>
  );
};

export default MenuSection;