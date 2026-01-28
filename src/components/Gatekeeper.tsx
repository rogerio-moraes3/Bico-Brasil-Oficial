import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface City {
    id: string;
    name: string;
    state: string;
}

export const Gatekeeper = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cities, setCities] = useState<City[]>([]);

    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [cityId, setCityId] = useState('');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Delay de 500ms para evitar conflitos com criação de perfil
        const timer = setTimeout(() => {
            checkProfile();
        }, 500);

        return () => clearTimeout(timer);
    }, [user]);

    const checkProfile = async () => {
        if (!user) return;

        try {
            const { data: profile } = await supabase
                .from('users')
                .select('cpf, phone, city_id')
                .eq('auth_id', user.id)
                .maybeSingle();

            if (!profile || !profile.cpf || !profile.phone || !profile.city_id) {
                // Carregar cidades
                const { data: citiesData } = await supabase
                    .from('cities')
                    .select('id, name, state')
                    .order('name');

                setCities(citiesData || []);
                setShowModal(true);
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const cleanCpf = cpf.replace(/\D/g, '');
        const cleanPhone = phone.replace(/\D/g, '');

        if (!cleanCpf || cleanCpf.length !== 11) {
            toast({
                title: "CPF inválido",
                description: "Digite um CPF válido com 11 dígitos",
                variant: "destructive"
            });
            return;
        }

        if (!cleanPhone || cleanPhone.length < 10) {
            toast({
                title: "Telefone inválido",
                description: "Digite um telefone válido",
                variant: "destructive"
            });
            return;
        }

        if (!cityId) {
            toast({
                title: "Cidade obrigatória",
                description: "Selecione uma cidade",
                variant: "destructive"
            });
            return;
        }

        setSaving(true);

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    cpf: cleanCpf,
                    phone: cleanPhone,
                    city_id: cityId
                })
                .eq('auth_id', user!.id);

            if (error) throw error;

            toast({
                title: "Perfil atualizado!",
                description: "Seus dados foram salvos com sucesso"
            });

            setShowModal(false);
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message || "Tente novamente",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const formatCpf = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
        if (match) {
            return [match[1], match[2], match[3], match[4]].filter(Boolean).join('.').replace(/\.(\d{2})$/, '-$1');
        }
        return value;
    };

    const formatPhone = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`.replace(/[^\d()-\s]/g, '');
        }
        return value;
    };

    if (loading) return null;

    return (
        <Dialog open={showModal} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Complete seu cadastro</DialogTitle>
                    <DialogDescription>
                        Para continuar, precisamos de algumas informações obrigatórias.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                            id="cpf"
                            value={cpf}
                            onChange={(e) => setCpf(formatCpf(e.target.value))}
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">Cidade *</Label>
                        <Select value={cityId} onValueChange={setCityId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione sua cidade" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem key={city.id} value={city.id}>
                                        {city.name} - {city.state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full"
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar e Continuar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
