export interface MenuItem {
  id: number;
  number: number;
  name: string;
  description?: string;
  price: number;
  allergens?: string;
  sizes?: PizzaSize[];
  isWunschPizza?: boolean;
}

export interface PizzaSize {
  name: string;
  price: number;
  description?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
}

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  note?: string;
}

export interface WunschPizzaIngredient {
  name: string;
  disabled?: boolean;
}