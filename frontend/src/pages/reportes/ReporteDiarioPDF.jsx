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
        maxWidth: '100%',
        boxSizing: 'border-box',
        bgcolor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',
        p: 2,
      }}
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 10mm 12mm;
        }

        /* GRID RIGIDO DE 2 COLUMNAS (IZQUIERDA Y DERECHA) */
        .pdf-grid-container {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          column-gap: 16px !important;
          row-gap: 12px !important;
          align-items: start !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* TARJETA INDIVISIBLE QUE PROTEGE CONTRA CORTES */
        .pdf-pedido-card {
          width: 100% !important;
          box-sizing: border-box !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
        }

        /* ESTRUCTURA INTERNA: NOMBRE | TABLA */
        .pdf-card-flex {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 10px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .pdf-card-sidebar {
          width: 110px !important;
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
            background: #ffffff !important;
          }

          .reporte-pdf {
            width: 100% !important;
            padding: 0 !important;
          }

          .pdf-encabezado {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .pdf-grid-container {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }

          .pdf-pedido-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
      <Box className="pdf-encabezado" sx={{ mb: 2 }}>
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

        <Divider sx={{ borderColor: '#475569', borderWidth: '1px' }} />
      </Box>

      {/* REJILLA EN 2 COLUMNAS NATIVAS */}
      <div className="pdf-grid-container">
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
                {/* COLUMNA CLIENTE */}
                <div className="pdf-card-sidebar">
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '9pt',
                      lineHeight: 1.2,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      bgcolor: '#fef3c7',
                      py: 0.5,
                      px: 0.6,
                      border: '2px solid #b45309',
                      borderRadius: '3px',
                      color: '#111827',
                    }}
                  >
                    {clienteNombre}
                  </Typography>

                  {observaciones.length > 0 && (
                    <Box sx={{ mt: 0.8 }}>
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

                {/* COLUMNA TABLA */}
                <div className="pdf-card-main">
                  <TableContainer sx={{ width: '100%', overflow: 'hidden' }}>
                    <Table className="pdf-tabla" size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#0f172a' }}>
                          <TableCell
                            sx={{
                              width: '20%',
                              fontSize: '8pt',
                              fontWeight: 'bold',
                              border: '1px solid #1e293b',
                              py: 0.4,
                              px: 0.5,
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
                              width: mostrarPapaFrita ? '18%' : '24%',
                              fontSize: '8pt',
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
                                fontSize: '8pt',
                                fontWeight: 'bold',
                                border: '1px solid #1e293b',
                                py: 0.4,
                                px: 0.5,
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
                                px: 0.5,
                              }}
                            >
                              {detalle.cantidad}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '8pt',
                                border: '1px solid #475569',
                                py: 0.3,
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
                                fontSize: '8pt',
                                border: '1px solid #475569',
                                py: 0.3,
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
                                  fontSize: '8pt',
                                  border: '1px solid #475569',
                                  py: 0.3,
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
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontSize: '8pt',
                                  border: '1px solid #475569',
                                  py: 0.3,
                                  px: 0.5,
                                }}
                              >
                                {nota.cantidad}
                              </TableCell>

                              <TableCell
                                sx={{
                                  fontSize: '8pt',
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
                                  fontSize: '8pt',
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
                                    fontSize: '8pt',
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