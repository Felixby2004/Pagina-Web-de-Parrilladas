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
        boxSizing: 'border-box',
        p: '10mm 12mm',
        bgcolor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',

        '@page': {
          size: 'A4 landscape',
          margin: '10mm 12mm',
        },

        '@media print': {
          width: '100%',
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

        .pdf-grid-container {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6mm 8mm;
          width: 100%;
          box-sizing: border-box;
        }

        .pdf-pedido-card {
          width: 100%;
          box-sizing: border-box;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          margin-bottom: 2mm;
        }

        .pdf-pedido-layout {
          display: grid;
          grid-template-columns: 110px minmax(0, 1fr);
          gap: 0.5rem;
          align-items: start;
          width: 100%;
        }

        .pdf-tabla {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }

        @media print {
          .reporte-pdf {
            width: 100% !important;
            padding: 0 !important;
          }

          .pdf-grid-container {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 6mm 8mm !important;
          }

          .pdf-pedido-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .pdf-encabezado {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
      <Box
        className="pdf-encabezado"
        sx={{
          mb: 1.5,
          breakAfter: 'avoid',
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

      {/* CONTENEDOR EN GRID DE 2 COLUMNAS */}
      <Box className="pdf-grid-container">
        {pedidos.map(({ clienteNombre, pedidosCliente, pedido }, pIdx) => {
          const observaciones = (pedido.notas || []).filter(
            (nota) => nota.tipo === 'OBSERVACION'
          );

          const mostrarPapaFrita = pedidosCliente.some((item) =>
            (item.detalles || []).some((detalle) => detalle.usaPapaFrita)
          );

          return (
            /* TARJETA UNIFICADA (Evita roturas entre nombre y tabla) */
            <Box
              key={pedido.id ?? `${clienteNombre}-${pIdx}`}
              className="pdf-pedido-card"
            >
              <Box className="pdf-pedido-layout">
                {/* CLIENTE Y OBSERVACIONES */}
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
                      px: 0.5,
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
                            fontSize: '9pt',
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

                {/* TABLA DEL PEDIDO */}
                <TableContainer sx={{ minWidth: 0, width: '100%' }}>
                  <Table className="pdf-tabla" size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#0f172a' }}>
                        <TableCell
                          sx={{
                            width: '20%',
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
                            py: 0.3,
                            px: 0.4,
                            color: '#ffffff',
                          }}
                        >
                          Cant.
                        </TableCell>

                        <TableCell
                          sx={{
                            width: mostrarPapaFrita ? '44%' : '56%',
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
                            py: 0.3,
                            px: 0.4,
                            color: '#ffffff',
                          }}
                        >
                          Producto
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            width: mostrarPapaFrita ? '18%' : '24%',
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
                            py: 0.3,
                            px: 0.4,
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
                              fontSize: '9pt',
                              fontWeight: 'bold',
                              border: '1px solid #1e293b',
                              py: 0.3,
                              px: 0.4,
                              color: '#ffffff',
                            }}
                          >
                            P. Frita
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
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: '9pt',
                              border: '1px solid #475569',
                              py: 0.3,
                              px: 0.4,
                            }}
                          >
                            {detalle.cantidad}
                          </TableCell>

                          <TableCell
                            sx={{
                              fontSize: '9pt',
                              border: '1px solid #475569',
                              py: 0.3,
                              px: 0.4,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {detalle.producto?.nombre ||
                              'Producto eliminado'}
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{
                              fontSize: '9pt',
                              border: '1px solid #475569',
                              py: 0.3,
                              px: 0.4,
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
                                fontSize: '9pt',
                                border: '1px solid #475569',
                                py: 0.3,
                                px: 0.4,
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
                            }}
                          >
                            <TableCell
                              sx={{
                                fontSize: '9pt',
                                border: '1px solid #475569',
                                py: 0.3,
                                px: 0.4,
                              }}
                            >
                              {nota.cantidad}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '9pt',
                                border: '1px solid #475569',
                                py: 0.3,
                                px: 0.4,
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
                                px: 0.4,
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
                                  px: 0.4,
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

ReporteDiarioPDF.displayName = 'ReporteDiarioPDF';