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

        .pdf-pedidos-container {
          column-count: 2;
          column-gap: 5mm;
          column-fill: auto;
          height: calc(190mm - 10mm);
          width: 100%;
          column-span: none;
        }

        .pdf-pedido {
          width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: minmax(31%, 0.8fr) minmax(0, 2fr);
          gap: 0.75rem;
          align-items: start;
          box-sizing: border-box;
          break-inside: auto;
          page-break-inside: auto;
          margin-bottom: 5mm;
        }

        .pdf-tabla {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          border: none;
        }

        .pdf-tabla thead {
          display: table-header-group;
        }

        .pdf-tabla-container {
          min-width: 0;
          width: 100%;
          overflow: visible;
          break-inside: auto;
          page-break-inside: auto;
        }

        .pdf-tabla tr,
        .pdf-tabla td,
        .pdf-tabla th {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        @media print {
          .reporte-pdf {
            width: auto !important;
            min-height: auto !important;
            padding: 0 !important;
          }

          .pdf-pedidos-container {
            column-count: 2 !important;
            column-gap: 5mm !important;
            column-fill: auto !important;
            height: calc(190mm - 10mm) !important;
            width: 100% !important;
          }

          .pdf-pedido {
            break-inside: auto !important;
            page-break-inside: auto !important;
            width: 100% !important;
            margin-bottom: 5mm !important;
          }

          .pdf-tabla-container {
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
            fontSize: '18pt',
            color: '#0f172a',
            letterSpacing: 0.5,
            mb: 1,
          }}
        >
          Lista de Pedidos
        </Typography>

        <Divider sx={{ borderColor: '#475569' }} />
      </Box>

      {/* CONTENEDOR DE PEDIDOS */}
      <Box
        className="pdf-pedidos-container"
        sx={{
          columnCount: 2,
          columnGap: '5mm',
          columnFill: 'auto',
          height: 'calc(190mm - 10mm)',
          width: '100%',
        }}
      >
        {pedidos.map(
          ({ clienteNombre, pedidosCliente, pedido }, pIdx) => {
            const observaciones = (pedido.notas || []).filter(
              (nota) => nota.tipo === 'OBSERVACION'
            );

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
                  gridTemplateColumns:
                    'minmax(31%, 0.8fr) minmax(0, 2fr)',
                  gap: 0.75,
                  alignItems: 'start',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  breakInside: 'auto',
                  pageBreakInside: 'auto',
                }}
              >
                {/* CLIENTE Y OBSERVACIONES */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '12pt',
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
                          fontSize: '9.5pt',
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
                            fontSize: '9.5pt',
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

                {/* TABLA DEL PEDIDO */}
                <TableContainer
                  className="pdf-tabla-container"
                  sx={{
                    minWidth: 0,
                    width: '100%',
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
                      borderCollapse: 'collapse',
                      border: 'none',
                    }}
                  >
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#0f172a' }}>
                        <TableCell
                          sx={{
                            width: '17%',
                            fontSize: '9.5pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
                            py: 0.4,
                            px: 0.5,
                            color: '#ffffff',
                          }}
                        >
                          Cantidad
                        </TableCell>

                        <TableCell
                          sx={{
                            width: mostrarPapaFrita ? '47%' : '58%',
                            fontSize: '9.5pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
                            py: 0.4,
                            px: 0.5,
                            color: '#ffffff',
                          }}
                        >
                          Producto
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            width: mostrarPapaFrita ? '18%' : '25%',
                            fontSize: '9.5pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
                            py: 0.4,
                            px: 0.5,
                            color: '#ffffff',
                          }}
                        >
                          Taper
                        </TableCell>

                        {mostrarPapaFrita && (
                          <TableCell
                            align="center"
                            sx={{
                              width: '18%',
                              fontSize: '9.5pt',
                              fontWeight: 'bold',
                              border: '1px solid #1e293b',
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

                    <TableBody>
                      {(pedido.detalles || []).map((detalle, dIdx) => (
                        <TableRow
                          key={detalle.id ?? `d-${dIdx}`}
                          sx={{
                            '&:nth-of-type(even)': {
                              bgcolor: '#dbeafe',
                            },
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: '9.5pt',
                              border: '1px solid #475569',
                              py: 0.35,
                              px: 0.5,
                            }}
                          >
                            {detalle.cantidad}
                          </TableCell>

                          <TableCell
                            sx={{
                              fontSize: '9.5pt',
                              border: '1px solid #475569',
                              py: 0.35,
                              px: 0.5,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {detalle.producto?.nombre ||
                              'Producto eliminado'}
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{
                              fontSize: '9.5pt',
                              border: '1px solid #475569',
                              py: 0.35,
                              px: 0.5,
                              fontWeight: detalle.usaTaper
                                ? 'bold'
                                : 'normal',
                              color: detalle.usaTaper
                                ? '#15803d'
                                : '#334155',
                            }}
                          >
                            {detalle.usaTaper ? '✔' : '—'}
                          </TableCell>

                          {mostrarPapaFrita && (
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '9.5pt',
                                border: '1px solid #475569',
                                py: 0.35,
                                px: 0.5,
                                fontWeight: detalle.usaPapaFrita
                                  ? 'bold'
                                  : 'normal',
                                color: detalle.usaPapaFrita
                                  ? '#15803d'
                                  : '#334155',
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
                              '&:nth-of-type(even)': {
                                bgcolor: '#fed7aa',
                              },
                              breakInside: 'avoid',
                              pageBreakInside: 'avoid',
                            }}
                          >
                            <TableCell
                              sx={{
                                fontSize: '9.5pt',
                                border: '1px solid #475569',
                                py: 0.35,
                                px: 0.5,
                              }}
                            >
                              {nota.cantidad}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '9.5pt',
                                border: '1px solid #475569',
                                py: 0.35,
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
                                fontSize: '9.5pt',
                                border: '1px solid #475569',
                                py: 0.35,
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
                                  fontSize: '9.5pt',
                                  border: '1px solid #475569',
                                  py: 0.35,
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