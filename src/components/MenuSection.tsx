import React, { useState, useCallback, memo } from 'react';
import { Plus, Minus, ShoppingCart, ChefHat, Clock, Star } from 'lucide-react';
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
  }, [item.sizes]);

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

  const isFormValid = useCallback(() => {
    // Check if sauce selection is required and not selected
    const needsSauceSelection = item.isSpezialitaet && 
      ![81, 82].includes(item.id); // Exclude Gyros Hollandaise (81) and Gyros Topf (82)
    
    if (needsSauceSelection && !selectedSauce) {
      return false;
    }

    // Check if salad dressing selection is required
    const needsDressingSelection = item.id >= 568 && item.id <= 573 && item.isSpezialitaet;
    if (needsDressingSelection && !selectedSauce) {
      return false;
    }

    // Check if beer selection is required
    if (item.isBeerSelection && !selectedSauce) {
      return false;
    }

    // Check if pasta type selection is required
    if (item.isPasta && !selectedPastaType) {
      return false;
    }

    // Check if Wunsch Pizza has exactly 4 ingredients
    if (item.isWunschPizza) {
      const validIngredients = selectedIngredients.filter(ing => ing !== 'ohne Zutat');
      if (selectedIngredients.includes('ohne Zutat')) {
        return validIngredients.length === 0;
      }
      return validIngredients.length === 4;
    }

    return true;
  }, [item, selectedSauce, selectedPastaType, selectedIngredients]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

          {/* Size Selection for Pizzas and Drinks */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                {item.isPizza ? 'Größe wählen *' : 'Größe wählen *'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedSize?.name === size.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{size.name}</span>
                        {size.description && (
                          <span className="text-sm text-gray-600 block">{size.description}</span>
                        )}
                      </div>
                      <span className="font-bold text-orange-600">
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
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Nudelsorte wählen *</h4>
              <div className="grid grid-cols-2 gap-3">
                {pastaTypes.map((pastaType) => (
                  <button
                    key={pastaType.name}
                    onClick={() => setSelectedPastaType(pastaType.name)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedPastaType === pastaType.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <span className="font-medium">{pastaType.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sauce Selection for Spezialitäten (excluding Gyros Hollandaise and Gyros Topf) */}
          {item.isSpezialitaet && ![81, 82].includes(item.id) && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Soße wählen *</h4>
              <div className="grid grid-cols-1 gap-3">
                {sauceTypes.map((sauce) => (
                  <button
                    key={sauce.name}
                    onClick={() => setSelectedSauce(sauce.name)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedSauce === sauce.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <span className="font-medium">{sauce.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dressing Selection for Salads */}
          {item.id >= 568 && item.id <= 573 && item.isSpezialitaet && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Dressing wählen *</h4>
              <div className="grid grid-cols-1 gap-3">
                {saladSauceTypes.map((sauce) => (
                  <button
                    key={sauce.name}
                    onClick={() => setSelectedSauce(sauce.name)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedSauce === sauce.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <span className="font-medium">{sauce.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Beer Selection */}
          {item.isBeerSelection && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Bier wählen *</h4>
              <div className="grid grid-cols-1 gap-3">
                {beerTypes.map((beer) => (
                  <button
                    key={beer.name}
                    onClick={() => setSelectedSauce(beer.name)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedSauce === beer.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <span className="font-medium">{beer.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wunsch Pizza Ingredients */}
          {item.isWunschPizza && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Zutaten wählen * (genau 4 Zutaten oder "ohne Zutat")
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {wunschPizzaIngredients.map((ingredient) => (
                  <button
                    key={ingredient.name}
                    onClick={() => handleIngredientToggle(ingredient.name)}
                    disabled={ingredient.disabled}
                    className={`p-2 rounded-lg border-2 transition-all text-sm ${
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
              <p className="text-sm text-gray-600 mt-2">
                Ausgewählt: {selectedIngredients.length} / {selectedIngredients.includes('ohne Zutat') ? '0' : '4'}
              </p>
            </div>
          )}

          {/* Pizza Extras */}
          {item.isPizza && !item.isWunschPizza && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Extras hinzufügen (je +1,50€)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {pizzaExtras.map((extra) => (
                  <button
                    key={extra.name}
                    onClick={() => handleExtraToggle(extra.name)}
                    className={`p-2 rounded-lg border-2 transition-all text-sm ${
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
                <p className="text-sm text-gray-600 mt-2">
                  Extras: +{(selectedExtras.length * 1.50).toFixed(2).replace('.', ',')} €
                </p>
              )}
            </div>
          )}

          {/* Add to Order Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xl font-bold text-orange-600">
              {getCurrentPrice().toFixed(2).replace('.', ',')} €
            </div>
            <button
              onClick={handleAddToOrder}
              disabled={!isFormValid()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isFormValid()
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
      <div className={`${bgColor} text-white p-4 sm:p-6 rounded-t-xl`}>
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="w-6 h-6 sm:w-8 sm:h-8" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</h2>
        </div>
        {description && (
          <p className="text-sm sm:text-base opacity-90 leading-relaxed">{description}</p>
        )}
        {subTitle && (
          <p className="text-sm sm:text-base opacity-80 mt-2 italic">{subTitle}</p>
        )}
      </div>

      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="p-4 sm:p-6 hover:bg-gray-50 transition-colors group cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm sm:text-base font-bold">
                      {item.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight group-hover:text-orange-600 transition-colors">
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
                    className="flex items-center gap-2 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                  >
                    <Plus className="w-4 h-4" />
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
                {item.isPizza && !item.isWunschPizza && (
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