import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { MenuItem, PizzaSize } from '../types';

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
  selectedExtras?: string[];
  selectedPastaType?: string;
}

interface CartState {
  items: OrderItem[];
  addItem: (menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string) => void;
  removeItem: (id: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string) => void;
  updateQuantity: (id: number, quantity: number, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string) => void;
}

// Helper function to create a unique key for cart items
const getItemKey = (menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string) => {
  const sizeKey = selectedSize ? selectedSize.name : 'default';
  const ingredientsKey = selectedIngredients && selectedIngredients.length > 0 
    ? selectedIngredients.sort().join(',') 
    : 'none';
  const extrasKey = selectedExtras && selectedExtras.length > 0
    ? selectedExtras.sort().join(',')
    : 'none';
  const pastaTypeKey = selectedPastaType || 'none';
  return `${menuItem.id}-${sizeKey}-${ingredientsKey}-${extrasKey}-${pastaTypeKey}`;
};

// Helper function to find item in cart
const findItemIndex = (items: OrderItem[], menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[], selectedExtras?: string[], selectedPastaType?: string) => {
  return items.findIndex(item => {
    const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType);
    const searchKey = getItemKey(menuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType);
    return itemKey === searchKey;
  });
};

export const useCartStore = create<CartState>()(
  persist(
    set => ({
      items: [],

      addItem: (menuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType) =>
        set(state => {
          const currentItems = [...state.items];
          const existingItemIndex = findItemIndex(currentItems, menuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType);

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
            
            currentItems.push({ 
              menuItem: itemToAdd, 
              quantity: 1,
              selectedSize,
              selectedIngredients: selectedIngredients || [],
              selectedExtras: selectedExtras || [],
              selectedPastaType
            });
          }

          return { items: currentItems };
        }),

      removeItem: (id, selectedSize, selectedIngredients, selectedExtras, selectedPastaType) =>
        set(state => ({
          items: state.items.filter(item => {
            const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType);
            const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType);
            return itemKey !== searchKey;
          })
        })),

      updateQuantity: (id, quantity, selectedSize, selectedIngredients, selectedExtras, selectedPastaType) =>
        set(state => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(item => {
                const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType);
                const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType);
                return itemKey !== searchKey;
              })
            };
          }

          return {
            items: state.items.map(item => {
              const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients, item.selectedExtras, item.selectedPastaType);
              const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients, selectedExtras, selectedPastaType);
              return itemKey === searchKey ? { ...item, quantity } : item;
            })
          };
        }),

      resetStore: () => set({ items: [] })
    }),
    { name: 'cart-storage' }
  )
);