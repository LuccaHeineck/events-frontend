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

export interface PendingAction {
	id?: number; // autoincrement
	type: string;
	payload: any;
}

class AppDB extends Dexie {
	users!: Table<LocalUser, number>;
	pending!: Table<PendingAction, number>;

	constructor() {
		super('AppDB');

		this.version(1).stores({
			users: 'id',
			pending: '++id'
		});
	}
}

export const db = new AppDB();
