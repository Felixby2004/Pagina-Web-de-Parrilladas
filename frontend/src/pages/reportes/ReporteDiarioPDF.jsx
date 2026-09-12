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
        width: '100%',
        maxWidth: '273mm', // A4 Landscape (297mm) menos márgenes seguros (12mm x 2)
        margin: '0 auto',
        boxSizing: 'border-box',
        p: '8mm 10mm',
        bgcolor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',

        '@page': {
          size: 'A4 landscape',
          margin: '12mm 14mm', // Margen real de la hoja para que el impresor/navegador no corte los bordes
        },

        '@media print': {
          width: '100% !important',
          maxWidth: 'none !important',
          p: '0 !important',
          bgcolor: '#ffffff',
        },
      }}
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 12mm 14mm;
        }

        /* CONTENEDOR DE MULTI-COLUMNA CON ESPACIADO SEGURO */
        .pdf-columns-wrapper {
          column-count: 2 !important;
          column-gap: 10mm !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* TARJETA INDIVISIBLE (BLANCO COMPLETO Y MARGEN INFERIOR DE PROTECCIÓN) */
        .pdf-pedido-card {
          display: inline-block !important; /* inline-block fuerza a Chromium a no romper bloques en multi-column */
          width: 100% !important;
          box-sizing: border-box !important;
          margin-bottom: 6mm !important;
          padding-top: 1mm !important;
          padding-bottom: 1mm !important;

          /* Reglas estrictas de salto de página */
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          break-inside: avoid-page !important;
        }

        /* ESTRUCTURA FIJA INTERNA (NOMBRE Y NOTAS // TABLA) */
        .pdf-card-layout {
          display: table;
          width: 100%;
          table-layout: fixed;
        }

        .pdf-card-sidebar {
          display: table-cell;
          width: 110px;
          vertical-align: top;
          padding-right: 8px;
        }

        .pdf-card-main {
          display: table-cell;
          vertical-align: top;
        }

        .pdf-tabla {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }

        .pdf-tabla tr {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        @media print {
          .reporte-pdf {
            width: 100% !important;
            padding: 0 !important;
          }

          .pdf-columns-wrapper {
            column-count: 2 !important;
            column-gap: 10mm !important;
          }

          .pdf-pedido-card {
            display: inline-block !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-column-break-inside: avoid !important;
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
          mb: 2,
          breakAfter: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        <Typography
          align="center"
          variant="h5"
          fontWeight="bold"
          sx={{
            fontSize: '17pt',
            color: '#0f172a',
            letterSpacing: 0.5,
            mb: 1,
          }}
        >
          Lista de Pedidos
        </Typography>

        <Divider sx={{ borderColor: '#475569', borderWidth: '1px' }} />
      </Box>

      {/* CONTENEDOR EN 2 COLUMNAS CONTINUAS */}
      <div className="pdf-columns-wrapper">
        {pedidos.map(({ clienteNombre, pedidosCliente, pedido }, pIdx) => {
          const observaciones = (pedido.notas || []).filter(
            (nota) => nota.tipo === 'OBSERVACION'
          );

          const mostrarPapaFrita = pedidosCliente.some((item) =>
            (item.detalles || []).some((detalle) => detalle.usaPapaFrita)
          );

          return (
            /* TARJETA TOTALMENTE PROTEGIDA DE CORTES HORIZONTALES */
            <div
              key={pedido.id ?? `${clienteNombre}-${pIdx}`}
              className="pdf-pedido-card"
            >
              <div className="pdf-card-layout">
                {/* LADO IZQUIERDO: NOMBRE Y NOTAS */}
                <div className="pdf-card-sidebar">
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '9.5pt',
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
                </div>

                {/* LADO DERECHO: TABLA DEL PEDIDO */}
                <div className="pdf-card-main">
                  <TableContainer sx={{ width: '100%' }}>
                    <Table className="pdf-tabla" size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#0f172a' }}>
                          <TableCell
                            sx={{
                              width: '20%',
                              fontSize: '8pt',
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
                              fontSize: '8pt',
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
                              fontSize: '8pt',
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
                                fontSize: '8pt',
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
                                fontSize: '8pt',
                                border: '1px solid #475569',
                                py: 0.3,
                                px: 0.4,
                              }}
                            >
                              {detalle.cantidad}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '8pt',
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
                                fontSize: '8pt',
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
                                  fontSize: '8pt',
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
                                  fontSize: '8pt',
                                  border: '1px solid #475569',
                                  py: 0.3,
                                  px: 0.4,
                                }}
                              >
                                {nota.cantidad}
                              </TableCell>

                              <TableCell
                                sx={{
                                  fontSize: '8pt',
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
                                  fontSize: '8pt',
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
                                    fontSize: '8pt',
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
});

ReporteDiarioPDF.displayName = 'ReporteDiarioPDF';