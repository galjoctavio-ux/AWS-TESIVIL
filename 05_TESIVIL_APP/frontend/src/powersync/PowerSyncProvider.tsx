import React, { useMemo, useEffect } from 'react';
import { PowerSyncContext } from '@powersync/react-native';
import { db } from './db';
import { seedDatabase } from './bootstrap';

export const PowerSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const powerSync = useMemo(() => {
        return db;
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                await seedDatabase();
            } catch (e) {
                console.error("Seed failed", e);
            }
        };
        init();
    }, []);

    return (
        <PowerSyncContext.Provider value={powerSync}>
            {children}
        </PowerSyncContext.Provider>
    );
};
