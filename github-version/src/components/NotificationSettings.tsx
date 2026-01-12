import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Volume2, MessageCircle, Briefcase, Star } from 'lucide-react';

interface NotificationPreferences {
  newJobs: boolean;
  newCandidates: boolean;
  newMessages: boolean;
  jobUpdates: boolean;
  ratings: boolean;
  sound: boolean;
  browser: boolean;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newJobs: true,
    newCandidates: true,
    newMessages: true,
    jobUpdates: true,
    ratings: true,
    sound: true,
    browser: true
  });

  useEffect(() => {
    // Carregar preferências do localStorage
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('notification_preferences', JSON.stringify(updated));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificações
        </CardTitle>
        <CardDescription>
          Escolha quais notificações você deseja receber
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="newJobs">Novos bicos na minha cidade</Label>
            </div>
            <Switch
              id="newJobs"
              checked={preferences.newJobs}
              onCheckedChange={(checked) => updatePreference('newJobs', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="newCandidates">Novos candidatos nos meus bicos</Label>
            </div>
            <Switch
              id="newCandidates"
              checked={preferences.newCandidates}
              onCheckedChange={(checked) => updatePreference('newCandidates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="newMessages">Novas mensagens</Label>
            </div>
            <Switch
              id="newMessages"
              checked={preferences.newMessages}
              onCheckedChange={(checked) => updatePreference('newMessages', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="jobUpdates">Atualizações de status de jobs</Label>
            </div>
            <Switch
              id="jobUpdates"
              checked={preferences.jobUpdates}
              onCheckedChange={(checked) => updatePreference('jobUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="ratings">Novas avaliações</Label>
            </div>
            <Switch
              id="ratings"
              checked={preferences.ratings}
              onCheckedChange={(checked) => updatePreference('ratings', checked)}
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sound">Som de notificação</Label>
            </div>
            <Switch
              id="sound"
              checked={preferences.sound}
              onCheckedChange={(checked) => updatePreference('sound', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="browser">Notificações do navegador</Label>
            </div>
            <Switch
              id="browser"
              checked={preferences.browser}
              onCheckedChange={(checked) => updatePreference('browser', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
