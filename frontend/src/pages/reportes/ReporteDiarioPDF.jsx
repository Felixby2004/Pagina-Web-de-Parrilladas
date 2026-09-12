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
  return (
    <Box
      ref={ref}
      sx={{
        width: '297mm',
        minHeight: '210mm',
        p: '5mm 6mm',
        bgcolor: '#ffffff',
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
          color: '#1a1a1a',
          letterSpacing: 0.5,
          mb: 1,
        }}
      >
        Lista de Pedidos
      </Typography>

      <Divider sx={{ mb: 1.5, borderColor: '#ddd' }} />

      {data.map((cliente, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1.25,
            mb: 1.25,
          }}
        >
          {cliente.pedidos.map((pedido, pIdx) => {
            const observaciones = (pedido.notas || []).filter((nota) => nota.tipo === 'OBSERVACION');
            const mostrarPapaFrita = cliente.pedidos.some((item) =>
              (item.detalles || []).some((detalle) => detalle.usaPapaFrita)
            );

            return (
              <Box
                key={pIdx}
                className="pdf-pedido"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(30%, 0.75fr) minmax(0, 2fr)',
                  gap: 0.75,
                  alignItems: 'start',
                  minWidth: 0,
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
                      fontSize: '10pt',
                      bgcolor: '#fff3e0',
                      py: 0.25,
                      px: 0.75,
                      borderRadius: '3px',
                      color: '#7a3b00',
                    }}
                  >
                    {cliente.cliente}
                  </Typography>
                  {observaciones.length > 0 && (
                    <Box sx={{ mt: 0.25 }}>
                      <Typography sx={{ fontSize: '7pt', fontWeight: 'bold', color: '#2c3e50' }}>
                        Notas:
                      </Typography>
                      {observaciones.map((nota, notaIdx) => (
                        <Typography
                          key={notaIdx}
                          sx={{ fontSize: '7pt', lineHeight: 1.15, fontStyle: 'italic', color: 'text.secondary' }}
                        >
                          • {nota.texto}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>

                <TableContainer sx={{ minWidth: 0 }}>
                  <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                        <TableCell
                          sx={{
                            fontSize: '7pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.25,
                            px: 0.5,
                            color: '#495057',
                          }}
                        >
                          Cantidad
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '7pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.25,
                            px: 0.5,
                            color: '#495057',
                          }}
                        >
                          Producto
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '7pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.25,
                            px: 0.5,
                            color: '#495057',
                          }}
                        >
                          Taper
                        </TableCell>
                        {mostrarPapaFrita && <TableCell
                          align="center"
                          sx={{
                            fontSize: '7pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.25,
                            px: 0.5,
                            color: '#495057',
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
                            '&:nth-of-type(even)': { bgcolor: '#f1f8e9' },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: '7pt',
                              border: 'none',
                              py: 0.15,
                              px: 0.5,
                            }}
                          >
                            {detalle.cantidad}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '7pt',
                              border: 'none',
                              py: 0.15,
                              px: 0.5,
                            }}
                          >
                            {detalle.producto?.nombre || 'Producto eliminado'}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: '7pt',
                              border: 'none',
                              py: 0.15,
                              px: 0.5,
                              fontWeight: detalle.usaTaper ? 'bold' : 'normal',
                              color: detalle.usaTaper ? '#2e7d32' : '#aaa',
                            }}
                          >
                            {detalle.usaTaper ? '✔' : '—'}
                          </TableCell>
                          {mostrarPapaFrita && <TableCell
                            align="center"
                            sx={{
                              fontSize: '7pt',
                              border: 'none',
                              py: 0.15,
                              px: 0.5,
                              fontWeight: detalle.usaPapaFrita ? 'bold' : 'normal',
                              color: detalle.usaPapaFrita ? '#2e7d32' : '#aaa',
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
                              bgcolor: '#fff8e1',
                              '&:nth-of-type(even)': { bgcolor: '#fff3d6' },
                            }}
                          >
                            <TableCell
                              sx={{
                                fontSize: '7pt',
                                border: 'none',
                                py: 0.15,
                                px: 0.5,
                              }}
                            >
                              {nota.cantidad}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: '7pt',
                                border: 'none',
                                py: 0.15,
                                px: 0.5,
                                fontStyle: 'italic',
                              }}
                            >
                              ➕ {nota.descripcion}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '7pt',
                                border: 'none',
                                py: 0.15,
                                px: 0.5,
                                color: '#aaa',
                              }}
                            >
                              —
                            </TableCell>
                            {mostrarPapaFrita && <TableCell
                              align="center"
                              sx={{
                                fontSize: '7pt',
                                border: 'none',
                                py: 0.15,
                                px: 0.5,
                                color: '#aaa',
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