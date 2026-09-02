/**
 * Servicio para consultar las Escapadas Full Day desde Google Sheets en Tiempo Real
 */

export interface ViajeSheetRaw {
  ID?: string;
  Destino?: string;
  Fecha?: string;
  Precio?: string;
  Incluye?: string;
  Estado?: string;
  'Tipo de Viaje'?: string;
  'Tipo de viaje'?: string;
  'Tipo De Viaje'?: string;
  'tipo de viaje'?: string;
  'URL Imagen'?: string;
  [key: string]: any;
}

export interface FullDayViaje {
  id: string;
  destino: string;
  fecha: string;
  precio: string;
  incluye: string;
  incluyeLista: string[];
  estado: string;
  tipoViaje: string;
  tagTipoViaje: string;
  imagenUrl: string;
  whatsappUrl: string;
}

const SPREADSHEET_ID = '1PQcS03Qs4Jl-U8UX4-RLRMtgntdW8DwXbL_FZsXanf8';
const SHEET_NAME = 'API_Data';
const GOOGLE_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
const OPENSHEET_URL = `https://opensheet.elk.sh/${SPREADSHEET_ID}/${SHEET_NAME}`;
const WHATSAPP_NUM = '5493516640325';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';

/**
 * Convierte enlaces de Google Drive a URLs directas de imagen CDN sin bloqueo de cookies
 */
export function normalizarImagenGoogleDrive(url?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_IMAGE;
  }

  const cleanUrl = url.trim();

  // Detectar links de Google Drive tipo:
  // https://drive.google.com/file/d/FILE_ID/view...
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  // https://drive.google.com/thumbnail?id=FILE_ID
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|thumbnail\?id=))([a-zA-Z0-9_-]+)/;
  const match = cleanUrl.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return cleanUrl;
}

/**
 * Resuelve el Tipo de Viaje y la tag con emoji correspondiente
 */
export function resolverTipoViaje(tipoRaw?: string): { tipoViaje: string; tagTipoViaje: string } {
  const raw = (tipoRaw || '').toString().trim();
  const lower = raw.toLowerCase();

  if (lower === 'viaje' || lower.includes('viaje')) {
    return {
      tipoViaje: 'Viaje',
      tagTipoViaje: '🚌 Viaje',
    };
  }

  if (lower === 'full day' || lower === 'fullday' || lower.includes('full')) {
    return {
      tipoViaje: 'Full Day',
      tagTipoViaje: '🚌 Full Day',
    };
  }

  if (raw.length > 0) {
    return {
      tipoViaje: raw,
      tagTipoViaje: `🚌 ${raw}`,
    };
  }

  // Valor por defecto si no viene especificado
  return {
    tipoViaje: 'Full Day',
    tagTipoViaje: '🚌 Full Day',
  };
}

/**
 * Genera el enlace directo a WhatsApp con mensaje de reserva prellenado
 */
export function generarWhatsAppUrl(destino: string, fecha?: string, precio?: string, tipoViaje?: string): string {
  const tipoLabel = tipoViaje?.toLowerCase().includes('viaje') ? 'el viaje a' : 'el Full Day a';
  const texto = `¡Hola! Quiero consultar por ${tipoLabel} "${destino}"${fecha ? ` para la fecha ${fecha}` : ''}${precio ? ` (${precio})` : ''}. ¿Tienen disponibilidad?`;
  return `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(texto)}`;
}

/**
 * Limpia y separa los elementos del texto "Incluye" para mostrarlos como tags
 */
export function parsearIncluye(incluye?: string): string[] {
  if (!incluye) return [];
  return incluye
    .split(/[,•;-]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Obtiene los viajes directamente desde el endpoint oficial en vivo de Google Sheets (0 segundos de caché)
 */
async function fetchGoogleSheetsDirect(): Promise<ViajeSheetRaw[]> {
  const url = `${GOOGLE_GVIZ_URL}&_nocache=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const text = await response.text();
  const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const json = JSON.parse(jsonStr);

  const headers = json.table.cols.map((c: any) => (c.label || '').trim());
  const rows: ViajeSheetRaw[] = json.table.rows.map((r: any) => {
    const obj: Record<string, any> = {};
    headers.forEach((header: string, i: number) => {
      if (!header) return;
      const cell = r.c && r.c[i];
      obj[header] = cell
        ? cell.f !== undefined && cell.f !== null
          ? cell.f
          : cell.v !== undefined && cell.v !== null
          ? cell.v
          : ''
        : '';
    });
    return obj;
  });

  return rows;
}

/**
 * Obtiene los viajes Full Day activos desde Google Sheets en tiempo real
 */
export async function obtenerFullDaysActivos(): Promise<FullDayViaje[]> {
  let rawData: ViajeSheetRaw[] = [];

  try {
    // 1. Intento directo a Google Sheets (sin retraso de caché de 5 minutos)
    rawData = await fetchGoogleSheetsDirect();
  } catch (errDirect) {
    try {
      // 2. Fallback a OpenSheet
      const response = await fetch(`${OPENSHEET_URL}?_t=${Date.now()}`);
      if (response.ok) {
        rawData = await response.json();
      }
    } catch (errOpenSheet) {
      console.error('Error al obtener datos de Google Sheets:', errOpenSheet);
      return [];
    }
  }

  if (!Array.isArray(rawData)) {
    return [];
  }

  // Filtrar estrictamente solo los viajes cuyo Estado sea "Activo" (sin importar mayúsculas/minúsculas ni espacios)
  const activos = rawData.filter((v) => {
    const estado = (v.Estado || '').toString().trim().toLowerCase();
    return estado === 'activo';
  });

  return activos.map((viaje, index) => {
    const rawTipo =
      viaje['Tipo de Viaje'] ||
      viaje['Tipo de viaje'] ||
      viaje['Tipo De Viaje'] ||
      viaje['tipo de viaje'] ||
      viaje['Tipo'] ||
      viaje['tipo'] ||
      viaje['TipoViaje'] ||
      viaje['tipoViaje'];
    const { tipoViaje, tagTipoViaje } = resolverTipoViaje(rawTipo);
    const destino = (viaje.Destino || '').toString().trim() || `${tipoViaje} #${index + 1}`;
    const fecha = (viaje.Fecha || '').toString().trim() || 'Próximamente';
    const precio = (viaje.Precio || '').toString().trim() || 'Consultar';
    const incluye = (viaje.Incluye || '').toString().trim() || 'Coordinación y traslados';
    const imagenUrl = normalizarImagenGoogleDrive(viaje['URL Imagen']);

    return {
      id: (viaje.ID || '').toString() || `${index + 1}`,
      destino,
      fecha,
      precio,
      incluye,
      incluyeLista: parsearIncluye(incluye),
      estado: viaje.Estado || 'Activo',
      tipoViaje,
      tagTipoViaje,
      imagenUrl,
      whatsappUrl: generarWhatsAppUrl(destino, fecha, precio, tipoViaje),
    };
  });
}
