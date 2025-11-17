import { db } from '../db';

export async function queueAction(type: string, endpoint: string, payload: any) {
  return db.table('actions').add({
    type,
    endpoint,
    payload,
    timestamp: Date.now()
  });
}

export async function getPendingActions() {
  return db.table('actions').toArray();
}

export async function clearAction(id: number) {
  return db.table('actions').delete(id);
}
