import React, { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers, createUser, updateUser, deleteUser, User } from '../../../lib/api/users';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    isAdmin: false,
    cpf: '',
    telefone: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ nome: '', email: '', senha: '', isAdmin: false, cpf: '', telefone: '' });
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
        nome: user.nome,
        email: user.email,
        senha: '',
        isAdmin: user.isAdmin,
        cpf: user.cpf || '',
        telefone: user.telefone || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          nome: form.nome,
          email: form.email,
          senha: form.senha || undefined,
          isAdmin: form.isAdmin,
          cpf: form.cpf || undefined,
          telefone: form.telefone || undefined,
        });
        toast.success('Usuário atualizado');
      } else {
        await createUser({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          isAdmin: form.isAdmin,
          cpf: form.cpf || undefined,
          telefone: form.telefone || undefined,
        });
        toast.success('Usuário criado');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    try {
      await deleteUser(id);
      toast.success('Usuário deletado');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar usuário');
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
          {users.map((u) => (
            <Card key={u.id} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong>{u.nome}</strong>
                    <span className="text-sm text-muted-foreground">{u.email}</span>
                    {u.isAdmin && <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs">Admin</span>}
                  </div>
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
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha {editingUser ? '(deixe em branco para não alterar)' : ''}</Label>
              <Input id="senha" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required={!editingUser} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (opcional)</Label>
                <Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone (opcional)</Label>
                <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />
                <span className="text-sm">Administrador</span>
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
