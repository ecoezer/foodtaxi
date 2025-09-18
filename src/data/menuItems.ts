import { MenuItem, WunschPizzaIngredient, PizzaExtra, PastaType, SauceType } from '../types';

// Helper functions to check current day for special offers
const isRippchen = () => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return today === 3; // Wednesday
};

const isSchnitzelTag = () => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return today === 4; // Thursday
};

// Pizza sizes configuration with new structure
const pizzaSizes = [
  { name: 'Medium', price: 8.90, description: 'Ø ca. 26 cm' },
  { name: 'Large', price: 9.90, description: 'Ø ca. 30 cm' },
  { name: 'Family', price: 17.90, description: 'Ø ca. 40 cm' },
  { name: 'Mega', price: 26.90, description: 'Ø ca. 50 cm' }
];

// Pasta types for pasta dishes
export const pastaTypes: PastaType[] = [
  { name: 'Spaghetti' },
  { name: 'Maccheroni' }
];

// Sauce types for Spezialitäten
export const sauceTypes: SauceType[] = [
  { name: 'Tzatziki' },
  { name: 'ohne Soße' }
];

// Sauce types for Salads
export const saladSauceTypes: SauceType[] = [
  { name: 'Joghurt' },
  { name: 'French' },
  { name: 'Essig/Öl' }
];

// Beer types for beer selection
export const beerTypes: SauceType[] = [
  { name: 'Becks' },
  { name: 'Herrenhäuser' }
];

// Wunsch Pizza ingredients - Updated with new items and removed "Ei", Rindersalami now available
export const wunschPizzaIngredients: WunschPizzaIngredient[] = [
  { name: 'Ananas' },
  { name: 'Artischocken' },
  { name: 'Barbecuesauce' },
  { name: 'Brokkoli' },
  { name: 'Champignons frisch' },
  { name: 'Chili-Cheese-Soße' },
  { name: 'Edamer' },
  { name: 'Formfleisch-Vorderschinken' },
  { name: 'Gewürzgurken' },
  { name: 'Gorgonzola' },
  { name: 'Gyros' },
  { name: 'Hirtenkäse' },
  { name: 'Hähnchenbrust' },
  { name: 'Jalapeños' },
  { name: 'Knoblauchwurst' },
  { name: 'Mais' },
  { name: 'Milde Peperoni' },
  { name: 'Mozzarella' },
  { name: 'Oliven' },
  { name: 'Paprika' },
  { name: 'Parmaschinken' },
  { name: 'Peperoni, scharf' },
  { name: 'Remoulade' },
  { name: 'Rindermett' },
  { name: 'Rindersalami' },
  { name: 'Rucola' },
  { name: 'Röstzwiebeln' },
  { name: 'Sauce Hollandaise' },
  { name: 'Spiegelei' },
  { name: 'Spinat' },
  { name: 'Tomaten' },
  { name: 'Würstchen' },
  { name: 'Zwiebeln' },
  { name: 'ohne Zutat' }
];

// Pizza extras for all pizzas (each extra costs +€1.50) - Updated to match Wunsch Pizza ingredients
export const pizzaExtras: PizzaExtra[] = [
  { name: 'Ananas', price: 1.50 },
  { name: 'Artischocken', price: 1.50 },
  { name: 'Barbecuesauce', price: 1.50 },
  { name: 'Brokkoli', price: 1.50 },
  { name: 'Champignons frisch', price: 1.50 },
  { name: 'Chili-Cheese-Soße', price: 1.50 },
  { name: 'Edamer', price: 1.50 },
  { name: 'Formfleisch-Vorderschinken', price: 1.50 },
  { name: 'Gewürzgurken', price: 1.50 },
  { name: 'Gorgonzola', price: 1.50 },
  { name: 'Gyros', price: 1.50 },
  { name: 'Hirtenkäse', price: 1.50 },
  { name: 'Hähnchenbrust', price: 1.50 },
  { name: 'Jalapeños', price: 1.50 },
  { name: 'Knoblauchwurst', price: 1.50 },
  { name: 'Mais', price: 1.50 },
  { name: 'Milde Peperoni', price: 1.50 },
  { name: 'Mozzarella', price: 1.50 },
  { name: 'Oliven', price: 1.50 },
  { name: 'Paprika', price: 1.50 },
  { name: 'Parmaschinken', price: 1.50 },
  { name: 'Peperoni, scharf', price: 1.50 },
  { name: 'Remoulade', price: 1.50 },
  { name: 'Rindermett', price: 1.50 },
  { name: 'Rindersalami', price: 1.50 },
  { name: 'Rucola', price: 1.50 },
  { name: 'Röstzwiebeln', price: 1.50 },
  { name: 'Sauce Hollandaise', price: 1.50 },
  { name: 'Spiegelei', price: 1.50 },
  { name: 'Spinat', price: 1.50 },
  { name: 'Tomaten', price: 1.50 },
  { name: 'Würstchen', price: 1.50 },
  { name: 'Zwiebeln', price: 1.50 }
];

