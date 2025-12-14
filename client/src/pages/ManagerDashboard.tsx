import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments, getSystemConfig } from '@/lib/storage';
import { PRIORITY_LABELS, PRIORITY_COLORS, SERVICE_TYPES, type Appointment } from '@/../../shared/types';

export default function ManagerDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    waiting: 0,
    avgWaitTime: 0,
  });

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      toast.error('Acesso não autorizado');
      setLocation('/staff/login');
      return;
    }
    
    loadData();
  }, [user, setLocation]);

  const loadData = () => {
    const allAppointments = getAppointments();
    setAppointments(allAppointments);

    // Calcular estatísticas
    const completed = allAppointments.filter(a => a.status === 'completed').length;
    const inProgress = allAppointments.filter(a => 
      a.status === 'in_triage' || a.status === 'in_consultation'
    ).length;
    const waiting = allAppointments.filter(a => 
      a.status === 'waiting_triage' || a.status === 'waiting_doctor'
    ).length;

    // Calcular tempo médio (simplificado)
    const completedAppointments = allAppointments.filter(a => a.status === 'completed');
    let avgTime = 0;
    if (completedAppointments.length > 0) {
      const totalTime = completedAppointments.reduce((sum, apt) => {
        const start = new Date(apt.createdAt).getTime();
        const end = apt.consultationData 
          ? new Date(apt.consultationData.completedAt).getTime()
          : new Date().getTime();
        return sum + (end - start);
      }, 0);
      avgTime = Math.round(totalTime / completedAppointments.length / 1000 / 60); // em minutos
    }

    setStats({
      total: allAppointments.length,
      completed,
      inProgress,
      waiting,
      avgWaitTime: avgTime,
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
    setLocation('/staff/login');
  };

  // Dados para gráficos
  const getAppointmentsByDay = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count: appointments.filter(a => a.date === date).length,
    }));
  };

  const getAppointmentsByType = () => {
    const typeCounts: Record<string, number> = {};
    
    SERVICE_TYPES.forEach(service => {
      typeCounts[service.label] = appointments.filter(
        a => a.serviceType === service.id
      ).length;
    });

    return Object.entries(typeCounts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }));
  };

  const getAppointmentsByPriority = () => {
    const priorityCounts: Record<string, number> = {};
    
    Object.keys(PRIORITY_LABELS).forEach(priority => {
      priorityCounts[priority] = appointments.filter(
        a => a.priority === priority
      ).length;
    });

    return Object.entries(priorityCounts)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        priority,
        label: PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS],
        color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS],
        count,
      }));
  };

  const config = getSystemConfig();
  const appointmentsByDay = getAppointmentsByDay();
  const appointmentsByType = getAppointmentsByType();
  const appointmentsByPriority = getAppointmentsByPriority();
  const maxDayCount = Math.max(...appointmentsByDay.map(d => d.count), 1);
  const maxTypeCount = Math.max(...appointmentsByType.map(t => t.count), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Gerencial</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo(a), {user?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total de Atendimentos
                </CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Concluídos
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Em Atendimento
                </CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Aguardando
                </CardDescription>
                <CardTitle className="text-3xl text-amber-600">{stats.waiting}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Informações do Turno */}
          {config && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informações do Turno Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="text-lg font-semibold">
                      {new Date(config.shiftDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Turno</p>
                    <p className="text-lg font-semibold">
                      {config.currentShift === 'morning' ? 'Manhã' : 'Tarde'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fichas Distribuídas</p>
                    <p className="text-lg font-semibold">
                      {appointments.filter(a => a.date === config.shiftDate && a.shift === config.currentShift).length} / {config.maxAppointmentsPerShift}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tempo Médio */}
          <Card>
            <CardHeader>
              <CardTitle>Tempo Médio de Atendimento</CardTitle>
              <CardDescription>
                Desde a entrada até a conclusão da consulta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-5xl font-bold text-primary">{stats.avgWaitTime}</p>
                <p className="text-muted-foreground mt-2">minutos</p>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Atendimentos por Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos por Dia (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointmentsByDay.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-muted-foreground">{day.date}</div>
                    <div className="flex-1 bg-secondary rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full flex items-center justify-end pr-3 text-primary-foreground text-sm font-semibold transition-all"
                        style={{ width: `${(day.count / maxDayCount) * 100}%` }}
                      >
                        {day.count > 0 && day.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Atendimentos por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsByType.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum atendimento registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {appointmentsByType.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-40 text-sm text-muted-foreground truncate">{item.type}</div>
                      <div className="flex-1 bg-secondary rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all"
                          style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                        >
                          {item.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por Prioridade */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Prioridade (Manchester)</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsByPriority.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum atendimento registrado
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {appointmentsByPriority.map((item, index) => (
                    <div 
                      key={index}
                      className="text-center p-4 rounded-lg"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <p className="text-3xl font-bold mb-1" style={{ color: item.color }}>
                        {item.count}
                      </p>
                      <p className="text-sm font-medium" style={{ color: item.color }}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
