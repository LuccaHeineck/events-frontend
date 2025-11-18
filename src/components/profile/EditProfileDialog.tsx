import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext"
import { updateUser } from '../../lib/api/users';
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EditProfileDialog({ open, onClose }: Props) {
  const { user, setUser } = useAuth() as any;

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    cpf: user?.cpf ?? "",
    telefone: user?.telefone ?? "",
  });

    const handleSave = async () => {
    try {
        if (!user?.id) {
        toast.error("Usuário inválido");
        return;
        }

        const payload = {
          nome: form.name,
          email: form.email,
          cpf: form.cpf,
          telefone: form.telefone,
          isAdmin: user.isAdmin,
        };

        const updated = await updateUser(user.id, payload);

        // Atualiza somente os campos que o header realmente usa
        const merged = {
          ...user,
          name: updated.nome,
          email: updated.email,
          isAdmin: updated.isAdmin, // se existir na resposta
          cpf: updated.cpf,
          telefone: updated.telefone,
        };

        setUser(merged);
        localStorage.setItem("eventManagerUser", JSON.stringify(merged));

        toast.success("Perfil atualizado");
        onClose();
    } catch (err) {
        toast.error("Erro ao atualizar");
    }
    };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <Label className="mb-2">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <Label className="mb-2">CPF</Label>
            <Input
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
          </div>

          <div>
            <Label className="mb-2">Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
