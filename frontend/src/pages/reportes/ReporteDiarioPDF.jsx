import { forwardRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';

/*
 * ==================================================================
 * POR QUÉ SE CAMBIÓ DE "CSS MULTI-COLUMN AUTOMÁTICO" A "PAGINACIÓN
 * CALCULADA EN JS"
 * ==================================================================
 *
 * Se intentó que el propio navegador partiera el contenido en
 * columna izquierda / derecha y hoja 1 / hoja 2... usando
 * CSS multi-column (column-count + column-fill).
 *
 * Eso falló en la práctica de dos formas distintas:
 *
 * 1. Con una ALTURA FIJA en el contenedor: el navegador, al no
 *    poder pasar el sobrante a una hoja nueva, agregaba una
 *    columna EXTRA hacia el costado (se salía de la hoja).
 *
 * 2. Sin altura fija (auto): "column-fill: auto" necesita una
 *    altura definida para saber cuándo una columna "se llenó" y
 *    pasar a la siguiente. Sin eso, todo se queda en la columna
 *    izquierda y la derecha queda vacía.
 *
 * Esto es una limitación real del motor de impresión (Chromium)
 * con esta técnica, no algo que se arregle con más CSS.
 *
 * SOLUCIÓN:
 *
 * En vez de confiar en que el navegador reparta el contenido,
 * se calcula aquí mismo, en JavaScript:
 *
 *   1. Se estima cuánto mide (en mm) cada pedido, según cuántas
 *      filas de productos y notas tiene.
 *   2. Se van acomodando los pedidos, uno por uno, en la columna
 *      izquierda de la hoja actual. Cuando ya no entra otro
 *      pedido completo, se pasa a la columna derecha. Cuando esa
 *      también se llena, se crea una hoja nueva y se sigue por
 *      la columna izquierda.
 *   3. Se renderizan hojas ya armadas (tamaño A4 fijo), cada una
 *      con "page-break-after" para forzar el salto real de hoja
 *      al imprimir.
 *
 * NOTA IMPORTANTE:
 *
 * Un pedido se mueve COMPLETO de una columna a otra (no se parte
 * a la mitad, fila por fila, entre columnas). Si quisieras que un
 * pedido muy largo también se partiera dentro de la tabla, se
 * necesitaría medir el alto real ya renderizado en el navegador
 * (con refs + useLayoutEffect) en vez de estimarlo aquí; es más
 * trabajo y más frágil, así que se dejó así a propósito.
 *
 * Si notas que una columna queda con bastante espacio vacío o que
 * un pedido se ve muy ajustado/cortado, ajusta las constantes de
 * "ESTIMACION_MM" más abajo (son estimaciones, no medidas exactas).
 */

// ------------------------------------------------------------------
// DIMENSIONES DE PÁGINA (A4 horizontal)
// ------------------------------------------------------------------

const PAGINA_ANCHO_MM = 297;
const PAGINA_ALTO_MM = 210;
const MARGEN_V_MM = 8; // margen arriba/abajo
const MARGEN_H_MM = 10; // margen izquierda/derecha
const COLUMN_GAP_MM = 6;

const ALTO_UTIL_MM = PAGINA_ALTO_MM - MARGEN_V_MM * 2; // 194mm
const ALTO_ENCABEZADO_MM = 14; // título + línea + márgenes (solo hoja 1)

// Margen de seguridad: usamos solo el 92% del espacio calculado,
// porque la estimación de alturas no es exacta al 100%.
const FACTOR_SEGURIDAD = 0.92;

const PRESUPUESTO_PRIMERA_HOJA_MM =
  (ALTO_UTIL_MM - ALTO_ENCABEZADO_MM) * FACTOR_SEGURIDAD;
const PRESUPUESTO_OTRAS_HOJAS_MM = ALTO_UTIL_MM * FACTOR_SEGURIDAD;

// ------------------------------------------------------------------
// ESTIMACIÓN DE ALTURA DE UN PEDIDO (en mm)
// ------------------------------------------------------------------

const ESTIMACION_MM = {
  clienteLinea: 5.2, // alto de línea del nombre del cliente (11pt)
  clienteCajaExtra: 3, // padding + borde de la cajita del nombre
  notaEtiqueta: 4, // alto de la palabra "Notas:"
  notaLinea: 3.6, // alto de cada línea de nota
  tablaEncabezado: 6, // fila de encabezado de la tabla (Cantidad/Producto/...)
  tablaFila: 5.3, // cada fila de producto o nota adicional
  pedidoMarginBottom: 6,
  pedidoPadding: 3,
  caracteresPorLineaCliente: 22,
  caracteresPorLineaNota: 40,
};

function estimarAlturaPedido(clienteNombre, pedido) {
  const observaciones = (pedido.notas || []).filter(
    (n) => n.tipo === 'OBSERVACION'
  );
  const adicionales = (pedido.notas || []).filter(
    (n) => n.tipo === 'ADICIONAL'
  );
  const detalles = pedido.detalles || [];

  // --- Columna izquierda: cliente + notas ---
  const nombreLineas = Math.max(
    1,
    Math.ceil(
      (clienteNombre || '').length /
        ESTIMACION_MM.caracteresPorLineaCliente
    )
  );

  let altoCliente =
    nombreLineas * ESTIMACION_MM.clienteLinea +
    ESTIMACION_MM.clienteCajaExtra;

  if (observaciones.length > 0) {
    altoCliente += ESTIMACION_MM.notaEtiqueta;
    observaciones.forEach((nota) => {
      const lineas = Math.max(
        1,
        Math.ceil(
          (nota.texto || '').length /
            ESTIMACION_MM.caracteresPorLineaNota
        )
      );
      altoCliente += lineas * ESTIMACION_MM.notaLinea;
    });
  }

  // --- Columna derecha: tabla ---
  const filas = detalles.length + adicionales.length;
  const altoTabla =
    ESTIMACION_MM.tablaEncabezado + filas * ESTIMACION_MM.tablaFila;

  return (
    Math.max(altoCliente, altoTabla) +
    ESTIMACION_MM.pedidoMarginBottom +
    ESTIMACION_MM.pedidoPadding
  );
}

// ------------------------------------------------------------------
// PAGINACIÓN: reparte los pedidos en hojas x 2 columnas
// ------------------------------------------------------------------

function paginarPedidos(pedidosConInfo) {
  const hojas = [];

  let hojaActual = { columnas: [[], []] };
  let columnaActual = 0;
  let altoUsado = 0;
  let esPrimeraHoja = true;

  const presupuestoActual = () =>
    esPrimeraHoja
      ? PRESUPUESTO_PRIMERA_HOJA_MM
      : PRESUPUESTO_OTRAS_HOJAS_MM;

  pedidosConInfo.forEach((item) => {
    const altura = item.alturaEstimada;

    // ¿Ya no entra en la columna actual? (y la columna no está vacía)
    if (altoUsado > 0 && altoUsado + altura > presupuestoActual()) {
      columnaActual += 1;
      altoUsado = 0;

      // ¿Ya se llenaron las 2 columnas de esta hoja? -> hoja nueva
      if (columnaActual > 1) {
        hojas.push(hojaActual);
        hojaActual = { columnas: [[], []] };
        columnaActual = 0;
        esPrimeraHoja = false;
      }
    }

    hojaActual.columnas[columnaActual].push(item);
    altoUsado += altura;
  });

  hojas.push(hojaActual);
  return hojas;
}

// ------------------------------------------------------------------
// SUBCOMPONENTE: un pedido individual (cliente + notas | tabla)
// ------------------------------------------------------------------

function PedidoBox({ clienteNombre, pedido, mostrarPapaFrita }) {
  const observaciones = (pedido.notas || []).filter(
    (nota) => nota.tipo === 'OBSERVACION'
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(31%, 0.8fr) minmax(0, 2fr)',
        gap: 0.75,
        alignItems: 'start',
        width: '100%',
        boxSizing: 'border-box',
        mb: `${ESTIMACION_MM.pedidoMarginBottom}mm`,
        p: `${ESTIMACION_MM.pedidoPadding / 2}mm ${
          ESTIMACION_MM.pedidoPadding
        }mm`,
      }}
    >
      {/* ================================================
          CLIENTE + OBSERVACIONES
          ================================================ */}

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            fontSize: '11pt',
            lineHeight: 1.2,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            bgcolor: '#fef3c7',
            py: 0.5,
            px: 0.75,
            border: '2px solid #b45309',
            borderRadius: '2px',
            color: '#111827',
          }}
        >
          {clienteNombre}
        </Typography>

        {observaciones.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '9pt',
                fontWeight: 'bold',
                color: '#111827',
              }}
            >
              Notas:
            </Typography>

            {observaciones.map((nota, notaIdx) => (
              <Typography
                key={nota.id ?? notaIdx}
                sx={{
                  fontSize: '8.5pt',
                  lineHeight: 1.2,
                  fontStyle: 'italic',
                  color: '#334155',
                  overflowWrap: 'anywhere',
                }}
              >
                • {nota.texto}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* ================================================
          TABLA DEL PEDIDO
          ================================================ */}

      <TableContainer sx={{ minWidth: 0, width: '100%', overflow: 'visible' }}>
        <Table
          size="small"
          sx={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            border: 'none',
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#09ff00' }}>
              <TableCell
                sx={{
                  width: '19%',
                  fontSize: '9pt',
                  fontWeight: 'bold',
                  border: '1px solid #1e293b',
                  py: 0.4,
                  px: 0.5,
                  color: '#000000',
                }}
              >
                Cantidad
              </TableCell>

              <TableCell
                sx={{
                  width: mostrarPapaFrita ? '47%' : '58%',
                  fontSize: '9pt',
                  fontWeight: 'bold',
                  border: '1px solid #1e293b',
                  py: 0.4,
                  px: 0.5,
                  color: '#000000',
                }}
              >
                Producto
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  width: mostrarPapaFrita ? '18%' : '25%',
                  fontSize: '9pt',
                  fontWeight: 'bold',
                  border: '1px solid #1e293b',
                  py: 0.4,
                  px: 0.5,
                  color: '#000000',
                }}
              >
                Taper
              </TableCell>

              {mostrarPapaFrita && (
                <TableCell
                  align="center"
                  sx={{
                    width: '17%',
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    border: '1px solid #1e293b',
                    py: 0.4,
                    px: 0.5,
                    color: '#000000',
                  }}
                >
                  Papa Frita
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {(pedido.detalles || []).map((detalle, dIdx) => (
              <TableRow
                key={detalle.id ?? `d-${dIdx}`}
                sx={{
                  '&:nth-of-type(even)': { bgcolor: '#dbeafe' },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: '9pt',
                    border: '1px solid #475569',
                    py: 0.3,
                    px: 0.5,
                  }}
                >
                  {detalle.cantidad}
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: '9pt',
                    border: '1px solid #475569',
                    py: 0.3,
                    px: 0.5,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {detalle.producto?.nombre || 'Producto eliminado'}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontSize: '9pt',
                    border: '1px solid #475569',
                    py: 0.3,
                    px: 0.5,
                    fontWeight: detalle.usaTaper ? 'bold' : 'normal',
                    color: detalle.usaTaper ? '#15803d' : '#334155',
                  }}
                >
                  {detalle.usaTaper ? '✔' : '—'}
                </TableCell>

                {mostrarPapaFrita && (
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '9pt',
                      border: '1px solid #475569',
                      py: 0.3,
                      px: 0.5,
                      fontWeight: detalle.usaPapaFrita ? 'bold' : 'normal',
                      color: detalle.usaPapaFrita ? '#15803d' : '#334155',
                    }}
                  >
                    {detalle.usaPapaFrita ? '✔' : '—'}
                  </TableCell>
                )}
              </TableRow>
            ))}

            {(pedido.notas || [])
              .filter((nota) => nota.tipo === 'ADICIONAL')
              .map((nota, nIdx) => (
                <TableRow
                  key={nota.id ?? `n-${nIdx}`}
                  sx={{
                    bgcolor: '#ffedd5',
                    '&:nth-of-type(even)': { bgcolor: '#fed7aa' },
                  }}
                >
                  <TableCell
                    sx={{
                      fontSize: '9pt',
                      border: '1px solid #475569',
                      py: 0.3,
                      px: 0.5,
                    }}
                  >
                    {nota.cantidad}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: '9pt',
                      border: '1px solid #475569',
                      py: 0.3,
                      px: 0.5,
                      fontStyle: 'italic',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    ➕ {nota.descripcion}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '9pt',
                      border: '1px solid #475569',
                      py: 0.3,
                      px: 0.5,
                      color: '#334155',
                    }}
                  >
                    —
                  </TableCell>

                  {mostrarPapaFrita && (
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: '9pt',
                        border: '1px solid #475569',
                        py: 0.3,
                        px: 0.5,
                        color: '#334155',
                      }}
                    >
                      —
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------------

export const ReporteDiarioPDF = forwardRef(({ data = [] }, ref) => {
  // --- Aplanar pedidos + calcular su altura estimada ---

  const pedidosConInfo = data.flatMap((cliente) => {
    const pedidosCliente = cliente.pedidos || [];
    const clienteNombre = cliente.cliente || 'Cliente sin nombre';

    const mostrarPapaFrita = pedidosCliente.some((item) =>
      (item.detalles || []).some((detalle) => detalle.usaPapaFrita)
    );

    return pedidosCliente.map((pedido) => ({
      clienteNombre,
      pedido,
      mostrarPapaFrita,
      alturaEstimada: estimarAlturaPedido(clienteNombre, pedido),
    }));
  });

  const hojas = paginarPedidos(pedidosConInfo);

  return (
    <Box ref={ref} className="reporte-pdf">
      <style>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }

        .pdf-hoja {
          break-after: page;
          page-break-after: always;
        }

        .pdf-hoja:last-child {
          break-after: auto;
          page-break-after: auto;
        }

        @media print {
          .reporte-pdf {
            width: auto !important;
          }
        }
      `}</style>

      {hojas.map((hoja, hojaIdx) => {
        const esPrimeraHoja = hojaIdx === 0;

        return (
          <Box
            key={hojaIdx}
            className="pdf-hoja"
            sx={{
              width: `${PAGINA_ANCHO_MM}mm`,
              height: `${PAGINA_ALTO_MM}mm`,
              boxSizing: 'border-box',
              p: `${MARGEN_V_MM}mm ${MARGEN_H_MM}mm`,
              bgcolor: '#ffffff',
              fontFamily: 'Arial, sans-serif',
              color: '#0f172a',
              overflow: 'hidden',
            }}
          >
            {/* ==========================================
                ENCABEZADO (solo en la primera hoja)
                ========================================== */}

            {esPrimeraHoja && (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  align="center"
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    fontSize: '16pt',
                    color: '#0f172a',
                    letterSpacing: 0.5,
                    mb: 1,
                  }}
                >
                  Lista de Pedidos
                </Typography>

                <Divider sx={{ borderColor: '#475569' }} />
              </Box>
            )}

            {/* ==========================================
                DOS COLUMNAS DE PEDIDOS
                ========================================== */}

            <Box
              sx={{
                display: 'flex',
                gap: `${COLUMN_GAP_MM}mm`,
                width: '100%',
                alignItems: 'flex-start',
              }}
            >
              {hoja.columnas.map((columna, colIdx) => (
                <Box
                  key={colIdx}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {columna.map((item, itemIdx) => (
                    <PedidoBox
                      key={item.pedido.id ?? `${item.clienteNombre}-${itemIdx}`}
                      clienteNombre={item.clienteNombre}
                      pedido={item.pedido}
                      mostrarPapaFrita={item.mostrarPapaFrita}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
});

ReporteDiarioPDF.displayName = 'ReporteDiarioPDF';
