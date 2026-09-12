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

export const ReporteDiarioPDF = forwardRef(({ data = [] }, ref) => {
  /*
   * ============================================================
   * PREPARAR PEDIDOS
   * ============================================================
   *
   * Cada pedido se convierte en un elemento independiente.
   *
   * IMPORTANTE:
   * No agrupamos los pedidos en filas horizontales.
   *
   * El CSS MULTI-COLUMN se encarga de llevarlos:
   *
   * Hoja 1 izquierda
   *        ↓
   * Hoja 1 derecha
   *        ↓
   * Hoja 2 izquierda
   *        ↓
   * Hoja 2 derecha
   *        ↓
   * ...
   *
   * Primero se llena verticalmente una columna y luego
   * continúa automáticamente en la siguiente.
   */

  const pedidos = data.flatMap((cliente) =>
    (cliente.pedidos || []).map((pedido) => ({
      clienteNombre: cliente.cliente || 'Cliente sin nombre',
      pedidosCliente: cliente.pedidos || [],
      pedido,
    }))
  );

  return (
    <Box
      ref={ref}
      className="reporte-pdf"
      sx={{
        width: '297mm',
        minHeight: '210mm',
        boxSizing: 'border-box',

        p: '10mm 12mm',

        bgcolor: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',

        '@page': {
          size: 'A4 landscape',
          margin: '10mm 12mm',
        },

        '@media print': {
          width: 'auto',
          minHeight: 'auto',
          p: 0,
          bgcolor: '#ffffff',
        },
      }}
    >
      <style>{`
        /*
         * ========================================================
         * CONFIGURACIÓN DE PÁGINA
         * ========================================================
         */

        @page {
          size: A4 landscape;
          margin: 10mm 12mm;
        }

        /*
         * ========================================================
         * CONTENEDOR PRINCIPAL DE PEDIDOS
         * ========================================================
         *
         * CONTINUIDAD:
         *
         * 1. Hoja 1 - izquierda
         * 2. Hoja 1 - derecha
         * 3. Hoja 2 - izquierda
         * 4. Hoja 2 - derecha
         * 5. ...
         *
         * Se utiliza CSS MULTI-COLUMN.
         */

        .pdf-pedidos-container {
          column-count: 2;
          column-gap: 5mm;
          column-fill: auto;

          /*
           * ANTES:
           *
           * height: calc(190mm - 18mm);
           *
           * Eso dejaba demasiado espacio vacío abajo.
           *
           * AHORA:
           *
           * Aprovechamos más altura útil de la hoja.
           */
          height: calc(190mm - 10mm);

          width: 100%;

          column-span: none;
        }

        /*
         * ========================================================
         * PEDIDO
         * ========================================================
         *
         * Cada pedido conserva su estructura:
         *
         * Cliente / Notas | Tabla
         *
         * El pedido puede fragmentarse para respetar la
         * continuidad entre columnas.
         */

        .pdf-pedido {
          width: 100%;
          min-width: 0;

          display: grid;

          grid-template-columns:
            minmax(31%, 0.8fr)
            minmax(0, 2fr);

          gap: 0.75rem;

          align-items: start;

          box-sizing: border-box;

          /*
           * IMPORTANTE:
           *
           * No usar avoid-page aquí.
           *
           * Esto permite que el pedido continúe:
           *
           * columna izquierda
           *       ↓
           * columna derecha
           *       ↓
           * siguiente hoja
           */

          break-inside: auto;
          page-break-inside: auto;

          margin-bottom: 5mm;
        }

        /*
         * ========================================================
         * TABLA
         * ========================================================
         *
         * Se elimina únicamente el MARCO EXTERIOR de la tabla.
         *
         * Las líneas internas de las celdas permanecen.
         */

        .pdf-tabla {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;

          /*
           * ELIMINADO:
           *
           * border: 2px solid #1e293b;
           *
           * Ya no habrá una línea gruesa alrededor de toda
           * la tabla.
           */
          border: none;
        }

        .pdf-tabla thead {
          /*
           * Si la tabla continúa en otra columna/página,
           * el encabezado vuelve a aparecer.
           */
          display: table-header-group;
        }

        /*
         * ========================================================
         * CONTENEDOR DE TABLA
         * ========================================================
         */

        .pdf-tabla-container {
          min-width: 0;
          width: 100%;
          overflow: visible;

          break-inside: auto;
          page-break-inside: auto;
        }

        /*
         * ========================================================
         * FILAS
         * ========================================================
         *
         * Una fila completa no se parte.
         *
         * Si no entra, pasa al siguiente espacio disponible.
         */

        .pdf-tabla tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .pdf-tabla td,
        .pdf-tabla th {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /*
         * ========================================================
         * IMPRESIÓN
         * ========================================================
         */

        @media print {

          .reporte-pdf {
            width: auto !important;
            min-height: auto !important;
            padding: 0 !important;
          }

          /*
           * Mantener exactamente DOS columnas por hoja.
           *
           * La continuidad sigue siendo:
           *
           * izquierda → derecha → siguiente hoja izquierda
           */

          .pdf-pedidos-container {
            column-count: 2 !important;
            column-gap: 5mm !important;
            column-fill: auto !important;

            /*
             * Aprovechamos también el espacio inferior
             * durante impresión/PDF.
             */
            height: calc(190mm - 10mm) !important;

            width: 100% !important;
          }

          /*
           * EL PEDIDO PUEDE CONTINUAR.
           */

          .pdf-pedido {
            break-inside: auto !important;
            page-break-inside: auto !important;

            width: 100% !important;

            margin-bottom: 5mm !important;
          }

          /*
           * La tabla también puede continuar.
           */

          .pdf-tabla-container {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          /*
           * Las filas permanecen completas.
           */

          .pdf-tabla tr,
          .pdf-tabla td,
          .pdf-tabla th {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /*
           * Repetir encabezado cuando una tabla continúa.
           */

          .pdf-tabla thead {
            display: table-header-group !important;
          }

          /*
           * Evitar separar el título del contenido.
           */

          .pdf-encabezado {
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* ========================================================
          ENCABEZADO
          ======================================================== */}

      <Box
        className="pdf-encabezado"
        sx={{
          mb: 1.5,

          breakAfter: 'avoid-page',
          pageBreakAfter: 'avoid',
        }}
      >
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

        <Divider
          sx={{
            borderColor: '#475569',
          }}
        />
      </Box>

      {/* ========================================================
          CONTENEDOR DE PEDIDOS
          ======================================================== */}

      <Box
        className="pdf-pedidos-container"
        sx={{
          columnCount: 2,
          columnGap: '5mm',
          columnFill: 'auto',

          /*
           * Más altura disponible.
           *
           * Se mantiene la continuidad mediante CSS columns.
           */
          height: 'calc(190mm - 10mm)',

          width: '100%',
        }}
      >
        {pedidos.map(
          ({ clienteNombre, pedidosCliente, pedido }, pIdx) => {
            /*
             * ====================================================
             * OBSERVACIONES
             * ====================================================
             */

            const observaciones = (pedido.notas || []).filter(
              (nota) => nota.tipo === 'OBSERVACION'
            );

            /*
             * ====================================================
             * PAPA FRITA
             * ====================================================
             *
             * Se muestra la columna Papa Frita si alguno de
             * los pedidos del cliente utiliza papa frita.
             */

            const mostrarPapaFrita = pedidosCliente.some((item) =>
              (item.detalles || []).some(
                (detalle) => detalle.usaPapaFrita
              )
            );

            return (
              <Box
                key={
                  pedido.id ??
                  `${clienteNombre}-${pIdx}`
                }
                className="pdf-pedido"
                sx={{
                  display: 'grid',

                  /*
                   * IZQUIERDA:
                   * cliente + observaciones
                   *
                   * DERECHA:
                   * tabla
                   */

                  gridTemplateColumns:
                    'minmax(31%, 0.8fr) minmax(0, 2fr)',

                  gap: 0.75,

                  alignItems: 'start',

                  minWidth: 0,

                  width: '100%',

                  boxSizing: 'border-box',

                  /*
                   * IMPORTANTE:
                   *
                   * Permitimos que este pedido continúe
                   * en la siguiente columna.
                   */

                  breakInside: 'auto',
                  pageBreakInside: 'auto',
                }}
              >
                {/* =================================================
                    CLIENTE + OBSERVACIONES
                    ================================================= */}

                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',

                      fontSize: '10pt',
                      lineHeight: 1.15,

                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',

                      bgcolor: '#fef3c7',

                      py: 0.45,
                      px: 0.75,

                      border: '2px solid #b45309',
                      borderRadius: '2px',

                      color: '#111827',
                    }}
                  >
                    {clienteNombre}
                  </Typography>

                  {/* ===============================================
                      OBSERVACIONES
                      =============================================== */}

                  {observaciones.length > 0 && (
                    <Box
                      sx={{
                        mt: 0.4,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '8pt',
                          fontWeight: 'bold',
                          color: '#111827',
                        }}
                      >
                        Notas:
                      </Typography>

                      {observaciones.map(
                        (nota, notaIdx) => (
                          <Typography
                            key={
                              nota.id ??
                              notaIdx
                            }
                            sx={{
                              fontSize: '8pt',
                              lineHeight: 1.15,
                              fontStyle: 'italic',
                              color: '#334155',

                              overflowWrap:
                                'anywhere',
                            }}
                          >
                            • {nota.texto}
                          </Typography>
                        )
                      )}
                    </Box>
                  )}
                </Box>

                {/* =================================================
                    TABLA DEL PEDIDO
                    ================================================= */}

                <TableContainer
                  className="pdf-tabla-container"
                  sx={{
                    minWidth: 0,

                    width: '100%',

                    overflow: 'visible',

                    /*
                     * La tabla puede continuar.
                     */

                    breakInside: 'auto',
                    pageBreakInside: 'auto',
                  }}
                >
                  <Table
                    className="pdf-tabla"
                    size="small"
                    sx={{
                      width: '100%',

                      tableLayout: 'fixed',

                      borderCollapse:
                        'collapse',

                      /*
                       * SIN MARCO EXTERIOR.
                       *
                       * Las celdas siguen teniendo sus
                       * propios bordes internos.
                       */
                      border: 'none',
                    }}
                  >
                    {/* =============================================
                        ENCABEZADO DE TABLA
                        ============================================= */}

                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: '#0f172a',
                        }}
                      >
                        {/* CANTIDAD */}

                        <TableCell
                          sx={{
                            width: '17%',

                            fontSize: '8pt',
                            fontWeight: 'bold',

                            border:
                              '1px solid #1e293b',

                            py: 0.35,
                            px: 0.5,

                            color: '#ffffff',
                          }}
                        >
                          Cantidad
                        </TableCell>

                        {/* PRODUCTO */}

                        <TableCell
                          sx={{
                            width:
                              mostrarPapaFrita
                                ? '47%'
                                : '58%',

                            fontSize: '8pt',
                            fontWeight: 'bold',

                            border:
                              '1px solid #1e293b',

                            py: 0.35,
                            px: 0.5,

                            color: '#ffffff',
                          }}
                        >
                          Producto
                        </TableCell>

                        {/* TAPER */}

                        <TableCell
                          align="center"
                          sx={{
                            width:
                              mostrarPapaFrita
                                ? '18%'
                                : '25%',

                            fontSize: '8pt',
                            fontWeight: 'bold',

                            border:
                              '1px solid #1e293b',

                            py: 0.35,
                            px: 0.5,

                            color: '#ffffff',
                          }}
                        >
                          Taper
                        </TableCell>

                        {/* PAPA FRITA */}

                        {mostrarPapaFrita && (
                          <TableCell
                            align="center"
                            sx={{
                              width: '18%',

                              fontSize: '8pt',
                              fontWeight: 'bold',

                              border:
                                '1px solid #1e293b',

                              py: 0.35,
                              px: 0.5,

                              color: '#ffffff',
                            }}
                          >
                            Papa Frita
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>

                    {/* =============================================
                        CUERPO
                        ============================================= */}

                    <TableBody>
                      {/* ===========================================
                          PRODUCTOS
                          =========================================== */}

                      {(pedido.detalles || []).map(
                        (detalle, dIdx) => (
                          <TableRow
                            key={
                              detalle.id ??
                              `d-${dIdx}`
                            }
                            sx={{
                              '&:nth-of-type(even)':
                                {
                                  bgcolor:
                                    '#dbeafe',
                                },

                              /*
                               * UNA FILA NO SE PARTE.
                               *
                               * Si no entra completa en el
                               * espacio actual, pasa al siguiente.
                               */

                              breakInside:
                                'avoid',
                              pageBreakInside:
                                'avoid',
                            }}
                          >
                            {/* CANTIDAD */}

                            <TableCell
                              sx={{
                                fontSize: '8pt',

                                border:
                                  '1px solid #475569',

                                py: 0.25,
                                px: 0.5,
                              }}
                            >
                              {detalle.cantidad}
                            </TableCell>

                            {/* PRODUCTO */}

                            <TableCell
                              sx={{
                                fontSize: '8pt',

                                border:
                                  '1px solid #475569',

                                py: 0.25,
                                px: 0.5,

                                overflowWrap:
                                  'anywhere',
                              }}
                            >
                              {detalle.producto
                                ?.nombre ||
                                'Producto eliminado'}
                            </TableCell>

                            {/* TAPER */}

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '8pt',

                                border:
                                  '1px solid #475569',

                                py: 0.25,
                                px: 0.5,

                                fontWeight:
                                  detalle.usaTaper
                                    ? 'bold'
                                    : 'normal',

                                color:
                                  detalle.usaTaper
                                    ? '#15803d'
                                    : '#334155',
                              }}
                            >
                              {detalle.usaTaper
                                ? '✔'
                                : '—'}
                            </TableCell>

                            {/* PAPA FRITA */}

                            {mostrarPapaFrita && (
                              <TableCell
                                align="center"
                                sx={{
                                  fontSize: '8pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.25,
                                  px: 0.5,

                                  fontWeight:
                                    detalle.usaPapaFrita
                                      ? 'bold'
                                      : 'normal',

                                  color:
                                    detalle.usaPapaFrita
                                      ? '#15803d'
                                      : '#334155',
                                }}
                              >
                                {detalle.usaPapaFrita
                                  ? '✔'
                                  : '—'}
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      )}

                      {/* ===========================================
                          NOTAS ADICIONALES
                          =========================================== */}

                      {(pedido.notas || [])
                        .filter(
                          (nota) =>
                            nota.tipo ===
                            'ADICIONAL'
                        )
                        .map(
                          (nota, nIdx) => (
                            <TableRow
                              key={
                                nota.id ??
                                `n-${nIdx}`
                              }
                              sx={{
                                bgcolor:
                                  '#ffedd5',

                                '&:nth-of-type(even)':
                                  {
                                    bgcolor:
                                      '#fed7aa',
                                  },

                                /*
                                 * Una nota adicional
                                 * tampoco se parte.
                                 */

                                breakInside:
                                  'avoid',
                                pageBreakInside:
                                  'avoid',
                              }}
                            >
                              {/* CANTIDAD */}

                              <TableCell
                                sx={{
                                  fontSize: '8pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.25,
                                  px: 0.5,
                                }}
                              >
                                {nota.cantidad}
                              </TableCell>

                              {/* DESCRIPCIÓN */}

                              <TableCell
                                sx={{
                                  fontSize: '8pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.25,
                                  px: 0.5,

                                  fontStyle:
                                    'italic',

                                  overflowWrap:
                                    'anywhere',
                                }}
                              >
                                ➕{' '}
                                {nota.descripcion}
                              </TableCell>

                              {/* TAPER */}

                              <TableCell
                                align="center"
                                sx={{
                                  fontSize: '8pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.25,
                                  px: 0.5,

                                  color:
                                    '#334155',
                                }}
                              >
                                —
                              </TableCell>

                              {/* PAPA FRITA */}

                              {mostrarPapaFrita && (
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontSize:
                                      '8pt',

                                    border:
                                      '1px solid #475569',

                                    py: 0.25,
                                    px: 0.5,

                                    color:
                                      '#334155',
                                  }}
                                >
                                  —
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          }
        )}
      </Box>
    </Box>
  );
});

ReporteDiarioPDF.displayName ='ReporteDiarioPDF';