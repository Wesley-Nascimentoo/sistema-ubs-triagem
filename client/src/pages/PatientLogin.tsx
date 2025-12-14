import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { canAcceptMoreAppointments, getAvailableSlots } from '@/lib/storage';

export default function PatientLogin() {
  const [, setLocation] = useLocation();
  const [susCard, setSusCard] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!susCard.trim()) {
      toast.error('Por favor, insira o número do cartão SUS');
      return;
    }

    // Verificar se há fichas disponíveis
    if (!canAcceptMoreAppointments()) {
      setLocation('/no-slots');
      return;
    }

    setIsLoading(true);
    
    // Simular delay de processamento
    setTimeout(() => {
      // Salvar dados do paciente no sessionStorage para uso na próxima tela
      sessionStorage.setItem('patient_sus_card', susCard);
      
      setLocation('/patient/symptoms');
    }, 500);
  };

  const availableSlots = getAvailableSlots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo à UBS</CardTitle>
          <CardDescription>
            Sistema de Triagem e Atendimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="susCard">Número do Cartão SUS</Label>
              <Input
                id="susCard"
                type="text"
                placeholder="000 0000 0000 0000"
                value={susCard}
                onChange={(e) => setSusCard(e.target.value)}
                maxLength={18}
                disabled={isLoading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900 font-medium">
                Fichas disponíveis: <span className="text-lg">{availableSlots}</span>/16
              </p>
              <p className="text-blue-700 text-xs mt-1">
                Atendimento por ordem de prioridade
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Processando...</>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Visualizar filas de atendimento
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/queues')}
              className="w-full"
            >
              Ver Painel de Filas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