// Helper function to create drink sizes for soft drinks
const createDrinkSizes = (smallPrice: number, largePrice: number = 3.60) => [
  { name: '0,33 L', price: smallPrice, description: 'Klein' },
  { name: '1,0 L', price: largePrice, description: 'Groß' }
];

// Helper function to create burger patty sizes
const createBurgerSizes = (basePrice: number) => [
  { name: '125g', price: basePrice, description: 'Standard Patty' },
  { name: '250g', price: basePrice + 2.00, description: 'Doppel Patty (+2€)' }
];

// Spezialitäten (Updated with sauce selection requirement)
export const donerDishes: MenuItem[] = [
  {
    id: 80,
    number: 80,
    name: "Gyros Teller",
    description: "mit Krautsalat, dazu Pommes",
    price: 13.00,
    allergens: "1,2,3,4/A,C,F,G",
    isSpezialitaet: true
  },
  {
    id: 81,
    number: 81,
    name: "Gyros Hollandaise",
    description: "in Sauce Hollandaise mit Käse überbacken",
    price: 14.00,
    allergens: "1,2,3,4/A,C,F,G",
    isSpezialitaet: true
  },
  {
    id: 82,
    number: 82,
    name: "Gyros Topf",
    description: "mit fr. Champignons in Sauce Hollandaise mit Käse überbacken",
    price: 14.00,
    allergens: "1,2,3,4/A,C,F,G",
    isSpezialitaet: true
  },
  {
    id: 83,
    number: 83,
    name: "Gyros Box",
    description: "mit Gyros, Pommes und Salat",
    price: 7.90,
    allergens: "1,2,3,4/A,C,F,G",
    isSpezialitaet: true
  },
  {
    id: 84,
    number: 84,
    name: isRippchen() ? "🍖 Spareribs (Rippchen 450g) - RIPPCHEN-TAG!" : "Spareribs (Rippchen 450g)",
    description: isRippchen() 
      ? "mit BBQ Sauce, Pommes und Krautsalat - MITTWOCH SPEZIAL!" 
      : "mit BBQ Sauce, Pommes und Krautsalat",
    price: isRippchen() ? 13.00 : 14.90,
    allergens: "1,2,3,4/A,C,F,G"
  },
  {
    id: 85,
    number: 85,
    name: "Currywurst",
    description: "mit Curry Sauce und Pommes",
    price: 9.90,
    allergens: "1,2,3,4/A,C,F"
  }
];

