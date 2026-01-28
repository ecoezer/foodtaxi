import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { MenuItem, PizzaSize, PizzaStyle, FriesOption } from '../types';

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: PizzaSize;
  selectedFriesOption?: FriesOption;
  selectedIngredients?: string[];
  selectedExtras?: string[];
  selectedPastaType?: string;
  selectedSauce?: string;
  selectedPizzaStyle?: PizzaStyle;
}

interface CartState {
  items: OrderItem[];
  addItem: (menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string, selectedPizzaStyle?: PizzaStyle, selectedFriesOption?: FriesOption) => void;
  removeItem: (id: number, selectedSize?: PizzaSize, selectedFriesOption?: FriesOption, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string, selectedPizzaStyle?: PizzaStyle) => void;
  updateQuantity: (id: number, quantity: number, selectedSize?: PizzaSize, selectedFriesOption?: FriesOption, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string, selectedPizzaStyle?: PizzaStyle) => void;
  clearCart: () => void;
}

// Helper function to create a unique key for cart items
const getItemKey = (menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string, selectedPizzaStyle?: PizzaStyle, selectedFriesOption?: FriesOption) => {
  const sizeKey = selectedSize ? selectedSize.name : 'default';
  const friesKey = selectedFriesOption ? selectedFriesOption.name : 'none';
  const ingredientsKey = selectedIngredients && selectedIngredients.length > 0
    ? selectedIngredients.sort().join(',')
    : 'none';
  const extrasKey = selectedExtras && selectedExtras.length > 0
    ? selectedExtras.sort().join(',')
    : 'none';
  const pastaTypeKey = selectedPastaType || 'none';
  const sauceKey = selectedSauce || 'none';
  const styleKey = selectedPizzaStyle ? selectedPizzaStyle.name : 'none';
  return `${menuItem.id}-${sizeKey}-${friesKey}-${ingredientsKey}-${extrasKey}-${pastaTypeKey}-${sauceKey}-${styleKey}`;
};

// Helper function to find item in cart
const findItemIndex = (items: OrderItem[], menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string, selectedSauce?: string, selectedPizzaStyle?: PizzaStyle, selectedFriesOption?: FriesOption) => {
  return items.findIndex(item => {
    const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType, item.selectedSauce, item.selectedPizzaStyle, item.selectedFriesOption);
    const searchKey = getItemKey(menuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle, selectedFriesOption);
    return itemKey === searchKey;
  });
};

export const useCartStore = create<CartState>()(
  persist(
    set => ({
      items: [],

      addItem: (menuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle, selectedFriesOption) =>
        set(state => {
          const currentItems = [...state.items];
          const existingItemIndex = findItemIndex(currentItems, menuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle, selectedFriesOption);

          if (existingItemIndex >= 0) {
            currentItems[existingItemIndex] = {
              ...currentItems[existingItemIndex],
              quantity: currentItems[existingItemIndex].quantity + 1
            };
          } else {
            // Create new item with selected size price if applicable
            const itemToAdd = { ...menuItem };
            if (selectedSize) {
              itemToAdd.price = selectedSize.price;
            }

            // Add extras cost (each extra is €1.50)
            if (selectedExtras && selectedExtras.length > 0) {
              itemToAdd.price += selectedExtras.length * 1.50;
            }

            // Add pizza style cost
            if (selectedPizzaStyle && selectedPizzaStyle.price > 0) {
              itemToAdd.price += selectedPizzaStyle.price;
            }

            // Add fries option cost
            if (selectedFriesOption && selectedFriesOption.price > 0) {
              itemToAdd.price += selectedFriesOption.price;
            }

            currentItems.push({
              menuItem: itemToAdd,
              quantity: 1,
              selectedSize,
              selectedFriesOption,
              selectedIngredients: selectedIngredients || [],
              selectedExtras: selectedExtras || [],
              selectedPastaType,
              selectedSauce,
              selectedPizzaStyle
            });
          }

          return { items: currentItems };
        }),

      removeItem: (id, selectedSize, selectedFriesOption, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle) =>
        set(state => ({
          items: state.items.filter(item => {
            const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType, item.selectedSauce, item.selectedPizzaStyle, item.selectedFriesOption);
            const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle, selectedFriesOption);
            return itemKey !== searchKey;
          })
        })),

      updateQuantity: (id, quantity, selectedSize, selectedFriesOption, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle) =>
        set(state => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(item => {
                const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType, item.selectedSauce, item.selectedPizzaStyle, item.selectedFriesOption);
                const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle, selectedFriesOption);
                return itemKey !== searchKey;
              })
            };
          }

          return {
            items: state.items.map(item => {
              const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType, item.selectedSauce, item.selectedPizzaStyle, item.selectedFriesOption);
              const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType, selectedSauce, selectedPizzaStyle, selectedFriesOption);
              return itemKey === searchKey ? { ...item, quantity } : item;
            })
          };
        }),

      clearCart: () => set({ items: [] }),
      
      resetStore: () => set({ items: [] })
    }),
    { name: 'cart-storage' }
  )
);