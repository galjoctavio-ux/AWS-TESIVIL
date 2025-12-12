import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuoteContextScreen } from '../screens/quote/QuoteContextScreen';
import { QuoteComposerScreen } from '../screens/quote/QuoteComposerScreen';
import { QuoteAnalysisScreen } from '../screens/quote/QuoteAnalysisScreen';
import { QuoteOutputScreen } from '../screens/quote/QuoteOutputScreen';
import { QuoteStateProvider } from '../context/QuoteStateContext';

const Tab = createMaterialTopTabNavigator();

export const QuoteNavigator = () => {
    return (
        <QuoteStateProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
                <Tab.Navigator
                    screenOptions={{
                        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
                        tabBarStyle: { backgroundColor: '#f8f9fa' },
                        swipeEnabled: false // Force user to use steps? Or allow swipe. Master plan implies steps. Let's keep swipe enabled for UX but optional.
                    }}
                >
                    <Tab.Screen name="Context" component={QuoteContextScreen} options={{ title: '1. Contexto' }} />
                    <Tab.Screen name="Composer" component={QuoteComposerScreen} options={{ title: '2. Armado' }} />
                    <Tab.Screen name="Analysis" component={QuoteAnalysisScreen} options={{ title: '3. Análisis' }} />
                    <Tab.Screen name="Output" component={QuoteOutputScreen} options={{ title: '4. Generar' }} />
                </Tab.Navigator>
            </SafeAreaView>
        </QuoteStateProvider>
    );
};
