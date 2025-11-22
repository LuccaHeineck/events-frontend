import React, { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getCertificateByHash } from "../../lib/api/certificates";
interface ValidateCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ValidateCertificateModal({
  isOpen,
  onClose,
}: ValidateCertificateModalProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  async function handleValidate(hash_confirmacao: string) {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await getCertificateByHash(hash_confirmacao);
      const url = URL.createObjectURL(response);
      window.open(url, "_blank");

      setIsValidating(false);
      setValidationResult({
        valid: true,
        message:
          "Certificado válido! Confira a guia aberta para realizar o download",
      });
    } catch (err) {
      setIsValidating(false);
      setValidationResult({
        valid: false,
        message:
          "Código inválido, insira um código correto para gerar o certificado.",
      });
      console.error("Erro ao visualizar o certificado:", err);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validar Certificado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código do Certificado</Label>
            <Input
              id="code"
              placeholder="9c25d10a75524ed6b3be50f490e48436"
              value={code}
              onChange={(e) => {
                console.log(e);
                setCode(e.target.value);
              }}
            />
          </div>

          <Button
            onClick={() => handleValidate(code)}
            disabled={!code || isValidating}
            className="w-full"
          >
            {isValidating ? "Validando..." : "Validar Certificado"}
          </Button>

          {validationResult && (
            <div
              className={`rounded-lg border p-4 ${
                validationResult.valid
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {validationResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
                <p
                  className={
                    validationResult.valid ? "text-green-500" : "text-red-500"
                  }
                >
                  {validationResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
