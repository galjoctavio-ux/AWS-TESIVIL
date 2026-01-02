-- Vista v_gangas_detectadas para QRclima - Radar de Precios
-- Detecta productos con precios significativamente menores al promedio histórico (10%+ de descuento)

CREATE VIEW public.v_gangas_detectadas AS
WITH
  promedios_historicos AS (
    SELECT
      ph.sku,
      AVG(ph.precio) AS promedio_historico
    FROM
      price_history ph
    WHERE
      ph.is_valid_match = TRUE
      AND ph.scraped_at > (NOW() - INTERVAL '90 days')
    GROUP BY
      ph.sku
    HAVING
      COUNT(*) >= 3  -- Mínimo 3 registros para calcular promedio confiable
  ),
  precios_actuales AS (
    SELECT DISTINCT ON (ph.sku)
      ph.sku,
      ph.precio AS precio_actual,
      ph.proveedor,
      ph.url,
      ph.scraped_at
    FROM
      price_history ph
    WHERE
      ph.is_valid_match = TRUE
      AND ph.scraped_at > (NOW() - INTERVAL '7 days')
    ORDER BY
      ph.sku,
      ph.precio ASC,
      ph.scraped_at DESC
  )
SELECT
  mp.nombre_estandarizado,
  pa.precio_actual AS mejor_precio,
  ROUND(prom.promedio_historico, 2) AS promedio_historico,
  ROUND(((prom.promedio_historico - pa.precio_actual) / prom.promedio_historico * 100), 2) AS porcentaje_descuento,
  pa.proveedor,
  pa.url
FROM
  master_products mp
  JOIN precios_actuales pa ON mp.sku = pa.sku
  JOIN promedios_historicos prom ON mp.sku = prom.sku
WHERE
  -- Descuento de al menos 10% respecto al promedio
  pa.precio_actual < (prom.promedio_historico * 0.90)
  -- Precio razonable (no muy bajo para evitar errores de datos)
  AND pa.precio_actual >= (prom.promedio_historico * 0.40)
ORDER BY
  porcentaje_descuento DESC
LIMIT 20;
