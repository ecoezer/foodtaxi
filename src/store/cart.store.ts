import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { MenuItem, PizzaSize } from '../types';

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
}

interface CartState {
  items: OrderItem[];
  addItem: (menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[]) => void;
  removeItem: (id: number, selectedSize?: PizzaSize, selectedIngredients?: string[]) => void;
  updateQuantity: (id: number, quantity: number, selectedSize?: PizzaSize, selectedIngredients?: string[]) => void;
}

// Helper function to create a unique key for cart items
const getItemKey = (menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[]) => {
  const sizeKey = selectedSize ? selectedSize.name : 'default';
  const ingredientsKey = selectedIngredients && selectedIngredients.length > 0 
    ? selectedIngredients.sort().join(',') 
    : 'none';
  return `${menuItem.id}-${sizeKey}-${ingredientsKey}`;
};

// Helper function to find item in cart
const findItemIndex = (items: OrderItem[], menuItem: MenuItem, selectedSize?: PizzaSize, selectedIngredients?: string[]) => {
  return items.findIndex(item => {
    const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients);
    const searchKey = getItemKey(menuItem, selectedSize, selectedIngredients);
    return itemKey === searchKey;
  });
};

export const useCartStore = create<CartState>()(
  persist(
    set => ({
      items: [],

      addItem: (menuItem, selectedSize, selectedIngredients) =>
        set(state => {
          const currentItems = [...state.items];
          const existingItemIndex = findItemIndex(currentItems, menuItem, selectedSize, selectedIngredients);

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
            
            currentItems.push({ 
              menuItem: itemToAdd, 
              quantity: 1,
              selectedSize,
              selectedIngredients: selectedIngredients || []
            });
          }

          return { items: currentItems };
        }),

      removeItem: (id, selectedSize, selectedIngredients) =>
        set(state => ({
          items: state.items.filter(item => {
            const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients);
            const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients);
            return itemKey !== searchKey;
          })
        })),

      updateQuantity: (id, quantity, selectedSize, selectedIngredients) =>
        set(state => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(item => {
                const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients);
                const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients);
                return itemKey !== searchKey;
              })
            };
          }

          return {
            items: state.items.map(item => {
              const itemKey = getItemKey(item.menuItem, item.selectedSize, item.selectedIngredients);
              const searchKey = getItemKey({ id } as MenuItem, selectedSize, selectedIngredients);
              return itemKey === searchKey ? { ...item, quantity } : item;
            })
          };
        }),

      resetStore: () => set({ items: [] })
    }),
    { name: 'cart-storage' }
  )
);