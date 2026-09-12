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
        boxSizing: 'border-box',
        bgcolor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',
        p: 0,
      }}
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 10mm;
        }

        /* CONTENEDOR DE MULTICOLUMNA DE ALTO COMPLETO CON FLUJO NATIVO */
        .pdf-columns-wrapper {
          column-count: 2 !important;
          column-gap: 20px !important;
          column-fill: auto !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* TARJETA INDIVISIBLE (CADA PEDIDO CON SU CLIENTE) */
        .pdf-pedido-card {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          margin-bottom: 14px !important;

          /* EVITA QUE EL NAVEGADOR CORTE LA TARJETA EN MEDIO DE UN SALTO DE HOJA/COLUMNA */
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
        }

        /* ESTRUCTURA NOMBRE CLIENTE + TABLA */
        .pdf-card-flex {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 12px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .pdf-card-sidebar {
          width: 130px !important;
          flex-shrink: 0 !important;
        }

        .pdf-card-main {
          flex-grow: 1 !important;
          min-width: 0 !important;
        }

        .pdf-tabla {
          width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
        }

        .pdf-tabla tr {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            font-size: 12pt !important;
          }

          .reporte-pdf {
            width: 100% !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          .pdf-columns-wrapper {
            column-count: 2 !important;
            column-gap: 20px !important;
            column-fill: auto !important;
            width: 100% !important;
          }

          .pdf-pedido-card {
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

      {/* ENCABEZADO DE PÁGINA */}
      <Box className="pdf-encabezado" sx={{ mb: 2 }}>
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

        <Divider sx={{ borderColor: '#475569', borderWidth: '1px' }} />
      </Box>

      {/* REJILLA DE 2 COLUMNAS NATIVAS DE HOJA A4 */}
      <div className="pdf-columns-wrapper">
        {pedidos.map(({ clienteNombre, pedidosCliente, pedido }, pIdx) => {
          const observaciones = (pedido.notas || []).filter(
            (nota) => nota.tipo === 'OBSERVACION'
          );

          const mostrarPapaFrita = pedidosCliente.some((item) =>
            (item.detalles || []).some((detalle) => detalle.usaPapaFrita)
          );

          return (
            <div
              key={pedido.id ?? `${clienteNombre}-${pIdx}`}
              className="pdf-pedido-card"
            >
              <div className="pdf-card-flex">
                {/* BLOQUE DE CLIENTE Y NOTAS */}
                <div className="pdf-card-sidebar">
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '11pt',
                      lineHeight: 1.25,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      bgcolor: '#fef3c7',
                      py: 0.6,
                      px: 0.8,
                      border: '2px solid #b45309',
                      borderRadius: '4px',
                      color: '#111827',
                    }}
                  >
                    {clienteNombre}
                  </Typography>

                  {observaciones.length > 0 && (
                    <Box sx={{ mt: 1 }}>
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
                            fontSize: '9pt',
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
                </div>

                {/* TABLA DE PRODUCTOS DEL PEDIDO */}
                <div className="pdf-card-main">
                  <TableContainer sx={{ width: '100%', overflow: 'hidden' }}>
                    <Table className="pdf-tabla" size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#0f172a' }}>
                          <TableCell
                            sx={{
                              width: '20%',
                              fontSize: '10pt',
                              fontWeight: 'bold',
                              border: '1px solid #1e293b',
                              py: 0.5,
                              px: 0.8,
                              color: '#ffffff',
                            }}
                          >
                            Cant.
                          </TableCell>

                          <TableCell
                            sx={{
                              width: mostrarPapaFrita ? '44%' : '56%',
                              fontSize: '10pt',
                              fontWeight: 'bold',
                              border: '1px solid #1e293b',
                              py: 0.5,
                              px: 0.8,
                              color: '#ffffff',
                            }}
                          >
                            Producto
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{
                              width: mostrarPapaFrita ? '18%' : '24%',
                              fontSize: '10pt',
                              fontWeight: 'bold',
                              border: '1px solid #1e293b',
                              py: 0.5,
                              px: 0.8,
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
                                fontSize: '10pt',
                                fontWeight: 'bold',
                                border: '1px solid #1e293b',
                                py: 0.5,
                                px: 0.8,
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
                                fontSize: '10pt',
                                border: '1px solid #475569',
                                py: 0.4,
                                px: 0.8,
                              }}
                            >
                              {detalle.cantidad}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '10pt',
                                border: '1px solid #475569',
                                py: 0.4,
                                px: 0.8,
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {detalle.producto?.nombre ||
                                'Producto eliminado'}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '10pt',
                                border: '1px solid #475569',
                                py: 0.4,
                                px: 0.8,
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
                                  fontSize: '10pt',
                                  border: '1px solid #475569',
                                  py: 0.4,
                                  px: 0.8,
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
                                  fontSize: '10pt',
                                  border: '1px solid #475569',
                                  py: 0.4,
                                  px: 0.8,
                                }}
                              >
                                {nota.cantidad}
                              </TableCell>

                              <TableCell
                                sx={{
                                  fontSize: '10pt',
                                  border: '1px solid #475569',
                                  py: 0.4,
                                  px: 0.8,
                                  fontStyle: 'italic',
                                  overflowWrap: 'anywhere',
                                }}
                              >
                                ➕ {nota.descripcion}
                              </TableCell>

                              <TableCell
                                align="center"
                                sx={{
                                  fontSize: '10pt',
                                  border: '1px solid #475569',
                                  py: 0.4,
                                  px: 0.8,
                                  color: '#334155',
                                }}
                              >
                                —
                              </TableCell>

                              {mostrarPapaFrita && (
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontSize: '10pt',
                                    border: '1px solid #475569',
                                    py: 0.4,
                                    px: 0.8,
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