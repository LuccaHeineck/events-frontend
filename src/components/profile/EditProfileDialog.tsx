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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("Nova senha e confirmação não coincidem");
      return;
    }

    try {
      if (!user?.id) {
        toast.error("Usuário inválido");
        return;
      }

      const payload: any = {
        nome: form.name,
        email: form.email,
        cpf: form.cpf,
        telefone: form.telefone,
        isAdmin: user.isAdmin,
      };

      // Se o usuário quer alterar a senha, coloca diretamente no campo `senha`
      if (form.newPassword) {
        payload.senha = form.newPassword;
      }

      const updated = await updateUser(user.id, payload);

      const merged = {
        ...user,
        name: updated.nome,
        email: updated.email,
        isAdmin: updated.isAdmin,
        cpf: updated.cpf,
        telefone: updated.telefone,
      };

      setUser(merged);
      localStorage.setItem("eventManagerUser", JSON.stringify(merged));

      toast.success("Perfil atualizado");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao atualizar");
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
              required
            />
          </div>

          <div>
            <Label className="mb-2">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
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

          <div className="pt-4 border-t space-y-4">
            <div>
              <Label className="mb-2">Senha atual</Label>
              <Input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-2">Nova senha</Label>
              <Input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-2">Confirmar nova senha</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
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
