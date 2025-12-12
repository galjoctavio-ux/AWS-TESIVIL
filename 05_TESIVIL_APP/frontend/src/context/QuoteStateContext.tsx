import React, { createContext, useContext, useState } from 'react';

// Simplified Item Type
export type QuoteItem = {
    id: string;
    materialId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    laborCost: number;
};

type QuoteContextType = {
    // Context Tab State
    logisticsTier: number; // 0, 1, 2
    obstructionFactor: number; // 0-1 range (added to base)
    isUrgent: boolean;

    // Composer Tab State
    items: QuoteItem[];
    addItem: (item: QuoteItem) => void;
    removeItem: (id: string) => void;

    // Setters
    setLogisticsTier: (val: number) => void;
    setObstructionFactor: (val: number) => void;
    setIsUrgent: (val: boolean) => void;

    // Computed
    totalMaterialCost: number;
    totalLaborCost: number;
};

const QuoteStateContext = createContext<QuoteContextType | null>(null);

export const useQuoteState = () => {
    const context = useContext(QuoteStateContext);
    if (!context) throw new Error('useQuoteState must be used within a QuoteStateProvider');
    return context;
};

export const QuoteStateProvider = ({ children }: { children: React.ReactNode }) => {
    const [logisticsTier, setLogisticsTier] = useState(0);
    const [obstructionFactor, setObstructionFactor] = useState(0);
    const [isUrgent, setIsUrgent] = useState(false);
    const [items, setItems] = useState<QuoteItem[]>([]);

    const addItem = (item: QuoteItem) => {
        setItems(prev => [...prev, item]);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const totalMaterialCost = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
    const totalLaborCost = items.reduce((sum, i) => sum + (i.laborCost * i.quantity), 0);

    return (
        <QuoteStateContext.Provider value={{
            logisticsTier,
            obstructionFactor,
            isUrgent,
            items,
            addItem,
            removeItem,
            setLogisticsTier,
            setObstructionFactor,
            setIsUrgent,
            totalMaterialCost,
            totalLaborCost
        }}>
            {children}
        </QuoteStateContext.Provider>
    );
};
