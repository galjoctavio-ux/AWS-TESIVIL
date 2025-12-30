# Aspectos Técnicos - QRclima

## Solución: Teclado tapa inputs en formularios

### Problema
En Android, el teclado virtual cubre los campos de texto en la parte inferior de la pantalla.

### Solución

```tsx
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRef } from 'react';

export default function MiPantalla() {
    const scrollViewRef = useRef<ScrollView>(null);
    
    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior="padding"  // ⚠️ Usar "padding" (no "height") - más confiable en Android
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
                keyboardShouldPersistTaps="handled"  // Permite tocar botones mientras teclado está abierto
            >
                {/* Tu contenido aquí */}
                
                <TextInput
                    onFocus={() => {
                        // Opcional: scroll al final para inputs bajos
                        setTimeout(() => {
                            scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 300);
                    }}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
```

### Elementos clave

| Prop | Valor | Razón |
|------|-------|-------|
| `behavior` | `"padding"` | Más confiable en Android que `"height"` |
| `keyboardVerticalOffset` | `20` (Android) | Compensa altura de status bar |
| `keyboardShouldPersistTaps` | `"handled"` | Permite tocar sin cerrar teclado |
| `paddingBottom` | `50` | Da espacio extra al final del scroll |
| `onFocus + scrollToEnd` | Para inputs bajos | Scroll automático cuando se enfoca |

### Archivos donde se aplicó
- `app/(onboarding)/profile.tsx`

---

## Otros aspectos técnicos

*(Agregar aquí futuros patrones y soluciones)*
