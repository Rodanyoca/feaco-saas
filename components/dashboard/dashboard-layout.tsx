"use client"

import { createContext, useContext, useState } from "react"
import { DashboardNavigationProvider } from "./dashboard-navigation-context"
import { Sidebar } from "./sidebar"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardFrameContext = createContext(false)

export function DashboardShell({ children }: DashboardLayoutProps) {
  return <DashboardFrame>{children}</DashboardFrame>
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const insideFrame = useContext(DashboardFrameContext)
  if (insideFrame) return <>{children}</>
  return <DashboardFrame>{children}</DashboardFrame>
}

function DashboardFrame({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <DashboardFrameContext.Provider value={true}>
    <div className="flex min-h-dvh bg-background">
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <Sidebar />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 max-w-[88vw] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&_[data-slot=sheet-close]]:right-3 [&_[data-slot=sheet-close]]:top-5 [&_[data-slot=sheet-close]]:text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation principale</SheetTitle>
          <SheetDescription className="sr-only">Accéder aux modules de gestion FEACO</SheetDescription>
          <Sidebar collapsible={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
        <DashboardNavigationProvider value={() => setMobileOpen(true)}>
          <main className="min-w-0 flex-1">{children}</main>
        </DashboardNavigationProvider>
      </Sheet>
    </div>
    </DashboardFrameContext.Provider>
  )
}
