// DTO para la creacion de un cliente nuevo
export interface DireccionDTO {
    direccion: string;
    ciudad: string;
    distritoId?: string;
    departamentoId?: string; // Auxiliar para UI
    municipioId?: string;    // Auxiliar para UI
    referenciaPrimaria?: string;
    referenciaEspecifica?: string;
    puntoReferencia?: string;
    es_ubicacion_personalizada?: boolean;
}

export interface DocumentoDTO {
    tipoDocumento: string;
    numero: string;
}

export interface ClientePayload {
    nombres: string;
    apellidos: string;
    fechaNacimiento: string;
    direcciones: DireccionDTO[];
    documentos: DocumentoDTO[];
}

export interface AuditoriaDTO {
    id: string;
    accion: string;
    detalles: any;
    usuarioId: string;
    fechaHora: string;
}

// Interfaz para la lectura de datos provenientes de la API 
export interface ClienteResponse extends ClientePayload {
    id: string;
    estado: boolean;
    createdAt: string;
    updatedAt: string;
    direcciones: (DireccionDTO & { id: string })[];
    documentos: (DocumentoDTO & { id: string })[];
    auditorias?: AuditoriaDTO[];
}