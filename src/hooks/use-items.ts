'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Item } from '@/lib/types';
import { items as mockItems } from '@/lib/mock-data';

const ITEMS_STORAGE_KEY = 'manos-unidas-items';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      } else {
        // If no items in local storage, start with mock data
        setItems(mockItems);
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(mockItems));
      }
    } catch (error) {
      console.error('Failed to load items from local storage', error);
      setItems(mockItems);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocalStorage = (updatedItems: Item[]) => {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
  };

  const addItem = useCallback((item: Item) => {
    const newItems = [...items, item];
    setItems(newItems);
    updateLocalStorage(newItems);
  }, [items]);

  const updateItem = useCallback((itemId: string, updatedItemData: Partial<Item>) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, ...updatedItemData } : item
    );
    setItems(newItems);
    updateLocalStorage(newItems);
  }, [items]);

  const getItem = useCallback((itemId: string) => {
    return items.find(item => item.id === itemId);
  }, [items]);

  return { items, loading, addItem, updateItem, getItem };
}
