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

export const ReporteDiarioPDF = forwardRef(({ data, fecha }, ref) => {

  return (
    <Box
      ref={ref}
      sx={{
        width: '297mm',
        minHeight: '210mm',
        p: '6mm 8mm',
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
          mb: 1.5,
        }}
      >
        Lista de Pedidos
      </Typography>

      <Divider sx={{ mb: 2, borderColor: '#ddd' }} />

      {data.map((cliente, idx) => (
        <Box key={idx} sx={{ mb: 3, pageBreakInside: 'avoid' }}>
          {/* Nombre del cliente con notas de los pedidos (OBSERVACIONES) al lado */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                fontSize: '13pt',
                bgcolor: '#fff3e0',
                py: 0.5,
                px: 1.5,
                borderRadius: '4px',
                color: '#7a3b00',
                mr: 2,
              }}
            >
              {cliente.cliente}
            </Typography>

            {/* Mostrar observaciones por pedido junto al nombre del cliente (no incluir ADICIONAL) */}
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', maxWidth: '55%' }}>
              {(cliente.pedidos || []).map((p) => {
                const obs = (p.notas || []).filter(n => n.tipo === 'OBSERVACION');
                if (!obs || obs.length === 0) return null;
                return (
                  <Box key={p.id} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '9pt', fontWeight: 'bold', color: '#2c3e50' }}>Notas:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {obs.map((o, i) => (
                        <Typography key={i} sx={{ fontSize: '8pt', fontStyle: 'italic', color: 'text.secondary' }}>
                          • {o.texto}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {cliente.pedidos.map((pedido, pIdx) => {
            // notas de tipo ADICIONAL se muestran en la tabla; OBSERVACION ya mostrado junto al cliente
            return (
              <Box key={pIdx} sx={{ mb: 2, ml: 1 }}>

                {/* Tabla de productos */}
                <TableContainer sx={{ mb: 0.5 }}>
                  <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                        <TableCell
                          sx={{
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.5,
                            px: 1,
                            color: '#495057',
                          }}
                        >
                          Cantidad
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.5,
                            px: 1,
                            color: '#495057',
                          }}
                        >
                          Producto
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.5,
                            px: 1,
                            color: '#495057',
                          }}
                        >
                          Taper
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            border: 'none',
                            py: 0.5,
                            px: 1,
                            color: '#495057',
                          }}
                        >
                          Papa Frita
                        </TableCell>
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
                              fontSize: '10pt',
                              border: 'none',
                              py: 0.3,
                              px: 1,
                            }}
                          >
                            {detalle.cantidad}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '10pt',
                              border: 'none',
                              py: 0.3,
                              px: 1,
                            }}
                          >
                            {detalle.producto?.nombre || 'Producto eliminado'}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: '10pt',
                              border: 'none',
                              py: 0.3,
                              px: 1,
                              fontWeight: detalle.usaTaper ? 'bold' : 'normal',
                              color: detalle.usaTaper ? '#2e7d32' : '#aaa',
                            }}
                          >
                            {detalle.usaTaper ? '✔' : '—'}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: '10pt',
                              border: 'none',
                              py: 0.3,
                              px: 1,
                              fontWeight: detalle.usaPapaFrita ? 'bold' : 'normal',
                              color: detalle.usaPapaFrita ? '#2e7d32' : '#aaa',
                            }}
                          >
                            {detalle.usaPapaFrita ? '✔' : '—'}
                          </TableCell>
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
                                fontSize: '10pt',
                                border: 'none',
                                py: 0.3,
                                px: 1,
                              }}
                            >
                              {nota.cantidad}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: '10pt',
                                border: 'none',
                                py: 0.3,
                                px: 1,
                                fontStyle: 'italic',
                              }}
                            >
                              ➕ {nota.descripcion}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '10pt',
                                border: 'none',
                                py: 0.3,
                                px: 1,
                                color: '#aaa',
                              }}
                            >
                              —
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '10pt',
                                border: 'none',
                                py: 0.3,
                                px: 1,
                                color: '#aaa',
                              }}
                            >
                              —
                            </TableCell>
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