// Pasta & Al Forno (Updated with pasta type selection requirement)
export const pasta: MenuItem[] = [
  // Regular Pasta
  {
    id: 534,
    number: 50,
    name: "Pasta Schinken-Sahnesauce",
    description: "Pasta Schinken-Sahnesauce",
    price: 12.00,
    isPasta: true
  },
  {
    id: 535,
    number: 51,
    name: "Pasta Carbonara",
    description: "in Schinken-Sahnesauce mit Eigelb",
    price: 12.00,
    isPasta: true
  },
  {
    id: 536,
    number: 52,
    name: "Pasta Spinat",
    description: "in Gorgonzolasauce",
    price: 12.00,
    isPasta: true
  },
  {
    id: 537,
    number: 53,
    name: "Pasta Hähnchen-Brust",
    description: "in Sahnesauce, Milde Peperoni und Zwiebeln",
    price: 13.00,
    isPasta: true
  },
  // Al Forno
  {
    id: 538,
    number: 54,
    name: "Al Quattro Formaggi",
    description: "mit Vier Käsesorten, Sahnesauce und Nudelsorte nach Wahl",
    price: 13.00,
    isPasta: true
  },
  {
    id: 539,
    number: 55,
    name: "Maccheroni Gyros",
    description: "in Sauce Hollandaise",
    price: 13.00,
    isPasta: true
  },
  {
    id: 540,
    number: 56,
    name: "Kartoffel-Gemüse Auflauf",
    description: "mit Broccoli, fr.Paprika und Mais in Sahnesauce",
    price: 13.00
  },
  {
    id: 541,
    number: 57,
    name: "Kartoffel-Hähnchen-Brust Auflauf",
    description: "mit Broccoli und Mais in Sahnesauce",
    price: 14.00
  },
  {
    id: 542,
    number: 58,
    name: "Lasagne Gemüse",
    description: "in Sahnesauce und Tomatensauce",
    price: 13.00
  },
  {
    id: 543,
    number: 59,
    name: "Lasagne Rind",
    description: "in Sahnesauce und Tomatensauce",
    price: 14.00
  },
  // Spätzle
  {
    id: 544,
    number: 60,
    name: "Spätzle Quattro Formaggi",
    description: "mit Vier Käsesorten in Sahnesauce",
    price: 14.00
  },
  {
    id: 545,
    number: 61,
    name: "Spätzle Hähnchen",
    description: "mit Hirtenkäse in Sahnesauce",
    price: 14.00
  }
];

// Schnitzel (New section)
export const schnitzel: MenuItem[] = [
  {
    id: 546,
    number: 70,
    name: "Schnitzel Wiener Art",
    description: isSchnitzelTag() 
      ? "mit Zitronenscheiben und Preiselbeeren - DONNERSTAG SPEZIAL!" 
      : "mit Zitronenscheiben und Preiselbeeren",
    price: 11.00
  },
  {
    id: 547,
    number: 71,
    name: isSchnitzelTag() ? "🍖 Schnitzel Jäger Art - SCHNITZEL-TAG!" : "Schnitzel Jäger Art",
    description: isSchnitzelTag() 
      ? "mit Jägersauce - DONNERSTAG SPEZIAL!" 
      : "mit Jägersauce",
    price: isSchnitzelTag() ? 11.00 : 12.90
  },
  {
    id: 548,
    number: 72,
    name: isSchnitzelTag() ? "🍖 Hollandaiseschnitzel - SCHNITZEL-TAG!" : "Hollandaiseschnitzel",
    description: isSchnitzelTag() 
      ? "in Sauce Hollandaise - DONNERSTAG SPEZIAL!" 
      : "in Sauce Hollandaise",
    price: isSchnitzelTag() ? 11.00 : 12.90
  }
];

// Finger Food (New section)
export const fingerFood: MenuItem[] = [
  {
    id: 550,
    number: "F1",
    name: "Mozzarella Stick",
    description: "6 Stk.",
    price: 5.90
  },
  {
    id: 551,
    number: "F2",
    name: "Chicken Nuggets",
    description: "8 Stk.",
    price: 6.00
  },
  {
    id: 552,
    number: "F3",
    name: "Crispy Chicken Fingers",
    description: "6 Stk.",
    price: 8.90
  },
  {
    id: 553,
    number: "F4",
    name: "Chili Cheese Nuggets",
    description: "8 Stk.",
    price: 5.90
  },
  {
    id: 554,
    number: "F5",
    name: "Pommes Frites",
    description: "",
    price: 4.00
  },
  {
    id: 555,
    number: "F6",
    name: "Twister Pommes",
    description: "",
    price: 4.50
  },
  {
    id: 556,
    number: "F7",
    name: "Wedges",
    description: "",
    price: 4.50
  },
  {
    id: 557,
    number: "F8",
    name: "Süßkartoffel",
    description: "",
    price: 5.00
  },
  {
    id: 558,
    number: "F9",
    name: "Onion Rings",
    description: "",
    price: 5.90
  },
  {
    id: 559,
    number: "F10",
    name: "Rosti",
    description: "4 Stk.",
    price: 5.90
  }
];

