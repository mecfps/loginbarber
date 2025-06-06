"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface NewBarberFormProps {
  tenantId: string
}

export function NewBarberForm({ tenantId }: NewBarberFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    status: "active",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validar dados
      if (!formData.name.trim()) throw new Error("O nome do barbeiro é obrigatório")

      // Criar barbeiro
      const { error } = await supabase.from("barbers").insert({
        tenant_id: Number.parseInt(tenantId),
        name: formData.name.trim(),
        specialty: formData.specialty.trim() || null,
        status: formData.status,
      })

      if (error) throw new Error(`Erro ao criar barbeiro: ${error.message}`)

      toast({
        title: "Barbeiro criado com sucesso",
        description: "O barbeiro foi adicionado à sua equipe.",
        variant: "default",
      })

      // Redirecionar para a lista de barbeiros
      router.push(`/dashboard/${tenantId}/barbers`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao criar o barbeiro")
      console.error("Erro ao criar barbeiro:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Barbeiro</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade (opcional)</Label>
              <Input
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Ex: Corte degradê, barba..."
                disabled={isLoading}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={handleStatusChange}
                disabled={isLoading}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="cursor-pointer">
                    Ativo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="cursor-pointer">
                    Inativo
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Barbeiro"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/${tenantId}/barbers`)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
