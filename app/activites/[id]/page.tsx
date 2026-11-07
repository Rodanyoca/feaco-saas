import { notFound } from "next/navigation"
import { ActivityDetail } from "@/components/activities/activity-detail"
import { loadActivityDetail } from "@/lib/activities"
export const runtime="nodejs"
export const dynamic="force-dynamic"
export default async function ActivityPage({params}:{params:Promise<{id:string}>}){const{id}=await params,detail=await loadActivityDetail(id);if(!detail)notFound();return <ActivityDetail detail={detail}/>} 