// Salate (Updated with new items)
export const salads: MenuItem[] = [
  {
    id: 568,
    number: 90,
    name: "Gebackene Camembert",
    description: "2 Stk. Mit Salat und Preiselbeeren",
    price: 10.90,
    isSpezialitaet: true
  },
  {
    id: 569,
    number: 91,
    name: "Fjord",
    description: "mit Räucherlachs, Gemischter Salat, Rosti und Meerrettich",
    price: 11.90,
    isSpezialitaet: true
  },
  {
    id: 570,
    number: 92,
    name: "Chefsalat",
    description: "mit Schinken und Käse",
    price: 10.90,
    isSpezialitaet: true
  },
  {
    id: 571,
    number: 93,
    name: "Thunfischsalat",
    description: "mit Thunfisch und Hirtenkäse",
    price: 10.90,
    isSpezialitaet: true
  },
  {
    id: 572,
    number: 94,
    name: "Tomaten Mozzarella",
    description: "mit fr.Tomaten, Mozzarella, Basilikum und Olivenöl",
    price: 10.90,
    isSpezialitaet: true
  },
  {
    id: 573,
    number: 95,
    name: "Gemischter Salat",
    description: "",
    price: 7.90,
    isSpezialitaet: true
  }
];

// Desserts (New section)
export const desserts: MenuItem[] = [
  {
    id: 574,
    number: "D1",
    name: "Rote Grütze",
    description: "mit Vanillesauce",
    price: 4.90
  },
  {
    id: 575,
    number: "D2",
    name: "Milchreis",
    description: "mit Zimt und Zucker",
    price: 4.90
  },
  {
    id: 576,
    number: "D3",
    name: "Schokopudding",
    description: "mit Vanillesauce",
    price: 4.90
  },
  {
    id: 577,
    number: "D4",
    name: "Oreo Schokoladen Muffin",
    description: "",
    price: 3.90
  },
  {
    id: 578,
    number: "D5",
    name: "Milka Schokoladen Muffin",
    description: "",
    price: 3.90
  }
];

// Dips (Saucen) - Updated with new structure and pricing
export const dips: MenuItem[] = [
  {
    id: 201,
    number: "201",
    name: "Mayo",
    description: "",
    price: 1.50
  },
  {
    id: 202,
    number: "202",
    name: "Ketchup",
    description: "",
    price: 1.50
  },
  {
    id: 203,
    number: "203",
    name: "Knobi",
    description: "",
    price: 1.50
  },
  {
    id: 204,
    number: "204",
    name: "Hollandaise",
    description: "",
    price: 1.50
  },
  {
    id: 205,
    number: "205",
    name: "Chilli",
    description: "",
    price: 1.50
  },
  {
    id: 206,
    number: "206",
    name: "BBQ",
    description: "",
    price: 1.50
  }
];

// Getränke (Drinks) - Updated with size options for soft drinks
export const drinks: MenuItem[] = [
  // Soft drinks with size options
  {
    id: 10,
    number: 100,
    name: "Coca-Cola",
    description: "Wählen Sie Ihre gewünschte Größe",
    price: 2.20,
    sizes: createDrinkSizes(2.20)
  },
  {
    id: 11,
    number: 100,
    name: "Coca-Cola Light",
    description: "Wählen Sie Ihre gewünschte Größe",
    price: 2.20,
    sizes: createDrinkSizes(2.20)
  },
  {
    id: 12,
    number: 100,
    name: "Fanta Orange",
    description: "Wählen Sie Ihre gewünschte Größe",
    price: 2.20,
    sizes: createDrinkSizes(2.20)
  },
  {
    id: 13,
    number: 100,
    name: "Sprite",
    description: "Wählen Sie Ihre gewünschte Größe",
    price: 2.20,
    sizes: createDrinkSizes(2.20)
  },
  {
    id: 18,
    number: 101,
    name: "Capri-Sonne",
    description: "0,20 L",
    price: 1.00
  },
  {
    id: 562,
    number: 102,
    name: "Becks oder Herrenhäuser",
    description: "0,3 L",
    price: 2.40,
    isBeerSelection: true
  },
  {
    id: 563,
    number: 103,
    name: "Chianti (Italienische Rotwein)",
    description: "0,7 L",
    price: 9.00
  },
  {
    id: 564,
    number: 104,
    name: "Merlot (Italienische Rotwein)",
    description: "1 L",
    price: 11.00
  },
  {
    id: 565,
    number: 105,
    name: "Suave (Italienischer Weißwein)",
    description: "0,7 L",
    price: 9.00
  },
  {
    id: 566,
    number: 106,
    name: "Chardonney (Italienische Weißwein)",
    description: "1 L",
    price: 11.00
  },
  {
    id: 567,
    number: 107,
    name: "Vodka Gorbatschow",
    description: "0,7 L",
    price: 16.00
  }
];

