import { db } from './db';
import { LocalUser } from './db';

export async function localSaveUser(user: LocalUser) {
	await db.users.put(user);
}

export async function localGetUsers() {
	return await db.users.toArray();
}

export async function localDeleteUser(id: number) {
    await db.users.delete(id);
}
