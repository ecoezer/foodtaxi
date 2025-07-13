import React, { useState } from 'react';
import { MenuItem, PizzaSize } from '../types';
import { useInView } from 'react-intersection-observer';
import { Plus, X, AlertCircle } from 'lucide-react';
import { wunschPizzaIngredients, pizzaExtras, pastaTypes, sauceTypes, saladSauceTypes, beerTypes } from '../data/menuItems';

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  description?: string;
  subTitle?: string;
  bgColor: string;
  onAddToOrder: (item: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  items,
  description,
  subTitle,
  bgColor,
  onAddToOrder
}) => {
  // Debug logging
  console.log(`MenuSection ${title}:`, { itemsCount: items.length, items });

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false, // Changed to false to ensure it triggers
    rootMargin: '50px 0px'
  });

  const [selectedSizes, setSelectedSizes] = useState<Record<number, PizzaSize>>({});
  const [selectedIngredients, setSelectedIngredients] = useState<Record<number, string[]>>({});
  const [selectedExtras, setSelectedExtras] = useState<Record<number, string[]>>({});
  const [selectedPastaTypes, setSelectedPastaTypes] = useState<Record<number, string>>({});
  const [selectedSauces, setSelectedSauces] = useState<Record<number, string>>({});
  const [showExtrasPopup, setShowExtrasPopup] = useState<number | null>(null);
  const [showIngredientsPopup, setShowIngredientsPopup] = useState<number | null>(null);
  const [showSizePopup, setShowSizePopup] = useState<number | null>(null);
  const [showPastaTypePopup, setShowPastaTypePopup] = useState<number | null>(null);
  const [showSaucePopup, setShowSaucePopup] = useState<number | null>(null);
  const [showSizeRequiredPopup, setShowSizeRequiredPopup] = useState<number | null>(null);
  const [showPastaTypeRequiredPopup, setShowPastaTypeRequiredPopup] = useState<number | null>(null);
  const [showSauceRequiredPopup, setShowSauceRequiredPopup] = useState<number | null>(null);

  const handleSizeSelect = (itemId: number, size: PizzaSize) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  const handlePastaTypeSelect = (itemId: number, pastaType: string) => {
    setSelectedPastaTypes(prev => ({
      ...prev,
      [itemId]: pastaType
    }));
  };

  const handleSauceSelect = (itemId: number, sauce: string) => {
    setSelectedSauces(prev => ({
      ...prev,
      [itemId]: sauce
    }));
  };

  const handleIngredientToggle = (itemId: number, ingredient: string) => {
    setSelectedIngredients(prev => {
      const currentIngredients = prev[itemId] || [];
      const isSelected = currentIngredients.includes(ingredient);
      
      if (isSelected) {
        // Remove ingredient
        return {
          ...prev,
          [itemId]: currentIngredients.filter(ing => ing !== ingredient)
        };
      } else {
        // Add ingredient (max 4)
        if (currentIngredients.length < 4) {
          return {
            ...prev,
            [itemId]: [...currentIngredients, ingredient]
          };
        }
        return prev;
      }
    });
  };

  const handleExtraToggle = (itemId: number, extra: string) => {
    setSelectedExtras(prev => {
      const currentExtras = prev[itemId] || [];
      const isSelected = currentExtras.includes(extra);
      
      if (isSelected) {
        // Remove extra
        return {
          ...prev,
          [itemId]: currentExtras.filter(ext => ext !== extra)
        };
      } else {
        // Add extra
        return {
          ...prev,
          [itemId]: [...currentExtras, extra]
        };
      }
    });
  };

  const handleAddToOrder = (item: MenuItem) => {
    const selectedSize = selectedSizes[item.id];
    const ingredients = selectedIngredients[item.id] || [];
    const extras = selectedExtras[item.id] || [];
    const selectedPastaType = selectedPastaTypes[item.id];
    const selectedSauce = selectedSauces[item.id];
    const hasSizes = item.sizes && item.sizes.length > 0;
    const isWunschPizza = item.isWunschPizza;
    const isPasta = item.isPasta;
    const isSpezialitaet = item.isSpezialitaet;
    const isBeerSelection = item.isBeerSelection;

    // Check if size is required but not selected
    if (hasSizes && !selectedSize) {
      setShowSizeRequiredPopup(item.id);
      return;
    }

    // Check if pasta type is required but not selected
    if (isPasta && !selectedPastaType) {
      setShowPastaTypeRequiredPopup(item.id);
      return;
    }

    // Check if sauce is required but not selected for Spezialitäten
    if (isSpezialitaet && !selectedSauce) {
      setShowSauceRequiredPopup(item.id);
      return;
    }

    // Check if beer type is required but not selected for beer selection
    if (isBeerSelection && !selectedSauce) {
      setShowSauceRequiredPopup(item.id);
      return;
    }

    // Check if Wunsch Pizza needs ingredients
    if (isWunschPizza && ingredients.length === 0) {
      // For Wunsch Pizza, we could show a different popup or just open ingredients popup
      setShowIngredientsPopup(item.id);
      return;
    }

    onAddToOrder(item, selectedSize, ingredients, extras, selectedPastaType, selectedSauce);
  };

  const getDisplayPrice = (item: MenuItem) => {
    const selectedSize = selectedSizes[item.id];
    const extras = selectedExtras[item.id] || [];
    
    let basePrice: number;
    if (selectedSize) {
      basePrice = selectedSize.price;
    } else if (item.sizes && item.sizes.length > 0) {
      basePrice = item.sizes[0].price; // Default to first size (Medium)
    } else {
      basePrice = item.price;
    }
    
    // Add extras cost (each extra is €1.50)
    const extrasPrice = extras.length * 1.50;
    
    return basePrice + extrasPrice;
  };

  // Check if item can be added to cart
  const canAddToCart = (item: MenuItem) => {
    const hasSizes = item.sizes && item.sizes.length > 0;
    const selectedSize = selectedSizes[item.id];
    const itemIngredients = selectedIngredients[item.id] || [];
    const isWunschPizza = item.isWunschPizza;
    const isPasta = item.isPasta;
    const selectedPastaType = selectedPastaTypes[item.id];
    const isSpezialitaet = item.isSpezialitaet;
    const selectedSauce = selectedSauces[item.id];
    const isBeerSelection = item.isBeerSelection;

    // For items with sizes (pizzas), size must be selected
    if (hasSizes && !selectedSize) {
      return false;
    }

    // For pasta items, pasta type must be selected
    if (isPasta && !selectedPastaType) {
      return false;
    }

    // For Spezialitäten, sauce must be selected
    if (isSpezialitaet && !selectedSauce) {
      return false;
    }

    // For beer selection, sauce (beer type) must be selected
    if (isBeerSelection && !selectedSauce) {
      return false;
    }

    // For Wunsch Pizza, at least one ingredient must be selected
    if (isWunschPizza && itemIngredients.length === 0) {
      return false;
    }

    return true;
  };

  const getAddButtonTooltip = (item: MenuItem) => {
    const hasSizes = item.sizes && item.sizes.length > 0;
    const selectedSize = selectedSizes[item.id];
    const itemIngredients = selectedIngredients[item.id] || [];
    const isWunschPizza = item.isWunschPizza;
    const isPasta = item.isPasta;
    const selectedPastaType = selectedPastaTypes[item.id];
    const isSpezialitaet = item.isSpezialitaet;
    const selectedSauce = selectedSauces[item.id];
    const isBeerSelection = item.isBeerSelection;

    if (hasSizes && !selectedSize) {
      return 'Bitte wählen Sie eine Größe';
    }

    if (isPasta && !selectedPastaType) {
      return 'Bitte wählen Sie eine Nudelsorte';
    }

    if (isSpezialitaet && !selectedSauce) {
      return 'Bitte wählen Sie eine Soße';
    }

    if (isBeerSelection && !selectedSauce) {
      return 'Bitte wählen Sie eine Biersorte';
    }

    if (isWunschPizza && itemIngredients.length === 0) {
      return 'Bitte wählen Sie mindestens eine Zutat';
    }

    return 'Zum Warenkorb hinzufügen';
  };

  const openSizePopup = (itemId: number) => {
    setShowSizePopup(itemId);
  };

  const closeSizePopup = () => {
    setShowSizePopup(null);
  };

  const openPastaTypePopup = (itemId: number) => {
    setShowPastaTypePopup(itemId);
  };

  const closePastaTypePopup = () => {
    setShowPastaTypePopup(null);
  };

  const openSaucePopup = (itemId: number) => {
    setShowSaucePopup(itemId);
  };

  const closeSaucePopup = () => {
    setShowSaucePopup(null);
  };

  const openExtrasPopup = (itemId: number) => {
    setShowExtrasPopup(itemId);
  };

  const closeExtrasPopup = () => {
    setShowExtrasPopup(null);
  };

  const openIngredientsPopup = (itemId: number) => {
    setShowIngredientsPopup(itemId);
  };

  const closeIngredientsPopup = () => {
    setShowIngredientsPopup(null);
  };

  const closeSizeRequiredPopup = () => {
    setShowSizeRequiredPopup(null);
  };

  const closePastaTypeRequiredPopup = () => {
    setShowPastaTypeRequiredPopup(null);
  };

  const closeSauceRequiredPopup = () => {
    setShowSauceRequiredPopup(null);
  };

  const handleSizeRequiredAndOpenSizePopup = (itemId: number) => {
    setShowSizeRequiredPopup(null);
    setShowSizePopup(itemId);
  };

  const handlePastaTypeRequiredAndOpenPastaTypePopup = (itemId: number) => {
    setShowPastaTypeRequiredPopup(null);
    setShowPastaTypePopup(itemId);
  };

  const handleSauceRequiredAndOpenSaucePopup = (itemId: number) => {
    setShowSauceRequiredPopup(null);
    setShowSaucePopup(itemId);
  };

  // Early return if no items
  if (!items || items.length === 0) {
    console.warn(`MenuSection ${title}: No items provided`);
    return (
      <section className="mb-4">
        <div className="mb-3">
          <h2 className="text-xl md:text-xl font-bold text-gray-900 mb-1">
            {title}
          </h2>
          {subTitle && (
            <h3 className="text-sm md:text-xs text-gray-600 mb-1 font-medium">
              {subTitle}
            </h3>
          )}
          {description && (
            <p className="text-sm md:text-xs text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="text-center py-8 text-gray-500">
          Keine Artikel verfügbar
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="mb-4"
    >
      {/* Category header - Desktop compact, mobile same text size */}
      <div className="mb-3">
        <h2 className="text-xl md:text-xl font-bold text-gray-900 mb-1">
          {title}
        </h2>
        {subTitle && (
          <h3 className="text-sm md:text-xs text-gray-600 mb-1 font-medium">
            {subTitle}
          </h3>
        )}
        {description && (
          <p className="text-sm md:text-xs text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Size Required Popup */}
      {showSizeRequiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Größe auswählen
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Bitte wählen Sie zuerst eine Größe für dieses Produkt aus, bevor Sie es zum Warenkorb hinzufügen.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeSizeRequiredPopup}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleSizeRequiredAndOpenSizePopup(showSizeRequiredPopup)}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  Größe wählen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pasta Type Required Popup */}
      {showPastaTypeRequiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Nudelsorte auswählen
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Bitte wählen Sie zuerst eine Nudelsorte für dieses Gericht aus, bevor Sie es zum Warenkorb hinzufügen.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closePastaTypeRequiredPopup}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handlePastaTypeRequiredAndOpenPastaTypePopup(showPastaTypeRequiredPopup)}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  Nudelsorte wählen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sauce Required Popup */}
      {showSauceRequiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {items.find(item => item.id === showSauceRequiredPopup)?.isBeerSelection ? 'Biersorte auswählen' : 'Soße auswählen'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                {items.find(item => item.id === showSauceRequiredPopup)?.isBeerSelection 
                  ? 'Bitte wählen Sie zuerst eine Biersorte für dieses Getränk aus, bevor Sie es zum Warenkorb hinzufügen.'
                  : 'Bitte wählen Sie zuerst eine Soße für dieses Gericht aus, bevor Sie es zum Warenkorb hinzufügen.'
                }
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeSauceRequiredPopup}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleSauceRequiredAndOpenSaucePopup(showSauceRequiredPopup)}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  {items.find(item => item.id === showSauceRequiredPopup)?.isBeerSelection ? 'Biersorte wählen' : 'Soße wählen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Selection Popup */}
      {showSizePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Größe wählen</h3>
                <button
                  onClick={closeSizePopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Wählen Sie Ihre gewünschte Pizza-Größe
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {items.find(item => item.id === showSizePopup)?.sizes?.map((size) => {
                const isSelected = selectedSizes[showSizePopup]?.name === size.name;
                
                return (
                  <label
                    key={size.name}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`size-${showSizePopup}`}
                        checked={isSelected}
                        onChange={() => handleSizeSelect(showSizePopup, size)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="ml-3">
                        <div className="font-bold text-gray-900 text-lg">
                          {size.name}
                        </div>
                        {size.description && (
                          <div className="text-sm text-gray-600">
                            {size.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-blue-600 text-lg">
                      {size.price.toFixed(2).replace('.', ',')}€
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  Gewählte Größe:
                </span>
                <span className="font-bold text-blue-600">
                  {selectedSizes[showSizePopup]?.name || 'Keine ausgewählt'}
                </span>
              </div>
              <button
                onClick={closeSizePopup}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Größe bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pasta Type Selection Popup */}
      {showPastaTypePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Nudelsorte wählen</h3>
                <button
                  onClick={closePastaTypePopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Wählen Sie Ihre gewünschte Nudelsorte
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {pastaTypes.map((pastaType) => {
                const isSelected = selectedPastaTypes[showPastaTypePopup] === pastaType.name;
                
                return (
                  <label
                    key={pastaType.name}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`pasta-type-${showPastaTypePopup}`}
                        checked={isSelected}
                        onChange={() => handlePastaTypeSelect(showPastaTypePopup, pastaType.name)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="ml-3">
                        <div className="font-bold text-gray-900 text-lg">
                          {pastaType.name}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  Gewählte Nudelsorte:
                </span>
                <span className="font-bold text-blue-600">
                  {selectedPastaTypes[showPastaTypePopup] || 'Keine ausgewählt'}
                </span>
              </div>
              <button
                onClick={closePastaTypePopup}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Nudelsorte bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sauce Selection Popup */}
      {showSaucePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Soße wählen</h3>
                <button
                  onClick={closeSaucePopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Wählen Sie Ihre gewünschte Soße
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {(title === 'Salate' ? saladSauceTypes : title === 'Getränke' ? beerTypes : sauceTypes).map((sauce) => {
                const isSelected = selectedSauces[showSaucePopup] === sauce.name;
                
                return (
                  <label
                    key={sauce.name}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`sauce-${showSaucePopup}`}
                        checked={isSelected}
                        onChange={() => handleSauceSelect(showSaucePopup, sauce.name)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 focus:ring-2"
                      />
                      <div className="ml-3">
                        <div className="font-bold text-gray-900 text-lg">
                          {sauce.name}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  Gewählte Soße:
                </span>
                <span className="font-bold text-red-600">
                  {selectedSauces[showSaucePopup] || 'Keine ausgewählt'}
                </span>
              </div>
              <button
                onClick={closeSaucePopup}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {title === 'Getränke' ? 'Biersorte bestätigen' : 'Soße bestätigen'}
              </button>
              
              {/* Add to cart button for beer selection */}
              {title === 'Getränke' && showSaucePopup && selectedSauces[showSaucePopup] && (
                <button
                  onClick={() => {
                    const item = items.find(item => item.id === showSaucePopup);
                    if (item) {
                      handleAddToOrder(item);
                      closeSaucePopup();
                    }
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2"
                >
                  In den Warenkorb
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wunsch Pizza Ingredients Popup */}
      {showIngredientsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Wunsch Pizza Zutaten</h3>
                <button
                  onClick={closeIngredientsPopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Wählen Sie 4 Zutaten für Ihre Wunsch Pizza ({(selectedIngredients[showIngredientsPopup] || []).length}/4)
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {wunschPizzaIngredients.map((ingredient) => {
                const itemIngredients = selectedIngredients[showIngredientsPopup] || [];
                const isSelected = itemIngredients.includes(ingredient.name);
                const isDisabled = ingredient.disabled || (!isSelected && itemIngredients.length >= 4);
                
                return (
                  <label
                    key={ingredient.name}
                    className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 cursor-pointer'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && handleIngredientToggle(showIngredientsPopup, ingredient.name)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                    />
                    <div className="ml-3 flex-1">
                      <div className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {ingredient.name}
                      </div>
                      {ingredient.disabled && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          (nicht verfügbar)
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  Gewählte Zutaten: {(selectedIngredients[showIngredientsPopup] || []).length}/4
                </span>
                <span className="font-bold text-blue-600">
                  {(selectedIngredients[showIngredientsPopup] || []).length === 4 ? '✓ Vollständig' : 'Noch auswählen'}
                </span>
              </div>
              <button
                onClick={closeIngredientsPopup}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Zutaten bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wunsch Pizza Ingredients Popup */}
      {showIngredientsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Wunsch Pizza Zutaten</h3>
                <button
                  onClick={closeIngredientsPopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Wählen Sie 4 Zutaten für Ihre Wunsch Pizza ({(selectedIngredients[showIngredientsPopup] || []).length}/4)
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {wunschPizzaIngredients.map((ingredient) => {
                const itemIngredients = selectedIngredients[showIngredientsPopup] || [];
                const isSelected = itemIngredients.includes(ingredient.name);
                const isDisabled = ingredient.disabled || (!isSelected && itemIngredients.length >= 4);
                
                return (
                  <label
                    key={ingredient.name}
                    className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 cursor-pointer'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && handleIngredientToggle(showIngredientsPopup, ingredient.name)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                    />
                    <div className="ml-3 flex-1">
                      <div className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {ingredient.name}
                      </div>
                      {ingredient.disabled && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          (nicht verfügbar)
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  Gewählte Zutaten: {(selectedIngredients[showIngredientsPopup] || []).length}/4
                </span>
                <span className="font-bold text-blue-600">
                  {(selectedIngredients[showIngredientsPopup] || []).length === 4 ? '✓ Vollständig' : 'Noch auswählen'}
                </span>
              </div>
              <button
                onClick={closeIngredientsPopup}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Zutaten bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pizza Extras Popup */}
      {showExtrasPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Pizza Extras wählen</h3>
                <button
                  onClick={closeExtrasPopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Wählen Sie beliebige Extras für Ihre Pizza (je +1,50€)
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {pizzaExtras.map((extra) => {
                const itemExtras = selectedExtras[showExtrasPopup] || [];
                const isSelected = itemExtras.includes(extra.name);
                
                return (
                  <label
                    key={extra.name}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleExtraToggle(showExtrasPopup, extra.name)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">{extra.name}</div>
                      <div className="text-sm text-gray-600">
                        +{extra.price.toFixed(2).replace('.', ',')}€
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  Gewählte Extras: {(selectedExtras[showExtrasPopup] || []).length}
                </span>
                <span className="font-bold text-green-600">
                  +{((selectedExtras[showExtrasPopup] || []).length * 1.50).toFixed(2).replace('.', ',')}€
                </span>
              </div>
              <button
                onClick={closeExtrasPopup}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Extras bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu items container - Always show items, animation is optional */}
      <div className="space-y-2 md:space-y-2">
        {items.map((item, index) => {
          const hasSizes = item.sizes && item.sizes.length > 0;
          const selectedSize = selectedSizes[item.id];
          const displayPrice = getDisplayPrice(item);
          const itemIngredients = selectedIngredients[item.id] || [];
          const itemExtras = selectedExtras[item.id] || [];
          const selectedPastaType = selectedPastaTypes[item.id];
          const selectedSauce = selectedSauces[item.id];
          const isWunschPizza = item.isWunschPizza;
          const isPizza = item.isPizza || item.isWunschPizza;
          const isPasta = item.isPasta;
          const isSpezialitaet = item.isSpezialitaet;
          const canAdd = canAddToCart(item);
          const buttonTooltip = getAddButtonTooltip(item);
          const isBeerSelection = item.isBeerSelection;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group transform ${
                inView ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0'
              }`}
              style={{
                animationDelay: inView ? `${index * 50}ms` : '0ms',
                transitionDelay: inView ? `${index * 50}ms` : '0ms'
              }}
            >
              {/* Mobile smaller padding, desktop same */}
              <div className="p-2.5 md:p-3 flex items-start justify-between gap-2.5 md:gap-3 relative">
                {/* Subtle background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Left side - Item info - Mobile smaller gaps */}
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-start gap-2.5 md:gap-3 mb-1.5 md:mb-2">
                    {/* Mobile smaller number badge */}
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <span className="text-white font-bold text-sm tracking-tight">
                        {item.number}
                      </span>
                    </div>
                    
                    <div className="flex-1 pt-0.5">
                      {/* Mobile same text size, desktop smaller */}
                      <h3 className="font-bold text-gray-900 text-base md:text-base leading-tight mb-1 group-hover:text-orange-700 transition-colors duration-300">
                        {item.name}
                      </h3>
                      
                      {/* Mobile same allergen badge size */}
                      {item.allergens && (
                        <span className="inline-flex items-center text-xs font-medium text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full mb-1.5 md:mb-2 group-hover:bg-orange-200 transition-colors duration-300">
                          <span className="w-1 h-1 bg-orange-500 rounded-full mr-1.5"></span>
                          {item.allergens}
                        </span>
                      )}
                      
                      {/* Mobile same description text size */}
                      {item.description && (
                        <p className="text-sm md:text-xs text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 max-w-lg">
                          {item.description}
                        </p>
                      )}

                      {/* Show selected pasta type */}
                      {isPasta && selectedPastaType && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">
                            Gewählte Nudelsorte:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {selectedPastaType}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPastaTypes(prev => ({
                                    ...prev,
                                    [item.id]: ''
                                  }));
                                }}
                                className="ml-1 text-blue-500 hover:text-blue-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Show selected sauce for Spezialitäten */}
                      {(isSpezialitaet || isBeerSelection) && selectedSauce && (
                        <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200">
                          <div className="text-xs font-medium text-red-700 mb-1">
                            {isBeerSelection ? 'Gewählte Biersorte:' : 'Gewählte Soße:'}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              {selectedSauce}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSauces(prev => ({
                                    ...prev,
                                    [item.id]: ''
                                  }));
                                }}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Show selected ingredients for Wunsch Pizza */}
                      {isWunschPizza && itemIngredients.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">
                            Gewählte Zutaten ({itemIngredients.length}/4):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {itemIngredients.map((ingredient, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                              >
                                {ingredient}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIngredientToggle(item.id, ingredient);
                                  }}
                                  className="ml-1 text-blue-500 hover:text-blue-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show selected extras for all pizzas */}
                      {isPizza && itemExtras.length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                          <div className="text-xs font-medium text-green-700 mb-1">
                            Gewählte Extras (+{itemExtras.length * 1.50}€):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {itemExtras.map((extra, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                              >
                                {extra} (+1.50€)
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExtraToggle(item.id, extra);
                                  }}
                                  className="ml-1 text-green-500 hover:text-green-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Price and controls - Mobile smaller gaps */}
                <div className="flex flex-col items-center gap-1.5 md:gap-2 flex-shrink-0 relative z-10">
                  {/* Wunsch Pizza: All 3 buttons on same line, centered */}
                  {isWunschPizza ? (
                    <div className="flex items-center justify-center gap-1 md:gap-1.5">
                      {/* Size selector button */}
                      {hasSizes && (
                        <button
                          type="button"
                          onClick={() => openSizePopup(item.id)}
                          className="flex items-center gap-1 px-1.5 md:px-2 py-1 md:py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-md transition-all duration-300 text-xs font-medium text-blue-700"
                        >
                          <span>Größe</span>
                          {selectedSize && (
                            <span className="bg-blue-200 text-blue-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      )}

                      {/* Ingredients selector button */}
                      <button
                        type="button"
                        onClick={() => openIngredientsPopup(item.id)}
                        className="flex items-center gap-1 px-1.5 md:px-2 py-1 md:py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 rounded-md transition-all duration-300 text-xs font-medium text-green-700"
                      >
                        <span>Zutaten</span>
                        {itemIngredients.length > 0 && (
                          <span className="bg-green-200 text-green-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {itemIngredients.length}
                          </span>
                        )}
                      </button>

                      {/* Extras selector button */}
                      <button
                        type="button"
                        onClick={() => openExtrasPopup(item.id)}
                        className="flex items-center gap-1 px-1.5 md:px-2 py-1 md:py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-md transition-all duration-300 text-xs font-medium text-purple-700"
                      >
                        <span>Extras</span>
                        {itemExtras.length > 0 && (
                          <span className="bg-purple-200 text-purple-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {itemExtras.length}
                          </span>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Regular item button order */
                    <div className="flex items-center gap-1 md:gap-1.5">
                      {/* Size selector button */}
                      {hasSizes && (
                        <button
                          type="button"
                          onClick={() => openSizePopup(item.id)}
                          className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-md transition-all duration-300 text-xs font-medium text-blue-700"
                        >
                          <span>Größe</span>
                          {selectedSize && (
                            <span className="bg-blue-200 text-blue-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      )}

                      {/* Pasta type selector button for pasta items */}
                      {isPasta && (
                        <button
                          type="button"
                          onClick={() => openPastaTypePopup(item.id)}
                          className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-300 rounded-md transition-all duration-300 text-xs font-medium text-yellow-700"
                        >
                          <span>Nudeln</span>
                          {selectedPastaType &&  (
                            <span className="bg-yellow-200 text-yellow-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      )}

                      {/* Sauce selector button for Spezialitäten */}
                      {(isSpezialitaet || isBeerSelection) && (
                        <button
                          type="button"
                          onClick={() => openSaucePopup(item.id)}
                          className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-md transition-all duration-300 text-xs font-medium text-red-700"
                        >
                          <span>{isBeerSelection ? 'Bier' : 'Soße'}</span>
                          {selectedSauce && (
                            <span className="bg-red-200 text-red-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      )}

                      {/* Pizza extras selector button for regular pizzas */}
                      {isPizza && (
                        <button
                          type="button"
                          onClick={() => openExtrasPopup(item.id)}
                          className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-md transition-all duration-300 text-xs font-medium text-purple-700"
                        >
                          <span>Extras</span>
                          {itemExtras.length > 0 && (
                            <span className="bg-purple-200 text-purple-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              {itemExtras.length}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Mobile smaller price display box */}
                  <div className="text-right">
                    <div className="bg-gray-50 rounded-md px-2.5 md:px-3 py-1 md:py-1.5 group-hover:bg-orange-50 transition-colors duration-300 border border-gray-200 group-hover:border-orange-200">
                      <span className="font-bold text-gray-900 text-base group-hover:text-orange-700 transition-colors duration-300">
                        {displayPrice.toFixed(2).replace('.', ',')} €
                      </span>
                      {selectedSize && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {selectedSize.name} {selectedSize.description && `(${selectedSize.description})`}
                        </div>
                      )}
                      {selectedPastaType && (
                        <div className="text-xs text-yellow-600 mt-0.5">
                          {selectedPastaType}
                        </div>
                      )}
                      {selectedSauce && (
                        <div className="text-xs text-red-600 mt-0.5">
                          {selectedSauce}
                        </div>
                      )}
                      {itemExtras.length > 0 && (
                        <div className="text-xs text-green-600 mt-0.5">
                          +{itemExtras.length} Extra{itemExtras.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile smaller add button */}
                  <button
                    type="button"
                    onClick={() => handleAddToOrder(item)}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-md md:rounded-lg text-white transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 group-hover:rotate-3 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700`}
                    title={buttonTooltip}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Thinner bottom accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MenuSection;