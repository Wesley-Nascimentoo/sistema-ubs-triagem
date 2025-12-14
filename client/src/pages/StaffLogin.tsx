import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getUserByCredentials } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    // Simular delay de autenticação
    setTimeout(() => {
      const user = getUserByCredentials(username, password);
      
      if (!user) {
        toast.error('Usuário ou senha incorretos');
        setIsLoading(false);
        return;
      }

      login(user);
      toast.success(`Bem-vindo(a), ${user.name}!`);

      // Redirecionar baseado no papel do usuário
      switch (user.role) {
        case 'nurse':
          setLocation('/nurse/panel');
          break;
        case 'doctor':
          setLocation('/doctor/panel');
          break;
        case 'manager':
          setLocation('/manager/dashboard');
          break;
        default:
          setLocation('/');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Acesso de Funcionários</CardTitle>
          <CardDescription>
            Entre com suas credenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
              <p className="text-amber-900 font-medium mb-1">Credenciais padrão:</p>
              <p className="text-amber-800">Enfermeiro: enfermeiro / 123456</p>
              <p className="text-amber-800">Médico: medico / 123456</p>
              <p className="text-amber-800">Gestor: gestor / 123456</p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar para login de paciente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
