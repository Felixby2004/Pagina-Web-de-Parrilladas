import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Generar imagen a partir de un elemento HTML
export const generarImagen = async (element, nombreArchivo = 'nota_venta.png') => {
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
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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