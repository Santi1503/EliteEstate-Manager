import { jsPDF } from "jspdf";

const PropiedadPDF = async (propiedad, extras) => {
    // Crear el PDF con márgenes más amplios
    const doc = new jsPDF();
    
    // Configuración de márgenes
    const margin = 20; // Margen general del documento
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    
    // Configurar el color de texto
    doc.setTextColor(50, 50, 50);

    // Título principal
    doc.setFontSize(18);
    doc.text(`Ficha de propiedad: ${propiedad.ubicacion}`, margin, margin);

    // Información de la propiedad
    doc.setFontSize(12);
    let y = margin + 15;
    
    // Función para agregar texto con saltos de línea automáticos
    const addWrappedText = (text, x, y, maxWidth) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * 7); // 7 es aproximadamente la altura de una línea
    };
    
    // Agregar información con saltos de línea automáticos
    y = addWrappedText(`Dirección: ${propiedad.ubicacion}`, margin, y, contentWidth);
    y += 5;
    y = addWrappedText(`Descripción: ${propiedad.descripcion}`, margin, y, contentWidth);
    y += 5;
    y = addWrappedText(`Estado: ${propiedad.estado}`, margin, y, contentWidth);
    y += 5;
    y = addWrappedText(`Tipo: ${propiedad.tipo}`, margin, y, contentWidth);
    y += 5;
    y = addWrappedText(`Precio: ${propiedad.moneda} ${propiedad.precio}`, margin, y, contentWidth);
    y += 5;
    y = addWrappedText(`Propietario: ${propiedad.propietario}`, margin, y, contentWidth);
    y += 5;
    y = addWrappedText(`Metros cuadrados: ${propiedad.metrosCuadrados} m²`, margin, y, contentWidth);
    y += 5;
    y = addWrappedText(`Amueblado: ${propiedad.amueblado}`, margin, y, contentWidth);
    y += 15;

    if (extras.length > 0) {
        doc.addPage();
        
        // Título de la sección de imágenes
        doc.setFontSize(16);
        doc.text("Imágenes:", margin, margin);
        
        let imgY = margin;
        
        // Configuración de imágenes
        const maxWidth = contentWidth - 50; // Ancho máximo para las imágenes
        const maxHeight = 90; // Alto máximo para las imágenes
        
        for (let i = 0; i < extras.length; i++) {
            try {
                // Crear una imagen temporal para obtener sus dimensiones
                const img = new Image();
                img.src = extras[i];
                
                // Esperar a que la imagen se cargue
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    // Establecer un tiempo de espera para evitar bloqueos
                    setTimeout(resolve, 5000);
                });

                // Calcular las dimensiones manteniendo la proporción
                let width = img.width;
                let height = img.height;
                
                // Ajustar las dimensiones manteniendo la proporción
                if (width > maxWidth) {
                    height = (maxWidth * height) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight * width) / height;
                    height = maxHeight;
                }
                
                // Centrar la imagen horizontalmente
                const x = margin + (contentWidth - width) / 2;
                
                // Verificar si hay suficiente espacio en la página actual
                if (imgY + height + 10 > pageHeight - margin) {
                    doc.addPage();
                    imgY = margin;
                }
                
                // Determinar el formato de la imagen
                let imageFormat = "JPEG";
                if (extras[i].startsWith("data:image/png")) {
                    imageFormat = "PNG";
                } else if (extras[i].startsWith("data:image/webp")) {
                    imageFormat = "WEBP";
                }
                
                // Agregar la imagen
                doc.addImage(extras[i], imageFormat, x, imgY, width, height);
                
                imgY += height + 25; // Espacio para la imagen y número
                
            } catch (error) {
                console.error(`Error al procesar la imagen ${i}:`, error);
                // Continuar con la siguiente imagen
            }
        }
    }

    doc.save(`propiedad_${propiedad.ubicacion}.pdf`);
};

export default PropiedadPDF;
