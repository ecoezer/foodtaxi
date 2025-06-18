import React, { useState } from 'react';
import { MenuItem, PizzaSize } from '../types';
import { useInView } from 'react-intersection-observer';
import { Plus, ChevronDown, ChevronUp, X } from 'lucide-react';
import { wunschPizzaIngredients, pizzaExtras } from '../data/menuItems';

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  description?: string;
  subTitle?: string;
  bgColor: string;
  onAddToOrder: (item: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[]) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  items,
  description,
  subTitle,
  bgColor,
  onAddToOrder
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px 0px' // Add margin to trigger earlier
  });

  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Record<number, PizzaSize>>({});
  const [selectedIngredients, setSelectedIngredients] = useState<Record<number, string[]>>({});
  const [selectedExtras, setSelectedExtras] = useState<Record<number, string[]>>({});

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleSizeSelect = (itemId: number, size: PizzaSize) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
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
    onAddToOrder(item, selectedSize, ingredients, extras);
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

  return (
    <section
      ref={ref}
      className={`mb-4 transform transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
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

      {/* Menu items container - Mobile smaller spacing */}
      <div className="space-y-2 md:space-y-2">
        {items.map((item, index) => {
          const isExpanded = expandedItems.has(item.id);
          const hasSizes = item.sizes && item.sizes.length > 0;
          const selectedSize = selectedSizes[item.id];
          const displayPrice = getDisplayPrice(item);
          const itemIngredients = selectedIngredients[item.id] || [];
          const itemExtras = selectedExtras[item.id] || [];
          const isWunschPizza = item.isWunschPizza;
          const isPizza = item.isPizza || item.isWunschPizza;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group ${
                inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-20px]'
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

                  {/* Size selection - 25% smaller boxes */}
                  {hasSizes && isExpanded && (
                    <div className="mt-2.5 md:mt-3 pt-2.5 md:pt-3 border-t border-gray-100">
                      <div className="w-full flex justify-center">
                        <div className="w-full max-w-xs mx-auto">
                          <div className="grid grid-cols-2 gap-1.5 w-full">
                            {item.sizes!.map((size) => {
                              const isSelected = selectedSize?.name === size.name;
                              return (
                                <button
                                  key={size.name}
                                  type="button"
                                  onClick={() => handleSizeSelect(item.id, size)}
                                  className={`w-full p-1.5 rounded-md border-2 transition-all duration-300 text-center ${
                                    isSelected
                                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm transform scale-105'
                                      : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:transform hover:scale-105'
                                  }`}
                                >
                                  <div className="font-bold text-xs mb-0.5">{size.name}</div>
                                  {size.description && (
                                    <div className="text-xs text-gray-500 mb-0.5">{size.description}</div>
                                  )}
                                  <div className="font-bold text-xs">
                                    {size.price.toFixed(2).replace('.', ',')} €
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wunsch Pizza ingredient selection */}
                  {isWunschPizza && isExpanded && (
                    <div className="mt-2.5 md:mt-3 pt-2.5 md:pt-3 border-t border-gray-100">
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Wählen Sie 4 Zutaten ({itemIngredients.length}/4):
                        </div>
                        <div className="text-xs text-gray-500">
                          Klicken Sie auf die gewünschten Zutaten
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                        {wunschPizzaIngredients.map((ingredient) => {
                          const isSelected = itemIngredients.includes(ingredient.name);
                          const isDisabled = ingredient.disabled || (!isSelected && itemIngredients.length >= 4);
                          
                          return (
                            <button
                              key={ingredient.name}
                              type="button"
                              onClick={() => !isDisabled && handleIngredientToggle(item.id, ingredient.name)}
                              disabled={isDisabled}
                              className={`p-2 text-xs rounded-md border transition-all duration-200 text-left ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                  : isDisabled
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700 cursor-pointer'
                              }`}
                            >
                              {ingredient.name}
                              {ingredient.disabled && (
                                <span className="block text-xs text-gray-400 mt-0.5">
                                  (nicht verfügbar)
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pizza extras selection for all pizzas */}
                  {isPizza && isExpanded && (
                    <div className="mt-2.5 md:mt-3 pt-2.5 md:pt-3 border-t border-gray-100">
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Extras hinzufügen (je +1,50€):
                        </div>
                        <div className="text-xs text-gray-500">
                          Wählen Sie beliebige Extras für Ihre Pizza
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                        {pizzaExtras.map((extra) => {
                          const isSelected = itemExtras.includes(extra.name);
                          
                          return (
                            <button
                              key={extra.name}
                              type="button"
                              onClick={() => handleExtraToggle(item.id, extra.name)}
                              className={`p-2 text-xs rounded-md border transition-all duration-200 text-left ${
                                isSelected
                                  ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                                  : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 text-gray-700 cursor-pointer'
                              }`}
                            >
                              <div>{extra.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                +{extra.price.toFixed(2).replace('.', ',')}€
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side - Price and controls - Mobile smaller gaps */}
                <div className="flex flex-col items-end gap-1.5 md:gap-2 flex-shrink-0 relative z-10">
                  {/* Mobile smaller size selector button */}
                  {hasSizes && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-md transition-all duration-300 text-xs font-medium text-blue-700"
                    >
                      <span>Größe</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {/* Wunsch Pizza ingredient selector button */}
                  {isWunschPizza && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 rounded-md transition-all duration-300 text-xs font-medium text-green-700"
                    >
                      <span>Zutaten</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {/* Pizza extras selector button for all pizzas */}
                  {isPizza && !isWunschPizza && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-md transition-all duration-300 text-xs font-medium text-purple-700"
                    >
                      <span>Extras</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
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
                    disabled={isWunschPizza && itemIngredients.length === 0}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-md md:rounded-lg text-white transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 group-hover:rotate-3 ${
                      isWunschPizza && itemIngredients.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    }`}
                    title={
                      isWunschPizza && itemIngredients.length === 0
                        ? 'Bitte wählen Sie mindestens eine Zutat'
                        : 'Zum Warenkorb hinzufügen'
                    }
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