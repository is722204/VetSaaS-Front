/**
 * Utilidades para el manejo de fechas sin problemas de timezone
 */

/**
 * Parsea una fecha string sin problemas de timezone
 * @param dateString - Fecha en formato string (preferiblemente YYYY-MM-DD)
 * @returns Date object parseado correctamente
 */
export function parseDate(dateString: string): Date {
  if (!dateString) {
    return new Date();
  }
  
  // Si la fecha viene en formato YYYY-MM-DD, parseamos manualmente
  if (dateString.includes('-') && dateString.length === 10) {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
  }
  
  // Para otros formatos, usar el constructor original
  return new Date(dateString);
}

/**
 * Formatea una fecha para mostrar en español
 * @param dateString - Fecha en formato string
 * @returns Fecha formateada en español (ej: "2 de enero de 2025")
 */
export function formatDate(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea una fecha para mostrar en formato corto
 * @param dateString - Fecha en formato string
 * @returns Fecha formateada en formato corto (ej: "02/01/2025")
 */
export function formatDateShort(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Convierte una fecha a formato ISO (YYYY-MM-DD) sin problemas de timezone
 * @param date - Date object o string
 * @returns Fecha en formato YYYY-MM-DD
 */
export function toISODateString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento
 * @param birthDate - Fecha de nacimiento en formato string
 * @returns Edad en años como string (ej: "5 años")
 */
export function calculateAge(birthDate: string): string {
  const birth = parseDate(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return `${age - 1} años`;
  }
  
  return `${age} años`;
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param startDate - Fecha inicial
 * @param endDate - Fecha final (opcional, por defecto es hoy)
 * @returns Número de días de diferencia
 */
export function daysDifference(startDate: string, endDate?: string): number {
  if (!startDate) {
    return 0;
  }

  const start = parseDate(startDate);
  const end = endDate ? parseDate(endDate) : new Date();
  
  const timeDiff = end.getTime() - start.getTime();
  const days = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  return days;
}
