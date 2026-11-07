import "server-only"
import { getArbitres } from "@/lib/data"
import { getArbitreGrades } from "@/lib/actor-references"

export async function getIdentityArbitres() {
  const [actors, grades] = await Promise.all([getArbitres(), getArbitreGrades()])
  const names = new Map(grades.map(grade => [grade.id, grade.nom]))
  return actors.map(actor => ({ ...actor, grade: names.get(actor.idGrade) || actor.grade, niveau: names.get(actor.idGrade) || actor.niveau }))
}
