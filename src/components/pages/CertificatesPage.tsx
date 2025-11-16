import React, { useState, useMemo } from 'react';
import { Event, Certificate } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { CertificateModal, ValidateCertificateModal } from '../certificates/CertificateModal';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Award, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CertificatesPageProps {
  events: Event[];
  certificates: Certificate[];
}

export function CertificatesPage({ events, certificates }: CertificatesPageProps) {
  const { user } = useAuth();
  const [selectedCertificate, setSelectedCertificate] = useState<{
    certificate: Certificate;
    event: Event;
  } | null>(null);
  const [showValidateModal, setShowValidateModal] = useState(false);

  const userCertificates = useMemo(() => {
    return certificates
      .filter((c) => c.userId === user?.id)
      .map((cert) => ({
        certificate: cert,
        event: events.find((e) => e.id === cert.eventId),
      }))
      .filter((item) => item.event !== undefined);
  }, [certificates, events, user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-foreground">Meus Certificados</h1>
          <p className="text-muted-foreground">
            Visualize e baixe seus certificados de participação
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowValidateModal(true)}>
          Validar Certificado
        </Button>
      </div>

      {userCertificates.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
          <div className="text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Você ainda não possui certificados
            </p>
            <p className="text-sm text-muted-foreground">
              Complete eventos para receber seus certificados
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userCertificates.map(({ certificate, event }) => {
            if (!event) return null;

            return (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 p-6">
                    <Award className="absolute right-4 top-4 h-16 w-16 text-primary/20" />
                    <div className="relative">
                      <CheckCircle className="mb-2 h-6 w-6 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Certificado de
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Participação
                      </p>
                    </div>
                  </div>

                  <CardContent className="space-y-4 p-6">
                    <div>
                      <h3 className="mb-1 line-clamp-2 text-foreground">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-xs text-muted-foreground">
                          Código:
                        </p>
                        <p className="font-mono text-xs text-foreground">
                          {certificate.code}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Emitido em:{' '}
                        {new Date(certificate.issuedAt).toLocaleDateString(
                          'pt-BR'
                        )}
                      </p>
                    </div>

                    <Button
                      onClick={() =>
                        setSelectedCertificate({ certificate, event })
                      }
                      variant="outline"
                      className="w-full"
                    >
                      Visualizar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <CertificateModal
        certificate={selectedCertificate?.certificate || null}
        event={selectedCertificate?.event || null}
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      <ValidateCertificateModal
        isOpen={showValidateModal}
        onClose={() => setShowValidateModal(false)}
      />
    </div>
  );
}
