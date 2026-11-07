import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { LicencesComingSoon } from "@/components/licences/licences-coming-soon"
export default function Page() { return <DashboardLayout><Header title="Licences" subtitle="FEACO" /><main className="p-6"><LicencesComingSoon /></main></DashboardLayout> }
