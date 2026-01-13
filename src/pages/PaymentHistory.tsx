import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

export default function PaymentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadPayments();
  }, [user]);

  const loadPayments = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user!.id)
        .single();

      if (!userData) {
        console.error('❌ Usuário não encontrado');
        return;
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar pagamentos:', error);
        throw error;
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
      in_process: 'secondary',
    };

    const labels: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      failed: 'Falhou',
      cancelled: 'Cancelado',
      in_process: 'Processando',
    };

    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const getPlanBadge = (planType: string | null) => {
    if (!planType) return '-';

    const labels: Record<string, string> = {
      basico: 'Premium',
      vip: 'VIP',
    };

    return <Badge variant="outline">{labels[planType] || planType}</Badge>;
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => safeGoBack(navigate, '/profile')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-foreground dark:text-white" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>Veja todos os seus pagamentos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum pagamento encontrado</p>
                <Button onClick={() => navigate('/premium')}>
                  Ver Planos
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vigência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {getPlanBadge(payment.plan_type)}
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.gateway === 'mercadopago' ? 'PIX' : payment.gateway || 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {payment.subscription_start && payment.subscription_end ? (
                            <span className="text-sm">
                              {format(new Date(payment.subscription_start), 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                              {format(new Date(payment.subscription_end), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
