// DTO para la creacion de un cliente nuevo
export interface DireccionDTO {
    direccion: string;
    ciudad: string;
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

// Interfaz para la lectura de datos provenientes de la API 
export interface ClienteResponse extends ClientePayload {
    id: string;
    createdAt: string;
    updatedAt: string;
    direcciones: (DireccionDTO & { id: string })[];
    documentos: (DocumentoDTO & { id: string })[];
}