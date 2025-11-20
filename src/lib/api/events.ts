import { apiRequest } from './config';

// ====================================
// EVENTOS ENDPOINTS
// ====================================

export interface Event {
	id_evento: number;
	titulo: string;
	data_inicio: string;
	data_fim: string;
	local: string;
}

export interface CreateEventRequest {
	titulo: string;
	data_inicio: string;
	data_fim: string;
	local: string;
}

export interface UpdateEventRequest {
	titulo?: string;
	data_inicio?: string;
	data_fim?: string;
	local?: string;
}

interface EventsResponse {
	success: boolean;
	eventos: Event[];
}

// GET /eventos
export async function getEvents(): Promise<Event[]> {
	const response = await apiRequest<EventsResponse>('/eventos', {
		method: 'GET',
	});
	return response.eventos;
}

// GET /eventos/:id
export async function getEventById(id: number): Promise<Event> {
	return apiRequest<Event>(`/eventos/${id}`, {
		method: 'GET',
	});
}

// POST /eventos
export async function createEvent(data: CreateEventRequest): Promise<Event> {
	return apiRequest<Event>('/eventos', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

// PUT /eventos/:id
export async function updateEvent(id: number, data: UpdateEventRequest): Promise<Event> {
	return apiRequest<Event>(`/eventos/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

// DELETE /eventos/:id
export async function deleteEvent(id: number): Promise<void> {
	return apiRequest<void>(`/eventos/${id}`, {
		method: 'DELETE',
	});
}
