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

const ItemModal: React.FC<ItemModalProps> = memo(({ item, isOpen, onClose, onAddToOrder }) => {
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

  const canAddToOrder = useCallback(() => {
    // Check if pasta type is required and selected
    if (item.isPasta && !selectedPastaType) {
      return false;
    }
    
    // Check if sauce is required and selected
    const needsSauceSelection = (item.isSpezialitaet && ![81, 82].includes(item.id)) || 
                               (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ||
                               item.isBeerSelection;
    if (needsSauceSelection && !selectedSauce) {
      return false;
    }
    
    // Check Wunsch Pizza ingredients
    if (item.isWunschPizza) {
      const validIngredients = selectedIngredients.filter(ing => ing !== 'ohne Zutat');
      if (selectedIngredients.includes('ohne Zutat')) {
        return validIngredients.length === 0;
      }
      return validIngredients.length === 4;
    }
    
    return true;
  }, [item, selectedPastaType, selectedSauce, selectedIngredients]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
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

          <div className="space-y-6">
            {/* Size Selection */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Größe wählen *</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.sizes.map((size) => (
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
            )}

            {/* Pasta Type Selection */}
            {item.isPasta && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Nudelsorte wählen *</h4>
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
            )}

            {/* Sauce/Dressing/Beer Selection */}
            {((item.isSpezialitaet && ![81, 82].includes(item.id)) || 
              (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ||
              item.isBeerSelection) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {item.isBeerSelection ? 'Bier wählen *' : 
                   (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ? 'Dressing wählen *' : 
                   'Soße wählen *'}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {(item.isBeerSelection ? beerTypes :
                    (item.id >= 568 && item.id <= 573 && item.isSpezialitaet) ? saladSauceTypes :
                    sauceTypes).map((sauce) => (
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
            )}

            {/* Wunsch Pizza Ingredients */}
            {item.isWunschPizza && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">
                  4 Zutaten wählen * (genau 4 Zutaten oder "ohne Zutat")
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto ingredients-scroll">
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
                <p className="text-sm text-gray-600">
                  Ausgewählt: {selectedIngredients.length} / {selectedIngredients.includes('ohne Zutat') ? '0' : '4'}
                </p>
              </div>
            )}

            {/* Pizza Extras */}
            {(item.isPizza || item.isWunschPizza) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Extras hinzufügen (je +1,50€)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto ingredients-scroll">
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
                  <p className="text-sm text-gray-600">
                    Extras: +{(selectedExtras.length * 1.50).toFixed(2).replace('.', ',')} €
                  </p>
                )}
              </div>
            )}

            {/* Order Summary */}
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

          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all"
            >
              Abbrechen
            </button>

            <button
              onClick={handleAddToOrder}
              disabled={!canAddToOrder()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                canAddToOrder()
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              In den Warenkorb
            </button>
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
              className="p-3 sm:p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50/30 transition-all duration-200 group relative"
            >
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
                      <div className="text-lg sm:text-xl font-bold text-orange-600 relative">
                        {/* Show original price crossed out if there's a special offer */}
                        {((item.id === 84 && new Date().getDay() === 3) || 
                          ([547, 548].includes(item.id) && new Date().getDay() === 4)) && (
                          <div className="text-sm text-gray-500 line-through">
                            {item.id === 84 ? '14,90' : '12,90'} €
                          </div>
                        )}
                        <div className={((item.id === 84 && new Date().getDay() === 3) || 
                          ([547, 548].includes(item.id) && new Date().getDay() === 4)) 
                          ? 'text-red-600 font-extrabold animate-pulse' : ''}>
                          {item.price.toFixed(2).replace('.', ',')} €
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="flex items-center gap-1.5 bg-orange-500 text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg"
                    onClick={() => handleItemClick(item)}
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Hinzufügen</span>
                  </button>
                </div>
              </div>

              {/* Configuration indicators */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Special offer indicators */}
                {item.id === 84 && new Date().getDay() === 3 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                    🔥 RIPPCHEN-TAG SPEZIAL
                  </span>
                )}
                {[546, 547, 548, 549].includes(item.id) && new Date().getDay() === 4 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                    🔥 SCHNITZEL-TAG SPEZIAL
                  </span>
                )}
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