import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      await AsyncStorage.clear();

      const product = await AsyncStorage.getItem('@GoMarketplace:product');

      if (product) {
        setProducts(JSON.parse(product));
      }
    }

    loadProducts();
  }, []);

  // se o product já existe ele vai somar no quantity
  // tenho um state e no asyncStorage

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(item => item.id === product.id);

      const newProducts = productExists
        ? products.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...products, { ...product, quantity: 1 }];

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:produtcs',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );
  const increment = useCallback(async id => {
    await AsyncStorage.setItem('@GoMarketplace:id', id);
  }, []);

  const decrement = useCallback(async id => {
    await AsyncStorage.setItem('@GoMarketplace:id', id);
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
