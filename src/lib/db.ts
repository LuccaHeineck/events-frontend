import Dexie, { Table } from 'dexie';

export interface LocalUser {
	id: number;
	nome: string;
	email: string;
	senha?: string;
	isAdmin: boolean;
	cpf?: string;
	telefone?: string;
	syncPending?: boolean;
}

export interface LocalEvent {
	id_evento: number;
	titulo: string;
	data_inicio: string;
	data_fim: string;
	local: string;
}

export interface LocalRegistration {
	id_inscricao: number;
	id_usuario: number;
	id_evento: number;
	data_inscricao: string;
	data_cancelamento?: string | null;
	status: 0 | 1; // 0 = cancelada, 1 = ativa
}

export interface LocalCheckin {
	id_checkin: number;
	id_inscricao: number;
	data_checkin: string;
}

export interface PendingAction {
	id?: number;
	type: string;
	payload: any;
}

class AppDB extends Dexie {
	users!: Table<LocalUser, number>;
	events!: Table<LocalEvent, number>;
	registrations!: Table<LocalRegistration, number>;
	checkins!: Table<LocalCheckin, number>;
	pending!: Table<PendingAction, number>;

	constructor() {
		super('AppDB');

		this.version(4).stores({
			users: 'id',
			events: 'id_evento',
			registrations: 'id_inscricao',
			checkins: 'id_checkin',
			pending: '++id'
		});
	}
}

export const db = new AppDB();
