import React, { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers, createUser, updateUser, deleteUser } from '../../../lib/api/users';
import { localGetUsers, localSaveUser, localDeleteUser, localClearUsers } from '../../../lib/dbUsers';
import { useOffline } from '../../../contexts/OfflineContext';
import { LocalUser } from '../../../lib/db';

export function UsersPage() {
	const [users, setUsers] = useState<LocalUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<LocalUser | null>(null);

	const { isOnline, registerPending } = useOffline();

	const [form, setForm] = useState({
		nome: '',
		email: '',
		senha: '',
		isAdmin: false,
		cpf: '',
		telefone: '',
	});

	useEffect(() => {
	const loadUsers = async () => {
		if (isOnline) {
		const apiUsers = await getUsers();
		setUsers(apiUsers);
		apiUsers.forEach(u => localSaveUser(...));
		} else {
		const localUsers = await localGetUsers();
		setUsers(localUsers);
		}
	}
	loadUsers();
	}, [isOnline]);

	useEffect(() => {
		fetchUsers();
	}, [isOnline]);

	const fetchUsers = async () => {
		setIsLoading(true);

		try {
			let loadedUsers: LocalUser[] = [];

			if (isOnline) {
				try {
					await localClearUsers();
					const apiUsers = await getUsers();

					for (const u of apiUsers) {
						const userToSave: LocalUser = {
							id: u.id,
							nome: u.nome ?? "",
							email: u.email ?? "",
							senha: u.senha ?? "",
							isAdmin: u.isAdmin ?? false,
							cpf: u.cpf ?? "",
							telefone: u.telefone ?? "",
							syncPending: false,
						};
						await localSaveUser(userToSave);
					}

					loadedUsers = await localGetUsers();
				} catch {
					// Se der erro na API mas está online, pega do local
					loadedUsers = await localGetUsers();
				}
			} else {
				// Aqui é o ponto chave: no OFFLINE sempre carregar do local
				loadedUsers = await localGetUsers();
			}

			setUsers(loadedUsers);
		} catch (err) {
			console.error("Erro ao buscar usuários:", err);
			toast.error("Não foi possível carregar os usuários");
		} finally {
			setIsLoading(false);
		}
	};


	// --- Criação offline ---
	const createUserOffline = async (data: typeof form) => {
		const localUser: LocalUser = {
			...data,
			id: Date.now(),
			syncPending: true,
		};

		await localSaveUser(localUser);

		await registerPending("POST", "/usuarios", {
			...data,
			localId: localUser.id
		});

		setUsers(await localGetUsers());
	};

	// --- Edição offline ---
	const updateUserOffline = async (id: number, data: typeof form) => {
		const localUser: LocalUser = {
			...data,
			id,
			syncPending: true,
		};

		await localSaveUser(localUser);
		await registerPending("PUT", `/usuarios/${id}`, data);

		setUsers(await localGetUsers());
	};

	// --- Remoção offline ---
	const deleteUserOffline = async (id: number) => {
		await registerPending("DELETE", `/usuarios/${id}`);

		await localDeleteUser(id);
		setUsers(await localGetUsers());
	};

	const openCreate = () => {
		setEditingUser(null);
		setForm({ nome: '', email: '', senha: '', isAdmin: false, cpf: '', telefone: '' });
		setIsModalOpen(true);
	};

	const openEdit = (user: LocalUser) => {
		setEditingUser(user);
		setForm({
			nome: user.nome,
			email: user.email,
			senha: "",
			isAdmin: user.isAdmin,
			cpf: user.cpf ?? "",
			telefone: user.telefone ?? "",
		});
		setIsModalOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isOnline) {
			if (editingUser) {
				await updateUserOffline(editingUser.id, form);
				toast.info("Atualização salva localmente (offline)");
			} else {
				await createUserOffline(form);
				toast.info("Usuário criado localmente (offline)");
			}
			setIsModalOpen(false);
			return;
		}

		try {
			if (editingUser) {
				await updateUser(editingUser.id, { ...form, senha: form.senha || undefined });
				toast.success("Usuário atualizado");
			} else {
				await createUser(form);
				toast.success("Usuário criado");
			}
			setIsModalOpen(false);
			fetchUsers();
		} catch (err) {
			console.error(err);
			toast.error(err instanceof Error ? err.message : "Erro ao salvar");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Confirmar exclusão?")) return;

		if (!isOnline) {
			await deleteUserOffline(id);
			toast.info("Remoção salva localmente (offline)");
			return;
		}

		try {
			await deleteUser(id);
			await localDeleteUser(id);
			toast.success("Usuário deletado");
			fetchUsers();
		} catch (err) {
			console.error(err);
			toast.error("Erro ao deletar");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="mb-2 text-foreground">Gerenciar Usuários</h1>
					<p className="text-muted-foreground">Crie ou edite usuários</p>
				</div>
				<Button onClick={openCreate} className="gap-2">
					<Plus className="h-4 w-4" />
					Novo Usuário
				</Button>
			</div>

			{isLoading ? (
				<div className="flex min-h-[200px] items-center justify-center">
					<p className="text-muted-foreground">Carregando usuários...</p>
				</div>
			) : (
				<div className="space-y-3">
					{users.map(u => (
						<Card key={u.id} className="border-border hover:border-primary/50 transition-colors">
							<CardContent className="p-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<strong>{u.nome}</strong>
									<span className="text-sm text-muted-foreground">{u.email}</span>
									{u.isAdmin && (
										<span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs">Admin</span>
									)}
								</div>

								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={() => openEdit(u)} className="gap-2">
										<Edit className="h-4 w-4" /> Editar
									</Button>

									<Button variant="outline" size="sm" onClick={() => handleDelete(u.id)} className="gap-2">
										<Trash2 className="h-4 w-4" /> Deletar
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="nome">Nome</Label>
							<Input id="nome" value={form.nome}
								onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })} required />
						</div>

						<div className="space-y-2">
							<Label htmlFor="senha">Senha {editingUser ? "(opcional)" : ""}</Label>
							<Input id="senha" type="password" value={form.senha}
								onChange={(e) => setForm({ ...form, senha: e.target.value })}
								required={!editingUser} />
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="cpf">CPF</Label>
								<Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
							</div>

							<div className="space-y-2">
								<Label htmlFor="telefone">Telefone</Label>
								<Input id="telefone" value={form.telefone}
									onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
							</div>
						</div>

						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={form.isAdmin}
								onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
							/>
							<span className="text-sm">Administrador</span>
						</label>

						<div className="flex justify-end">
							<Button type="submit">Salvar</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
