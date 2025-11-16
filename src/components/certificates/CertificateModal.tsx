import React, { useState } from 'react';
import { Certificate, Event } from '../../types';
import { Download, Award, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface CertificateModalProps {
  certificate: Certificate | null;
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateModal({ certificate, event, isOpen, onClose }: CertificateModalProps) {
  const { user } = useAuth();

  if (!certificate || !event) return null;

  const handleDownload = () => {
    toast.success('Certificado sendo preparado para download...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Certificado de Participação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Preview */}
          <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 bg-gradient-to-br from-card to-muted p-8 md:p-12">
            <div className="absolute right-4 top-4 text-primary/10">
              <Award className="h-32 w-32" />
            </div>
            
            <div className="relative space-y-6 text-center">
              <div className="space-y-2">
                <Award className="mx-auto h-16 w-16 text-primary" />
                <h3 className="text-foreground">Certificado de Participação</h3>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground">Certificamos que</p>
                <p className="text-foreground">{user?.name}</p>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground">Participou do evento</p>
                <p className="text-foreground">{event.title}</p>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground">Realizado em</p>
                <p className="text-foreground">
                  {new Date(event.date).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-muted-foreground">{event.location}</p>
              </div>

              <div className="pt-6">
                <div className="mx-auto max-w-md space-y-2 rounded-lg bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground">Código de autenticação:</p>
                  <p className="font-mono text-primary">{certificate.code}</p>
                  <p className="text-xs text-muted-foreground">
                    Emitido em:{' '}
                    {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleDownload} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Baixar Certificado
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Este certificado pode ser validado em:{' '}
              <a
                href={certificate.validationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {certificate.validationUrl}
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ValidateCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ValidateCertificateModal({ isOpen, onClose }: ValidateCertificateModalProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (code.startsWith('CERT-')) {
      setValidationResult({
        valid: true,
        message: 'Certificado válido e autêntico!',
      });
    } else {
      setValidationResult({
        valid: false,
        message: 'Código de certificado inválido.',
      });
    }

    setIsValidating(false);
  };

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
              placeholder="CERT-2025-..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <Button
            onClick={handleValidate}
            disabled={!code || isValidating}
            className="w-full"
          >
            {isValidating ? 'Validando...' : 'Validar Certificado'}
          </Button>

          {validationResult && (
            <div
              className={`rounded-lg border p-4 ${
                validationResult.valid
                  ? 'border-green-500/20 bg-green-500/10'
                  : 'border-red-500/20 bg-red-500/10'
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
                    validationResult.valid ? 'text-green-500' : 'text-red-500'
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