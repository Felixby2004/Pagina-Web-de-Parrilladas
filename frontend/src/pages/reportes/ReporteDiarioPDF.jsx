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
   *        ↓
   * Hoja 1 derecha
   *        ↓
   * Hoja 2 izquierda
   *        ↓
   * Hoja 2 derecha
   *        ↓
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

        p: '8mm 10mm',

        bgcolor: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',

        '@page': {
          size: 'A4 landscape',
          margin: '8mm 10mm',
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
         *
         * Este margen se aplica automáticamente a TODAS las
         * hojas que genere la impresión (no solo la primera),
         * porque @page es una regla global del documento.
         */

        @page {
          size: A4 landscape;
          margin: 8mm 10mm;
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
         * Esto lo logra el navegador de forma NATIVA cuando
         * un contenedor multi-column no cabe en una sola hoja:
         * sigue llenando columnas en las hojas siguientes.
         *
         * Para que esto funcione bien, el contenido de CADA
         * pedido debe poder partirse en flujo normal de bloque
         * (por eso el layout interno usa "float" y no "grid":
         * ver más abajo el porqué).
         */

        .pdf-pedidos-container {
          column-count: 2;
          column-gap: 6mm;
          column-fill: auto;

          height: 180mm;

          width: 100%;

          column-span: none;

          /* Un pequeño respiro para que el contenido no
             empiece pegado justo en el borde superior de
             cada columna/página cuando continúa. */
          padding-top: 1mm;

          /*
           * IMPORTANTE: "overflow" debe quedarse en "visible"
           * (el valor por defecto, así que ni lo escribimos).
           *
           * Cualquier otro valor (hidden, auto, scroll) convierte
           * a este contenedor en "monolítico" para la paginación:
           * el motor de impresión deja de mandar el desborde a la
           * hoja 2, 3... y simplemente lo recorta ahí mismo.
           *
           * La "3ra columna" que se ve en la vista previa del
           * navegador es solo un efecto visual de estar en pantalla
           * (no hay concepto de "hoja" fuera del diálogo de
           * impresión). No afecta al PDF/impresión real.
           */
        }

        /*
         * ========================================================
         * PEDIDO
         * ========================================================
         *
         * Cliente/Notas a la izquierda, tabla a la derecha.
         *
         * IMPORTANTE — POR QUÉ "FLOAT" Y NO "GRID":
         *
         * CSS Grid NO fragmenta de forma confiable dentro de
         * layouts multi-column al imprimir: en vez de partir
         * el pedido donde corresponde, el motor de impresión
         * tiende a empujarlo completo a la siguiente columna,
         * dejando espacios en blanco.
         *
         * Con "float" el bloque de cliente queda flotando a la
         * izquierda y la tabla ocupa el resto del ancho con
         * "margin-left". Así la tabla queda en flujo normal de
         * bloque, y son las FILAS de la tabla (que ya tienen
         * break-inside: avoid) las que deciden el corte real:
         *
         *   columna izquierda (lo que entra)
         *         ↓
         *   columna derecha (el resto de las filas)
         *         ↓
         *   siguiente hoja, columna izquierda
         *         ↓
         *   ...
         */

        .pdf-pedido {
          width: 100%;
          box-sizing: border-box;

          /* Contiene el float interno (evita que el margen
             inferior colapse mal entre pedidos). */
          display: flow-root;

          break-inside: auto;
          page-break-inside: auto;

          margin-bottom: 6mm;
          padding: 1.5mm 2mm;
        }

        .pdf-cliente-info {
          float: left;
          width: 30%;
          box-sizing: border-box;

          /* El bloque de cliente + notas no se parte:
             se queda completo con la primera parte del pedido. */
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .pdf-tabla-container {
          margin-left: 33%;
          min-width: 0;
          width: auto;
          overflow: visible;
          box-sizing: border-box;

          /* La tabla sí puede continuar en la siguiente
             columna/hoja. */
          break-inside: auto;
          page-break-inside: auto;
        }

        /*
         * ========================================================
         * TABLA
         * ========================================================
         *
         * Se elimina únicamente el MARCO EXTERIOR de la tabla.
         * Las líneas internas de las celdas permanecen.
         */

        .pdf-tabla {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          border: none;
        }

        .pdf-tabla thead {
          /* Si la tabla continúa en otra columna/página,
             el encabezado vuelve a aparecer. */
          display: table-header-group;
        }

        /*
         * ========================================================
         * FILAS
         * ========================================================
         *
         * Una fila completa no se parte.
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

          .pdf-pedidos-container {
            column-count: 2 !important;
            column-gap: 6mm !important;
            column-fill: auto !important;

            height: 180mm !important;

            width: 100% !important;

            padding-top: 1mm !important;
          }

          .pdf-pedido {
            display: flow-root !important;

            break-inside: auto !important;
            page-break-inside: auto !important;

            width: 100% !important;

            margin-bottom: 6mm !important;
            padding: 1.5mm 2mm !important;
          }

          .pdf-cliente-info {
            float: left !important;
            width: 30% !important;

            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .pdf-tabla-container {
            margin-left: 33% !important;

            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          .pdf-tabla tr,
          .pdf-tabla td,
          .pdf-tabla th {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .pdf-tabla thead {
            display: table-header-group !important;
          }

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
          columnGap: '6mm',
          columnFill: 'auto',

          height: '180mm',

          width: '100%',

          pt: '1mm',
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
                  width: '100%',
                  boxSizing: 'border-box',

                  display: 'flow-root',

                  breakInside: 'auto',
                  pageBreakInside: 'auto',

                  mb: '6mm',
                  p: '1.5mm 2mm',
                }}
              >
                {/* =================================================
                    CLIENTE + OBSERVACIONES (flota a la izquierda)
                    ================================================= */}

                <Box
                  className="pdf-cliente-info"
                  sx={{
                    float: 'left',
                    width: '30%',
                    boxSizing: 'border-box',

                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
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

                  {/* ===============================================
                      OBSERVACIONES
                      =============================================== */}

                  {observaciones.length > 0 && (
                    <Box
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '9pt',
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
                              fontSize: '8.5pt',
                              lineHeight: 1.2,
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
                    TABLA DEL PEDIDO (a la derecha del cliente)
                    ================================================= */}

                <TableContainer
                  className="pdf-tabla-container"
                  sx={{
                    marginLeft: '33%',

                    minWidth: 0,
                    width: 'auto',

                    overflow: 'visible',

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

                            fontSize: '9pt',
                            fontWeight: 'bold',

                            border:
                              '1px solid #1e293b',

                            py: 0.4,
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

                            fontSize: '9pt',
                            fontWeight: 'bold',

                            border:
                              '1px solid #1e293b',

                            py: 0.4,
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

                            fontSize: '9pt',
                            fontWeight: 'bold',

                            border:
                              '1px solid #1e293b',

                            py: 0.4,
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

                              fontSize: '9pt',
                              fontWeight: 'bold',

                              border:
                                '1px solid #1e293b',

                              py: 0.4,
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

                              breakInside:
                                'avoid',
                              pageBreakInside:
                                'avoid',
                            }}
                          >
                            {/* CANTIDAD */}

                            <TableCell
                              sx={{
                                fontSize: '9pt',

                                border:
                                  '1px solid #475569',

                                py: 0.3,
                                px: 0.5,
                              }}
                            >
                              {detalle.cantidad}
                            </TableCell>

                            {/* PRODUCTO */}

                            <TableCell
                              sx={{
                                fontSize: '9pt',

                                border:
                                  '1px solid #475569',

                                py: 0.3,
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
                                fontSize: '9pt',

                                border:
                                  '1px solid #475569',

                                py: 0.3,
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
                                  fontSize: '9pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.3,
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

                                breakInside:
                                  'avoid',
                                pageBreakInside:
                                  'avoid',
                              }}
                            >
                              {/* CANTIDAD */}

                              <TableCell
                                sx={{
                                  fontSize: '9pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.3,
                                  px: 0.5,
                                }}
                              >
                                {nota.cantidad}
                              </TableCell>

                              {/* DESCRIPCIÓN */}

                              <TableCell
                                sx={{
                                  fontSize: '9pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.3,
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
                                  fontSize: '9pt',

                                  border:
                                    '1px solid #475569',

                                  py: 0.3,
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
                                      '9pt',

                                    border:
                                      '1px solid #475569',

                                    py: 0.3,
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

ReporteDiarioPDF.displayName =
  'ReporteDiarioPDF';
