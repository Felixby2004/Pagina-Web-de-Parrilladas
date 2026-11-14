import { jsPDF } from 'jspdf';

const MARGEN = 10;
const SEPARACION_COLUMNAS = 6;
const SEPARACION_PEDIDOS = 5;
const ALTO_LINEA = 4.6;
const RELLENO_CELDA = 1.5;
const ANCHO_CLIENTE = 41;
const SEPARACION_TABLA = 3;
const ALTO_ENCABEZADO_TABLA = 7;
const CARACTERES_FUERA_DE_WIN_ANSI = /[^\x20-\x7e\u00a0-\u00ff\r\n\t€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/u;

const altoCelda = (lineas) => ALTO_LINEA * lineas + 2 * RELLENO_CELDA;

export function crearReporteDiarioPdf(data) {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const anchoPagina = pdf.internal.pageSize.getWidth();
  const limiteInferior = pdf.internal.pageSize.getHeight() - MARGEN;
  const anchoColumna = (anchoPagina - 2 * MARGEN - SEPARACION_COLUMNAS) / 2;
  const anchoTabla = anchoColumna - ANCHO_CLIENTE - SEPARACION_TABLA;
  let columna = 0;
  let inicioColumna = MARGEN + 13;
  let y = inicioColumna;
  let contextoTexto;

  pdf.setTextColor('#0f172a');
  pdf.setDrawColor('#475569');
  pdf.setFont('helvetica', 'bold').setFontSize(16);
  pdf.text('Lista de Pedidos', anchoPagina / 2, MARGEN + 6.5, { align: 'center' });
  pdf.line(MARGEN, MARGEN + 9, anchoPagina - MARGEN, MARGEN + 9);

  function avanzarColumna() {
    if (columna === 1) {
      pdf.addPage();
      columna = 0;
      inicioColumna = MARGEN;
    } else {
      columna = 1;
    }
    y = inicioColumna;
  }

  function envolverTexto(texto, ancho, estilo = 'normal', tamano = 9) {
    const contenido = String(texto ?? '').replace(/\t/g, ' ');
    const anchoTexto = ancho - 2 * RELLENO_CELDA;
    pdf.setFont('helvetica', estilo).setFontSize(tamano);
    return contenido.split(/\r?\n/).flatMap((linea) => {
      if (!usaFuenteDelNavegador(linea)) return pdf.splitTextToSize(linea, anchoTexto);

      const contexto = prepararFuenteDelNavegador(estilo, tamano);
      const maximoPx = anchoTexto * 96 / 25.4;
      const lineas = [];
      let actual = '';
      for (const palabra of linea.split(/\s+/)) {
        const siguiente = actual ? `${actual} ${palabra}` : palabra;
        if (contexto.measureText(siguiente).width <= maximoPx) {
          actual = siguiente;
          continue;
        }

        if (actual) lineas.push(actual);
        actual = '';
        const caracteres = segmentador
          ? Array.from(segmentador.segment(palabra), ({ segment }) => segment)
          : palabra;
        for (const segment of caracteres) {
          if (actual && contexto.measureText(actual + segment).width > maximoPx) {
            lineas.push(actual);
            actual = '';
          }
          actual += segment;
        }
      }
      lineas.push(actual);
      return lineas;
    });
  }

  const segmentador = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('es', { granularity: 'grapheme' })
    : null;
  const usaFuenteDelNavegador = (texto) =>
    typeof document !== 'undefined' && CARACTERES_FUERA_DE_WIN_ANSI.test(texto);

  function prepararFuenteDelNavegador(estilo, tamano) {
    contextoTexto ??= document.createElement('canvas').getContext('2d');
    contextoTexto.font = `${estilo} ${tamano}pt Arial, sans-serif`;
    return contextoTexto;
  }

  function dibujarTexto(lineas, x, top, estilo = 'normal', tamano = 9, align = 'left') {
    pdf.setFont('helvetica', estilo).setFontSize(tamano);
    lineas.forEach((texto, indice) => {
      const base = top + RELLENO_CELDA + 0.88 * tamano * 25.4 / 72 + indice * ALTO_LINEA;
      if (!usaFuenteDelNavegador(texto)) {
        pdf.text(texto, x, base, { align });
        return;
      }

      const contexto = prepararFuenteDelNavegador(estilo, tamano);
      const medida = contexto.measureText(texto);
      const pxPorMm = 96 / 25.4;
      const altoPx = Math.ceil(medida.actualBoundingBoxAscent + medida.actualBoundingBoxDescent + 2);
      const anchoPx = Math.ceil(medida.width + 2);
      const escala = 3;
      const canvas = document.createElement('canvas');
      canvas.width = anchoPx * escala;
      canvas.height = altoPx * escala;
      const dibujo = canvas.getContext('2d');
      dibujo.scale(escala, escala);
      dibujo.font = contexto.font;
      dibujo.fillStyle = '#0f172a';
      dibujo.fillText(texto, 1, medida.actualBoundingBoxAscent + 1);
      const izquierda = align === 'center' ? x - medida.width / (2 * pxPorMm) : x;
      pdf.addImage(canvas, 'PNG', izquierda - 1 / pxPorMm, base - (medida.actualBoundingBoxAscent + 1) / pxPorMm,
        anchoPx / pxPorMm, altoPx / pxPorMm);
    });
  }

  function dibujarFila(celdas, anchos, x, top, altura, fondo, estilo) {
    celdas.forEach((lineas, indice) => {
      const ancho = anchos[indice];
      const esProducto = indice === 1;
      pdf.setFillColor(fondo);
      pdf.rect(x, top, ancho, altura, 'FD');
      dibujarTexto(
        lineas,
        esProducto ? x + RELLENO_CELDA : x + ancho / 2,
        top,
        estilo,
        9,
        esProducto ? 'left' : 'center',
      );
      x += ancho;
    });
  }

  function dibujarPedido(pedido, cliente, mostrarPapaFrita) {
    const nombreCliente = cliente.cliente?.replace(/\s+/g, ' ').trim() || 'Cliente sin nombre';
    const nombre = envolverTexto(nombreCliente, ANCHO_CLIENTE, 'bold', 11);
    const alturaNombre = altoCelda(nombre.length);
    const notas = pedido.notas || [];
    const observaciones = notas
      .filter(({ tipo }) => tipo === 'OBSERVACION')
      .flatMap(({ texto }) => envolverTexto(`• ${texto ?? ''}`, ANCHO_CLIENTE, 'italic'));
    const encabezados = ['Cantidad', 'Producto', 'Taper'];
    const anchos = [21, anchoTabla - 34, 13];
    if (mostrarPapaFrita) {
      encabezados.push('Papa frita');
      anchos[1] -= 17;
      anchos.push(17);
    }

    const filas = [
      ...(pedido.detalles || []).map((detalle) => ({
        cantidad: detalle.cantidad,
        texto: detalle.producto?.nombre || 'Producto eliminado',
        taper: detalle.usaTaper,
        papaFrita: detalle.usaPapaFrita,
      })),
      ...notas.filter(({ tipo }) => tipo === 'ADICIONAL').map((nota) => ({
        cantidad: nota.cantidad,
        texto: `+ ${nota.descripcion ?? ''}`,
        adicional: true,
      })),
    ].map((fila, indice) => {
      const estilo = fila.adicional ? 'italic' : 'normal';
      const fondo = fila.adicional ? '#ffedd5' : indice % 2 ? '#dbeafe' : '#ffffff';
      return { ...fila, estilo, fondo, lineas: envolverTexto(fila.texto, anchos[1], estilo) };
    });

    const alturaNotas = observaciones.length ? altoCelda(observaciones.length + 1) : 0;
    const alturaTabla = ALTO_ENCABEZADO_TABLA + filas.reduce((total, fila) => total + altoCelda(fila.lineas.length), 0);
    const alturaPedido = Math.max(alturaNombre + alturaNotas, alturaTabla);
    if (alturaPedido <= limiteInferior - inicioColumna && y + alturaPedido > limiteInferior) {
      avanzarColumna();
    }

    let indiceNota = 0;
    let indiceFila = 0;
    let lineaFila = 0;
    do {
      const notasPendientes = indiceNota < observaciones.length;
      const filasPendientes = indiceFila < filas.length;
      const espacioTabla = filasPendientes || filas.length === 0 ? ALTO_ENCABEZADO_TABLA : 0;
      const espacioMinimo = Math.max(
        alturaNombre + (notasPendientes ? altoCelda(2) : 0),
        espacioTabla + (filasPendientes ? altoCelda(1) : 0),
      );
      if (y + espacioMinimo > limiteInferior) avanzarColumna();

      const x = MARGEN + columna * (anchoColumna + SEPARACION_COLUMNAS);
      pdf.setFillColor('#fef3c7');
      pdf.rect(x, y, ANCHO_CLIENTE, alturaNombre, 'FD');
      dibujarTexto(nombre, x + RELLENO_CELDA, y, 'bold', 11);
      let finalCliente = y + alturaNombre;

      if (notasPendientes) {
        const capacidad = Math.floor((limiteInferior - finalCliente - altoCelda(1)) / ALTO_LINEA);
        const lineas = observaciones.slice(indiceNota, indiceNota + capacidad);
        dibujarTexto([indiceNota === 0 ? 'Notas:' : 'Notas (continuación):'], x + RELLENO_CELDA, finalCliente, 'bold');
        dibujarTexto(lineas, x + RELLENO_CELDA, finalCliente + ALTO_LINEA, 'italic');
        indiceNota += lineas.length;
        finalCliente += altoCelda(lineas.length + 1);
      }

      let finalTabla = y;
      if (filasPendientes || filas.length === 0) {
        const xTabla = x + ANCHO_CLIENTE + SEPARACION_TABLA;
        dibujarFila(encabezados.map((texto) => [texto]), anchos, xTabla, y, ALTO_ENCABEZADO_TABLA, '#09ff00', 'bold');
        finalTabla += ALTO_ENCABEZADO_TABLA;

        while (indiceFila < filas.length) {
          const fila = filas[indiceFila];
          const capacidad = Math.floor((limiteInferior - finalTabla - altoCelda(0)) / ALTO_LINEA);
          if (capacidad < 1) break;

          const lineas = fila.lineas.slice(lineaFila, lineaFila + capacidad);
          const celdas = [
            lineaFila ? [''] : [String(fila.cantidad ?? '')],
            lineas,
            lineaFila ? [''] : [fila.taper ? 'Sí' : '-'],
          ];
          if (mostrarPapaFrita) celdas.push(lineaFila ? [''] : [fila.papaFrita ? 'Sí' : '-']);
          const altura = altoCelda(lineas.length);
          dibujarFila(celdas, anchos, xTabla, finalTabla, altura, fila.fondo, fila.estilo);
          finalTabla += altura;
          lineaFila += lineas.length;
          if (lineaFila === fila.lineas.length) {
            indiceFila++;
            lineaFila = 0;
          }
        }
      }

      if (indiceNota < observaciones.length || indiceFila < filas.length) {
        avanzarColumna();
      } else {
        y = Math.max(finalCliente, finalTabla) + SEPARACION_PEDIDOS;
      }
    } while (indiceNota < observaciones.length || indiceFila < filas.length);
  }

  data.forEach((cliente) => {
    const pedidos = cliente.pedidos || [];
    const mostrarPapaFrita = pedidos.some((pedido) => pedido.detalles?.some(({ usaPapaFrita }) => usaPapaFrita));
    pedidos.forEach((pedido) => dibujarPedido(pedido, cliente, mostrarPapaFrita));
  });

  return pdf;
}
