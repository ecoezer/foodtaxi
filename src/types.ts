export interface MenuItem {
  id: number;
  number: number;
  name: string;
  description?: string;
  price: number;
  allergens?: string;
  sizes?: PizzaSize[];
  isWunschPizza?: boolean;
  isPizza?: boolean;
  isPasta?: boolean;
  isSpezialitaet?: boolean;
  isBeerSelection?: boolean;
}

export interface PizzaSize {
  name: string;
  price: number;
  description?: string;
}

export interface PizzaExtra {
  name: string;
  price: number;
}

export interface PastaType {
  name: string;
}

export interface SauceType {
  name: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
  selectedExtras?: string[];
  selectedPastaType?: string;
  selectedSauce?: string;
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