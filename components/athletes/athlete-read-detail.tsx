"use client"

import { AffiliationsPanel } from "@/components/actors/affiliations-panel"
import { LicencesComingSoon } from "@/components/licences/licences-coming-soon"
import { ArrowLeft, Contact, Fingerprint, Info, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import type { AthleteReadRecord } from "@/lib/athlete-read-domain"

export function AthleteReadDetail({ athlete, onBack }: { athlete: AthleteReadRecord; onBack: () => void }) {
  const age = calculateAge(athlete.dateDeNaissance)
  const name = athlete.nomComplet || "Non renseigné"
  const initials = name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase()
  return <div className="w-full space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 size-4" />Retour à la liste</Button>
      <span className="text-sm text-muted-foreground">Identité en lecture seule</span>
    </div>
    <Card><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4"><Avatar className="size-20 shrink-0"><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar><div className="min-w-0"><h2 className="break-words text-2xl font-bold">{name}</h2><p className="mt-1 break-all font-mono text-sm text-muted-foreground">{athlete.idAthlete}</p></div></div>
      <StatusBadge status={athlete.statut} />
    </div></CardContent></Card>
    <Tabs defaultValue="general" className="gap-4">
      <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="general">Général</TabsTrigger><TabsTrigger value="affiliations">Affiliations</TabsTrigger><TabsTrigger value="licence">Licence</TabsTrigger></TabsList>
      <TabsContent value="general"><div className="grid gap-6 md:grid-cols-2">
        <DetailCard title="Identité" icon={User} fields={[
          { label: "Nom complet", value: athlete.nomComplet }, { label: "Sexe", value: athlete.sexe },
          { label: "Date de naissance", value: formatSheetDate(athlete.dateDeNaissance) }, { label: "Âge", value: age === null ? "—" : age + " ans" },
          { label: "Lieu de naissance", value: athlete.lieuNaissance }, { label: "Nationalité", value: athlete.nationalite },
        ]} />
        <DetailCard title="Contact" icon={Contact} fields={[{ label: "Téléphone", value: athlete.telephone }, { label: "E-mail", value: athlete.email }, { label: "Adresse", value: athlete.adresse }]} />
        <DetailCard title="Identifiants" icon={Fingerprint} fields={[{ label: "ID fédéral", value: athlete.idAthlete }, { label: "ID WA", value: athlete.idWa }, { label: "Statut", value: athlete.statut }]} />
        <DetailCard title="Observations" icon={Info} fields={[{ label: "Remarques", value: athlete.observations }]} />
      </div></TabsContent>
      <TabsContent value="affiliations"><AffiliationsPanel kind="athlete" actorId={athlete.idAthlete} /></TabsContent>
      <TabsContent value="licence"><LicencesComingSoon /></TabsContent>
    </Tabs>
  </div>
}
