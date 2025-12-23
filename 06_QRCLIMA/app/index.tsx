import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    return (
        <View className="flex-1 justify-center items-center bg-blue-500">
            <ActivityIndicator size="large" color="#ffffff" />
        </View>
    );
}
