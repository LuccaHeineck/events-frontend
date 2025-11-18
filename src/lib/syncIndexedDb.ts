import { db } from './db';
import { getEvents } from './api/events';
import { getEventRegistrations } from './api/registrations';
import { getCheckIns } from './api/checkins';
import { getUsers } from './api/users';
import { LocalUser, LocalEvent, LocalRegistration, LocalCheckin } from './db';

// Sincroniza IndexedDB com backend
export async function syncIndexedDB() {
	console.log('Iniciando sincronização do IndexedDB...');

	if (!navigator.onLine) {
		console.log('Sincronização ignorada: navegador offline');
		return;
	}

	try {
		console.log('Baixando eventos...');
		const eventsBackend = await getEvents();
		const events: LocalEvent[] = eventsBackend.map(e => ({
			id_evento: e.id_evento,
			titulo: e.titulo,
			data_inicio: e.data_inicio,
			data_fim: e.data_fim,
			local: e.local,
		}));

		console.log(`Eventos recebidos: ${events.length}`);

		console.log('Baixando inscrições...');
		const registrationsBackend = (
			await Promise.all(events.map(e => getEventRegistrations(e.id_evento)))
		).flat();
		const registrations: LocalRegistration[] = registrationsBackend.map(r => ({
			id_inscricao: r.id_inscricao,
			id_usuario: r.id_usuario,
			id_evento: r.id_evento,
			data_inscricao: r.data_inscricao,
			data_cancelamento: r.data_cancelamento ?? null,
			status: Number(r.status) as 0 | 1,
		}));

		console.log(`Inscrições recebidas: ${registrations.length}`);

		console.log('Baixando check-ins...');
		const checkinsBackend = (
			await Promise.all(registrations.map(r => getCheckIns(r.id_inscricao)))
		).flat();
		const checkins: LocalCheckin[] = checkinsBackend.map(c => ({
			id_checkin: c.id_checkin,
			id_inscricao: c.id_inscricao,
			data_checkin: c.data_checkin,
		}));

		console.log(`Check-ins recebidos: ${checkins.length}`);

		console.log('Baixando usuários...');
		const usersBackend = await getUsers();
		const users: LocalUser[] = usersBackend.map(u => ({
			id: u.id,
			nome: u.nome,
			email: u.email,
			senha: u.senha,
			isAdmin: u.isAdmin,
			cpf: u.cpf,
			telefone: u.telefone,
		}));

		console.log(`Usuários recebidos: ${users.length}`);

		console.log('Gravando dados no IndexedDB...');
		await db.transaction('rw', db.events, db.registrations, db.checkins, db.users, async () => {
			await db.events.clear();
			await db.events.bulkPut(events);

			await db.registrations.clear();
			await db.registrations.bulkPut(registrations);

			await db.checkins.clear();
			await db.checkins.bulkPut(checkins);

			await db.users.clear();
			await db.users.bulkPut(users);
		});

		console.log('IndexedDB sincronizado com sucesso');
	} catch (err) {
		console.error('Erro ao sincronizar IndexedDB:', err);
	}
}

// Roda a cada 60 segundos
setInterval(syncIndexedDB, 60_000);

// Roda ao iniciar
syncIndexedDB();
