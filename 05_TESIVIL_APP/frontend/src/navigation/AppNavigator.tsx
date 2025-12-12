import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { LegalAgreementScreen } from '../screens/onboarding/LegalAgreementScreen';
import { SetupScreen } from '../screens/onboarding/SetupScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { QuoteNavigator } from './QuoteNavigator';
import { QuickQuoteScreen } from '../screens/dashboard/QuickQuoteScreen';

export type RootStackParamList = {
    Splash: undefined;
    LegalAgreement: undefined;
    Setup: undefined;
    Dashboard: undefined;
    QuoteWizard: undefined;
    QuickQuote: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="LegalAgreement" component={LegalAgreementScreen} />
                <Stack.Screen name="Setup" component={SetupScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="QuoteWizard" component={QuoteNavigator} />
                <Stack.Screen name="QuickQuote" component={QuickQuoteScreen} options={{ title: 'Cotización Rápida' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
