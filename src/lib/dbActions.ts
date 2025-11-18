import { db } from './db';
import { PendingAction } from './db';
import { LocalEvent, LocalRegistration, LocalCheckin } from './db';

export async function addPendingAction(action: PendingAction) {
	return await db.pending.add(action);
}

export async function getPendingActions() {
	return await db.pending.toArray();
}

export async function clearPendingActions() {
	return await db.pending.clear();
}

// Eventos
export async function localSaveEvents(events: LocalEvent[]) {
	for (const event of events) {
		await db.events.put(event);
	}
}

export async function localGetEvents(): Promise<LocalEvent[]> {
	return await db.events.toArray();
}

// Inscrições
export async function localSaveRegistrations(registrations: LocalRegistration[]) {
	for (const reg of registrations) {
		await db.registrations.put(reg);
	}
}

export async function localGetRegistrations(): Promise<LocalRegistration[]> {
	return await db.registrations.toArray();
}

// Check-ins
export async function localSaveCheckins(checkins: LocalCheckin[]) {
	for (const c of checkins) {
		await db.checkins.put(c);
	}
}

export async function localGetCheckins(): Promise<LocalCheckin[]> {
	return await db.checkins.toArray();
}
