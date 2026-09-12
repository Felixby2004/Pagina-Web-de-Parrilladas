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

        '@page': {
          size: 'A4 landscape',
          margin: '10mm 12mm', // Margen exacto para la impresora/PDF
        },

        '@media print': {
          width: '100% !important',
          p: '0 !important',
          bgcolor: '#ffffff',
        },
      }}
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 10mm 12mm;
        }

        /* CONFIGURACIÓN DE MULTI-COLUMNA CON FLUJO CONTINUO VERTICAL */
        .pdf-columns-wrapper {
          column-count: 2 !important;
          column-gap: 12mm !important;
          column-fill: auto !important; /* Fuerza a llenar 1ro columna izq, luego columna der */
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* TARJETA INDIVISIBLE QUE SALTA LIMPIAMENTE DE COLUMNA Y PÁGINA */
        .pdf-pedido-card {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          margin-bottom: 5mm !important;

          /* REGLAS OBLIGATORIAS DE NO-ROPTURA PARA NAVEGADORES */
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
        }

        /* FLEXBOX SIMPLE DE 2 COLUMNAS INTERNAS (NOMBRE | TABLA) */
        .pdf-card-flex {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 8px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .pdf-card-sidebar {
          width: 105px !important;
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
          }

          .reporte-pdf {
            width: 100% !important;
            padding: 0 !important;
          }

          .pdf-columns-wrapper {
            column-count: 2 !important;
            column-gap: 12mm !important;
            column-fill: auto !important;
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
            fontSize: '16pt',
            color: '#0f172a',
            letterSpacing: 0.5,
            mb: 0.8,
          }}
        >
          Lista de Pedidos
        </Typography>

        <Divider sx={{ borderColor: '#475569', borderWidth: '1px' }} />
      </Box>

      {/* CONTENEDOR PRINCIPAL MULTI-COLUMNA */}
      <div className="pdf-columns-wrapper">
        {pedidos.map(({ clienteNombre, pedidosCliente, pedido }, pIdx) => {
          const observaciones = (pedido.notas || []).filter(
            (nota) => nota.tipo === 'OBSERVACION'
          );

          const mostrarPapaFrita = pedidosCliente.some((item) =>
            (item.detalles || []).some((detalle) => detalle.usaPapaFrita)
          );

          return (
            /* CADA TARJETA ES INDIVISIBLE Y SE ACOMODA EN EL FLUJO NATIVO */
            <div
              key={pedido.id ?? `${clienteNombre}-${pIdx}`}
              className="pdf-pedido-card"
            >
              <div className="pdf-card-flex">
                {/* COLUMNA IZQUIERDA DE LA TARJETA: NOMBRE CLIENTE Y NOTAS */}
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
                      py: 0.4,
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

                {/* COLUMNA DERECHA DE LA TARJETA: TABLA DEL PEDIDO */}
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
                              py: 0.25,
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
                              py: 0.25,
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
                              py: 0.25,
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
                                py: 0.25,
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
                                py: 0.25,
                                px: 0.4,
                              }}
                            >
                              {detalle.cantidad}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '8pt',
                                border: '1px solid #475569',
                                py: 0.25,
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
                                py: 0.25,
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
                                  py: 0.25,
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
                                  py: 0.25,
                                  px: 0.4,
                                }}
                              >
                                {nota.cantidad}
                              </TableCell>

                              <TableCell
                                sx={{
                                  fontSize: '8pt',
                                  border: '1px solid #475569',
                                  py: 0.25,
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
                                  py: 0.25,
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
                                    py: 0.25,
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