// Hamburger (Burgers) - Completely updated with new items and patty size options
export const burgers: MenuItem[] = [
  {
    id: 529,
    number: 40,
    name: "Cheese Burger",
    description: "mit Burgersauce und Cheddar°",
    price: 12.00,
    allergens: "A,C",
    sizes: createBurgerSizes(12.00)
  },
  {
    id: 530,
    number: 41,
    name: "Texas Bacon Burger",
    description: "mit Cheddar°, BBQ sauce, Bacon, Zwiebeln",
    price: 12.00,
    allergens: "A,C",
    sizes: createBurgerSizes(12.00)
  },
  {
    id: 531,
    number: 42,
    name: "Chilli Cheese Burger",
    description: "mit Chilli-Cheesesauce¹,³,⁴, Jalapenos und Cheddar°",
    price: 12.00,
    allergens: "A,C",
    sizes: createBurgerSizes(12.00)
  },
  {
    id: 532,
    number: 43,
    name: "Crispy Chicken Burger",
    description: "mit %100 Chicken-Patty, mayonnaise und Burgersauce",
    price: 12.00,
    sizes: createBurgerSizes(12.00)
  },
  {
    id: 533,
    number: 44,
    name: "Crispy Chilli-Chicken Burger",
    description: "mit %100 Chicken-Patty, Chilli-Cheesesauce¹,³,⁴, Cheddar° und Jalapenos",
    price: 12.00,
    sizes: createBurgerSizes(12.00)
  }
];

// Helper function to create pizza sizes with individual prices
const createPizzaSizes = (prices: { medium: number; large: number; family: number; mega: number }) => [
  { name: 'Medium', price: prices.medium, description: 'Ø ca. 26 cm' },
  { name: 'Large', price: prices.large, description: 'Ø ca. 30 cm' },
  { name: 'Family', price: prices.family, description: 'Ø ca. 40 cm' },
  { name: 'Mega', price: prices.mega, description: 'Ø ca. 50 cm' }
];

