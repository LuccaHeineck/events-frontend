import { db } from './db';
import { PendingAction } from './db';

export async function addPendingAction(action: PendingAction) {
	return await db.pending.add(action);
}

export async function getPendingActions() {
	return await db.pending.toArray();
}

export async function clearPendingActions() {
	return await db.pending.clear();
}
