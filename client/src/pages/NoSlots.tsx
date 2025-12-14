import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Calendar, Clock } from 'lucide-react';
import { getSystemConfig } from '@/lib/storage';
import { SHIFT_LABELS } from '@/../../shared/types';

export default function NoSlots() {
  const [, setLocation] = useLocation();
  const config = getSystemConfig();

  const handleBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">Fichas Esgotadas</CardTitle>
          <CardDescription>
            Infelizmente todas as fichas deste turno já foram distribuídas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Turno */}
          {config && (
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Data: {new Date(config.shiftDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Turno: {SHIFT_LABELS[config.currentShift]}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-semibold text-foreground">
                  Fichas distribuídas: 16/16
                </p>
              </div>
            </div>
          )}

          {/* Orientações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">O que fazer?</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Retorne em outro dia para conseguir uma ficha</li>
              <li>• As fichas são distribuídas por ordem de chegada</li>
              <li>• Recomendamos chegar cedo para garantir atendimento</li>
              <li>• Em caso de emergência, procure o pronto-socorro</li>
            </ul>
          </div>

          {/* Horários de Atendimento */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Horários de Atendimento:</h4>
            <div className="text-sm text-amber-800 space-y-1">
              <p>• <strong>Manhã:</strong> 7h às 12h</p>
              <p>• <strong>Tarde:</strong> 13h às 17h</p>
              <p className="mt-2 text-xs">
                * Limite de 16 fichas por turno
              </p>
            </div>
          </div>

          <Button 
            onClick={handleBack}
            className="w-full"
            size="lg"
          >
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