// Pizza - Updated with new Döner Pizza and updated Wunsch Pizza ingredients
export const pizzas: MenuItem[] = [
  {
    id: 501,
    number: 0,
    name: "Wunsch Pizza",
    description: "mit 4 Zutaten nach Wahl",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isWunschPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 21.90, mega: 30.90 })
  },
  {
    id: 502,
    number: 1,
    name: "Margherita",
    description: "",
    price: 8.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 8.90, large: 9.90, family: 17.90, mega: 26.90 })
  },
  {
    id: 503,
    number: 2,
    name: "Salami",
    description: "mit Rindersalami",
    price: 9.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 504,
    number: 3,
    name: "Schinken",
    description: "mit Formfleisch-Vorderschinken",
    price: 9.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 505,
    number: 4,
    name: "Bomba",
    description: "mit Rindersalami und Peperoni (scharf)",
    price: 9.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 506,
    number: 5,
    name: "Sucuk",
    description: "mit Knoblauchwurst, Tomaten und Zwiebeln",
    price: 9.90,
    allergens: "1,2,3,4/A,C,F",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 507,
    number: 6,
    name: "Casa",
    description: "mit Rindersalami, fr. Champignons und Paprika",
    price: 9.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 508,
    number: 7,
    name: "Mais",
    description: "mit Formfleisch-Vorderschinken, Mais und Sauce Hollandaise",
    price: 9.90,
    allergens: "1,2,3,4/A,C,F,G",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 509,
    number: 8,
    name: "Monopoly",
    description: "mit Formfleisch-Vorderschinken, Rindersalami, fr. Champignons und Paprika",
    price: 9.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 510,
    number: 9,
    name: "Hawaii",
    description: "mit Formfleisch-Vorderschinken und Ananas",
    price: 9.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 511,
    number: 10,
    name: "Parma",
    description: "mit Original Parmaschinken, Tomaten, Mozzarella, Rucola",
    price: 10.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 10.90, large: 12.90, family: 21.90, mega: 30.90 })
  },
  {
    id: 512,
    number: 11,
    name: "Italia",
    description: "mit Formfleisch-Vorderschinken, Rindersalami, fr. Champignons",
    price: 9.90,
    allergens: "1,2,3,4/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 513,
    number: 12,
    name: "Chilli-Cheese",
    description: "Chilli-Cheese Sauce, Sucuk, Jalapenos und Zwiebeln",
    price: 9.90,
    allergens: "1,2,3,4/A,C,F",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 19.90, mega: 29.90 })
  },
  {
    id: 514,
    number: 13,
    name: "Gyros",
    description: "mit Gyros und Zwiebeln",
    price: 9.90,
    allergens: "1,2,3,4/A,C,G",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 515,
    number: 14,
    name: "Hollandaise",
    description: "mit Hähnchenbrust, Jalapenos und Sauce Hollandaise",
    price: 10.90,
    allergens: "1,2,3,4/A,C,F,G",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 10.90, large: 12.90, family: 20.90, mega: 30.90 })
  },
  {
    id: 516,
    number: 15,
    name: "Polo",
    description: "mit Hähnchenbrust, Sucuk, Broccoli, Paprika",
    price: 10.90,
    allergens: "1,2,3,4/A,C,F,G",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 10.90, large: 12.90, family: 20.90, mega: 30.90 })
  },
  {
    id: 517,
    number: 16,
    name: "Palermo",
    description: "mit Hähnchenbrust, fr. Champignons und Paprika, Jalapenos und Sauce Hollandaise",
    price: 10.90,
    allergens: "1,2,3,4/A,C,F,G",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 10.90, large: 12.90, family: 20.90, mega: 30.90 })
  },
  {
    id: 518,
    number: 17,
    name: "Desperado",
    description: "mit Hähnchenbrust, fr. Paprika, Zwiebeln und Sauce Hollandaise",
    price: 10.90,
    allergens: "1,2,3,4/A,C,F,G",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 10.90, large: 12.90, family: 20.90, mega: 30.90 })
  },
  {
    id: 519,
    number: 18,
    name: "Tonno",
    description: "mit Thunfisch und Zwiebeln",
    price: 9.90,
    allergens: "1,2,3/A,C,H",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 520,
    number: 19,
    name: "Shrimps",
    description: "mit Shrimps und Knoblauch",
    price: 10.90,
    allergens: "1,2,3/A,C,D",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 10.90, large: 13.90, family: 21.90, mega: 30.90 })
  },
  {
    id: 521,
    number: 20,
    name: "Frutti di Mare",
    description: "mit Meeresfrüchten und Knoblauch",
    price: 10.90,
    allergens: "1,2,3/A,C,D",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 10.90, large: 13.90, family: 21.90, mega: 30.90 })
  },
  {
    id: 522,
    number: 21,
    name: "Funghi",
    description: "mit fr.Champignons",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 523,
    number: 22,
    name: "Vier Jahreszeiten",
    description: "mit fr.Champignons, Paprika, Tomaten, Artischocken",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 524,
    number: 23,
    name: "Spinat",
    description: "mit Spinat, Hirtenkäse°, Knoblauch und Zwiebeln",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 525,
    number: 24,
    name: "Quattro Formaggi",
    description: "mit Mozzarella°, Gorgonzola°, Hirtenkäse° und Edamer°",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 526,
    number: 25,
    name: "Roma",
    description: "mit Broccoli, fr.Paprika und Mais",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 527,
    number: 26,
    name: "Fitness",
    description: "mit fr.Tomaten, Mozzarella°, Rucola, Mais",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  },
  {
    id: 528,
    number: 27,
    name: "Vegetarisch",
    description: "mit Broccoli, Spinat, Milden Peperoni²,³",
    price: 9.90,
    allergens: "1,2,3/A,C",
    isPizza: true,
    sizes: createPizzaSizes({ medium: 9.90, large: 11.90, family: 18.90, mega: 28.90 })
  }
];