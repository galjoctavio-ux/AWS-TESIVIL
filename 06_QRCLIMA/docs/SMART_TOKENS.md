# Ecosistema de Smart Tokens - QRClima

Documentación técnica del sistema de tokens para análisis futuro.

## Niveles de Usuario

| Nivel | Nombre | Tokens Requeridos | Emoji |
|-------|--------|-------------------|-------|
| 1 | Novato | 0+ | 🌱 |
| 2 | Aprendiz | 100+ | 🔧 |
| 3 | Técnico | 300+ | ⚙️ |
| 4 | Experto | 600+ | 🏆 |
| 5 | Maestro | 1000+ | 👑 |
| 6 | Leyenda | 2000+ | 🌟 |

**Archivo fuente:** [wallet-service.ts](file:///c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/06_QRCLIMA/services/wallet-service.ts) (líneas 263-293)

---

## Reglas de Generación de Tokens

| Acción | Tokens | Límite Diario | Tipo en Código |
|--------|--------|---------------|----------------|
| Servicio registrado | +10 | 6/día | `service_registered` |
| QR vinculado | +15 | 10/día | `qr_linked` |
| Hilo SOS creado | +20 | 1/día | `sos_thread_created` |
| Solución SOS aceptada | +50 | Sin límite | `sos_solution_accepted` |
| Perfil completado | +100 | Una vez | `profile_completed` |
| Cápsula completada | +5 | Sin límite | `training_completed` |
| Quiz aprobado | Variable | Sin límite | `training_quiz_passed` |
| Comentario aprobado | +2 | 10/día | `training_comment_approved` |
| Reacción "Maestro" recibida | +5 | 5/día | `training_reaction_maestro` |
| Compra de tokens | +50 | Sin límite | `token_purchase` |

---

## Gastos de Tokens

| Tipo | Descripción |
|------|-------------|
| `store_purchase` | Compra en tienda (monto negativo) |
| `fraud_revoked` | Revocado por fraude (admin) |

---

## Cálculo de Progreso

```typescript
// Progreso hacia el siguiente nivel (0-100%)
const progress = ((tokenBalance - prevThreshold) / (nextLevelAt - prevThreshold)) * 100;
```

**Ejemplo:** Usuario con 50 tokens (Nivel 1 - Novato)
- `prevThreshold = 0`
- `nextLevelAt = 100`
- `progress = (50 - 0) / (100 - 0) * 100 = 50%`

---

## Archivos Relacionados

- **Servicio:** [wallet-service.ts](file:///c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/06_QRCLIMA/services/wallet-service.ts)
- **UI Billetera:** [wallet/index.tsx](file:///c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/06_QRCLIMA/app/(app)/wallet/index.tsx)
- **Colección Firestore:** `token_transactions`, campo `users.tokenBalance`

---

## Notas para Análisis Futuro

- [ ] Revisar si los límites diarios son apropiados
- [ ] Evaluar si los umbrales de nivel están balanceados
- [ ] Analizar tasa de inflación de tokens
- [ ] Considerar sink de tokens (formas de gastarlos)
- [ ] Revisar recompensas por training (actualmente variable)
