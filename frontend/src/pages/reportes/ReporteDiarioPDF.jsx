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

        // Padding vertical y horizontal de la hoja
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
        @page {
          size: A4 landscape;
          margin: 10mm 12mm;
        }

        @media print {
          .reporte-pdf {
            width: auto !important;
            min-height: auto !important;
            padding: 0 !important;
          }

          /*
           * Evita que un pedido se corte entre dos hojas.
           * Si no entra completo, pasa a la siguiente hoja.
           */
          .pdf-pedido {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          /*
           * Si una tabla llegara a dividirse,
           * conserva correctamente su encabezado.
           */
          .pdf-tabla thead {
            display: table-header-group;
          }

          .pdf-tabla tr,
          .pdf-tabla td,
          .pdf-tabla th {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
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

        <Divider sx={{ borderColor: '#475569' }} />
      </Box>

      {/*
        Ya NO se limita a una cantidad fija de pedidos por página.

        Los pedidos se acomodan según su altura real.
        Cuando un pedido no entra completo al final de una página,
        comienza en la siguiente.
      */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',

          // Espacio horizontal entre ambas columnas
          columnGap: '5mm',

          // Espacio vertical entre pedidos
          rowGap: '3mm',

          alignItems: 'start',
        }}
      >
        {pedidos.map(
          ({ clienteNombre, pedidosCliente, pedido }, pIdx) => {
            const observaciones = (pedido.notas || []).filter(
              (nota) => nota.tipo === 'OBSERVACION'
            );

            /*
             * Mostrar la columna Papa Frita si alguno
             * de los pedidos del cliente usa papa frita.
             */
            const mostrarPapaFrita = pedidosCliente.some((item) =>
              (item.detalles || []).some(
                (detalle) => detalle.usaPapaFrita
              )
            );

            return (
              <Box
                key={pedido.id ?? `${clienteNombre}-${pIdx}`}
                className="pdf-pedido"
                sx={{
                  display: 'grid',

                  /*
                   * Columna izquierda:
                   * nombre + observaciones.
                   *
                   * Columna derecha:
                   * tabla del pedido.
                   */
                  gridTemplateColumns:
                    'minmax(31%, 0.8fr) minmax(0, 2fr)',

                  gap: 0.75,
                  alignItems: 'start',
                  minWidth: 0,
                  boxSizing: 'border-box',

                  /*
                   * IMPORTANTE:
                   * evita cortar un pedido entre páginas.
                   */
                  breakInside: 'avoid-page',
                  pageBreakInside: 'avoid',
                  WebkitColumnBreakInside: 'avoid',
                }}
              >
                {/* ========================= */}
                {/* CLIENTE + OBSERVACIONES */}
                {/* ========================= */}

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',

                      fontSize: '10pt',
                      lineHeight: 1.15,

                      /*
                       * Evita que un nombre largo
                       * desborde la columna.
                       */
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

                  {/* OBSERVACIONES */}
                  {observaciones.length > 0 && (
                    <Box sx={{ mt: 0.4 }}>
                      <Typography
                        sx={{
                          fontSize: '8pt',
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
                            fontSize: '8pt',
                            lineHeight: 1.15,
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

                {/* ================= */}
                {/* TABLA DEL PEDIDO */}
                {/* ================= */}

                <TableContainer
                  sx={{
                    minWidth: 0,
                    overflow: 'visible',

                    breakInside: 'avoid-page',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <Table
                    className="pdf-tabla"
                    size="small"
                    sx={{
                      width: '100%',
                      tableLayout: 'fixed',
                      borderCollapse: 'collapse',
                      border: '2px solid #1e293b',
                    }}
                  >
                    {/* ENCABEZADO */}
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#0f172a' }}>
                        {/* CANTIDAD */}
                        <TableCell
                          sx={{
                            width: '17%',
                            fontSize: '8pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
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
                            width: mostrarPapaFrita
                              ? '47%'
                              : '58%',

                            fontSize: '8pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
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
                            width: mostrarPapaFrita
                              ? '18%'
                              : '25%',

                            fontSize: '8pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
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
                              border: '1px solid #1e293b',
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

                    {/* CUERPO */}
                    <TableBody>
                      {/* PRODUCTOS */}
                      {(pedido.detalles || []).map(
                        (detalle, dIdx) => (
                          <TableRow
                            key={
                              detalle.id ??
                              `d-${dIdx}`
                            }
                            sx={{
                              '&:nth-of-type(even)': {
                                bgcolor: '#dbeafe',
                              },

                              breakInside: 'avoid',
                              pageBreakInside: 'avoid',
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

                      {/* ================= */}
                      {/* NOTAS ADICIONALES */}
                      {/* ================= */}

                      {(pedido.notas || [])
                        .filter(
                          (nota) =>
                            nota.tipo === 'ADICIONAL'
                        )
                        .map((nota, nIdx) => (
                          <TableRow
                            key={
                              nota.id ??
                              `n-${nIdx}`
                            }
                            sx={{
                              bgcolor: '#ffedd5',

                              '&:nth-of-type(even)': {
                                bgcolor: '#fed7aa',
                              },

                              breakInside: 'avoid',
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
                                fontStyle: 'italic',
                                overflowWrap:
                                  'anywhere',
                              }}
                            >
                              ➕ {nota.descripcion}
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
                                color: '#334155',
                              }}
                            >
                              —
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
        )}
      </Box>
    </Box>
  );
});

ReporteDiarioPDF.displayName = 'ReporteDiarioPDF';