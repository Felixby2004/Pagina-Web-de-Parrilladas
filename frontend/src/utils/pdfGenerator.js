import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Generar imagen a partir de un elemento HTML
export const generarImagen = async (element, _nombreArchivo = 'nota_venta.png') => {
  if (!element) return null;
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error al generar imagen:', error);
    return null;
  }
};

// Generar PDF a partir de un elemento HTML
export const generarPDF = async (element, nombreArchivo = 'nota_venta.pdf') => {
  if (!element) return;
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const canvasPageHeight = Math.floor((canvas.width * pdfPageHeight) / pdfWidth);
    const scale = canvas.width / element.getBoundingClientRect().width;
    const pageStarts = [...element.querySelectorAll('.pdf-page')]
      .map((page) => Math.round((page.getBoundingClientRect().top - element.getBoundingClientRect().top) * scale))
      .filter((top) => top > 0)
      .sort((first, second) => first - second);
    let canvasOffset = 0;

    while (canvasOffset < canvas.height) {
      const targetEnd = Math.min(canvasOffset + canvasPageHeight, canvas.height);
      const safeEnd = pageStarts
        .filter((top) => top > canvasOffset && top <= targetEnd)
        .pop() || targetEnd;
      const sliceHeight = safeEnd - canvasOffset;
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      pageCanvas.getContext('2d').drawImage(
        canvas,
        0,
        canvasOffset,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      if (canvasOffset > 0) pdf.addPage();
      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        pdfWidth,
        (sliceHeight * pdfWidth) / canvas.width
      );
      canvasOffset = safeEnd;
    }
    pdf.save(nombreArchivo);
  } catch (error) {
    console.error('Error al generar PDF:', error);
  }
};

// Copiar imagen al portapapeles (requiere permiso de clipboard)
export const copiarImagenAlPortapapeles = async (dataUrl) => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    return true;
  } catch (error) {
    console.error('Error al copiar imagen:', error);
    return false;
  }
};