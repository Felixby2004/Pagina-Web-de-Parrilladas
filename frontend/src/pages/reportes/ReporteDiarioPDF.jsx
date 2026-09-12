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

export const ReporteDiarioPDF = forwardRef(({ data }, ref) => {
  const pedidos = data.flatMap((cliente) =>
    cliente.pedidos.map((pedido) => ({
      cliente: cliente.cliente,
      pedidosCliente: cliente.pedidos,
      pedido,
    }))
  );
  const pedidosPorColumna = 6;
  const pedidosPorPagina = pedidosPorColumna * 2;
  const paginas = Array.from(
    { length: Math.ceil(pedidos.length / pedidosPorPagina) },
    (_, paginaIdx) => pedidos.slice(paginaIdx * pedidosPorPagina, (paginaIdx + 1) * pedidosPorPagina)
  );

  return (
    <Box
      ref={ref}
      sx={{
        width: '297mm',
        minHeight: '210mm',
        p: '5mm 6mm',
        bgcolor: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Título */}
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

      <Divider sx={{ mb: 1.5, borderColor: '#475569' }} />

      {paginas.map((pagina, paginaIdx) => (
        <Box
          key={paginaIdx}
          className="pdf-page"
          sx={{
            minHeight: '185mm',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridTemplateRows: `repeat(${pedidosPorColumna}, minmax(0, auto))`,
            gridAutoFlow: 'column',
            columnGap: 1,
            rowGap: 0.5,
            mb: 0.5,
          }}
        >
          {pagina.map(({ cliente, pedidosCliente, pedido }, pIdx) => {
            const observaciones = (pedido.notas || []).filter((nota) => nota.tipo === 'OBSERVACION');
            const mostrarPapaFrita = pedidosCliente.some((item) =>
              (item.detalles || []).some((detalle) => detalle.usaPapaFrita)
            );

            return (
              <Box
                key={pIdx}
                className="pdf-pedido"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(30%, 0.75fr) minmax(0, 2fr)',
                  gap: 0.5,
                  alignItems: 'start',
                  minWidth: 0,
                  minHeight: '27mm',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      display: 'inline-block',
                      maxWidth: '100%',
                      width: '100%',
                      minHeight: '9mm',
                      boxSizing: 'border-box',
                      fontSize: '10pt',
                      lineHeight: 1.1,
                      overflowWrap: 'anywhere',
                      bgcolor: '#fef3c7',
                      py: 0.25,
                      px: 0.75,
                      border: '2px solid #b45309',
                      borderRadius: '2px',
                      color: '#111827',
                    }}
                  >
                    {cliente.cliente}
                  </Typography>
                  {observaciones.length > 0 && (
                    <Box sx={{ mt: 0.25 }}>
                      <Typography sx={{ fontSize: '8pt', fontWeight: 'bold', color: '#111827' }}>
                        Notas:
                      </Typography>
                      {observaciones.map((nota, notaIdx) => (
                        <Typography
                          key={notaIdx}
                          sx={{ fontSize: '8pt', lineHeight: 1.15, fontStyle: 'italic', color: '#334155' }}
                        >
                          • {nota.texto}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>

                <TableContainer sx={{ minWidth: 0 }}>
                  <Table size="small" sx={{ borderCollapse: 'collapse', border: '2px solid #1e293b' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#0f172a' }}>
                        <TableCell
                          sx={{
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
                        <TableCell
                          sx={{
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
                        <TableCell
                          align="center"
                          sx={{
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
                        {mostrarPapaFrita && <TableCell
                          align="center"
                          sx={{
                            fontSize: '8pt',
                            fontWeight: 'bold',
                            border: '1px solid #1e293b',
                            py: 0.35,
                            px: 0.5,
                            color: '#ffffff',
                          }}
                        >
                          Papa Frita
                        </TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pedido.detalles?.map((detalle, dIdx) => (
                        <TableRow
                          key={`d-${dIdx}`}
                          sx={{
                            '&:nth-of-type(even)': { bgcolor: '#dbeafe' },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: '8pt',
                              border: '1px solid #475569',
                              py: 0.25,
                              px: 0.5,
                            }}
                          >
                            {detalle.cantidad}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '8pt',
                              border: '1px solid #475569',
                              py: 0.25,
                              px: 0.5,
                            }}
                          >
                            {detalle.producto?.nombre || 'Producto eliminado'}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: '8pt',
                              border: '1px solid #475569',
                              py: 0.25,
                              px: 0.5,
                              fontWeight: detalle.usaTaper ? 'bold' : 'normal',
                              color: detalle.usaTaper ? '#15803d' : '#334155',
                            }}
                          >
                            {detalle.usaTaper ? '✔' : '—'}
                          </TableCell>
                          {mostrarPapaFrita && <TableCell
                            align="center"
                            sx={{
                              fontSize: '8pt',
                              border: '1px solid #475569',
                              py: 0.25,
                              px: 0.5,
                              fontWeight: detalle.usaPapaFrita ? 'bold' : 'normal',
                              color: detalle.usaPapaFrita ? '#15803d' : '#334155',
                            }}
                          >
                            {detalle.usaPapaFrita ? '✔' : '—'}
                          </TableCell>}
                        </TableRow>
                      ))}
                      {pedido.notas
                        ?.filter((n) => n.tipo === 'ADICIONAL')
                        .map((nota, nIdx) => (
                          <TableRow
                            key={`n-${nIdx}`}
                            sx={{
                              bgcolor: '#ffedd5',
                              '&:nth-of-type(even)': { bgcolor: '#fed7aa' },
                            }}
                          >
                            <TableCell
                              sx={{
                                fontSize: '8pt',
                                border: '1px solid #475569',
                                py: 0.25,
                                px: 0.5,
                              }}
                            >
                              {nota.cantidad}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: '8pt',
                                border: '1px solid #475569',
                                py: 0.25,
                                px: 0.5,
                                fontStyle: 'italic',
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
                                px: 0.5,
                                color: '#334155',
                              }}
                            >
                              —
                            </TableCell>
                            {mostrarPapaFrita && <TableCell
                              align="center"
                              sx={{
                                fontSize: '8pt',
                                border: '1px solid #475569',
                                py: 0.25,
                                px: 0.5,
                                color: '#334155',
                              }}
                            >
                              —
                            </TableCell>}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
});

ReporteDiarioPDF.displayName = 'ReporteDiarioPDF';