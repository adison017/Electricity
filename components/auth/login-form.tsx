"use client"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, register, getDorms } from "@/app/actions/auth"
import { Spinner } from "@/components/ui/spinner"

interface Dorm {
  id: number
  name: string
}

export function LoginForm() {
  const [dorms, setDorms] = useState<Dorm[]>([])
  const [selectedDorm, setSelectedDorm] = useState<string>("")
  const [useCustomDorm, setUseCustomDorm] = useState<boolean>(false)
  const [customDormName, setCustomDormName] = useState<string>("")
  const [electricityRate, setElectricityRate] = useState<string>("")

  useEffect(() => {
    getDorms().then(setDorms)
  }, [])

  const [loginState, loginAction, loginPending] = useActionState(
    async (_: { error?: string } | null, formData: FormData) => {
      return await login(formData)
    },
    null
  )

  const [registerState, registerAction, registerPending] = useActionState(
    async (_: { error?: string } | null, formData: FormData) => {
      if (useCustomDorm) {
        formData.set("dorm_name", customDormName)
        formData.set("electricity_rate", electricityRate)
      } else {
        formData.set("dorm_id", selectedDorm)
      }
      return await register(formData)
    },
    null
  )

  return (
    <Card>
      <Tabs defaultValue="login">
        <CardHeader className="pb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
            <TabsTrigger value="register">ลงทะเบียน</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="login" className="mt-0">
            <form action={loginAction}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="login-email">อีเมล</FieldLabel>
                  <Input
                    id="login-email"
                    name="email"
                    placeholder="กรอกอีเมลของคุณ"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="login-password">รหัสผ่าน</FieldLabel>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="กรอกรหัสผ่านของคุณ"
                    required
                  />
                </Field>
              </FieldGroup>
              {loginState?.error && (
                <p className="text-sm text-destructive mt-2">{loginState.error}</p>
              )}
              <Button type="submit" className="w-full mt-6" disabled={loginPending}>
                {loginPending && <Spinner className="mr-2" />}
                เข้าสู่ระบบ
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-0">
            <form action={registerAction}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="register-email">อีเมล</FieldLabel>
                  <Input
                    id="register-email"
                    name="email"
                    placeholder="เลือกอีเมลของคุณ"
                    required
                    minLength={3}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="register-password">รหัสผ่าน</FieldLabel>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="เลือกรหัสผ่านของคุณ"
                    required
                    minLength={6}
                  />
                </Field>
                <Field>
                  <FieldLabel>หอพัก</FieldLabel>
                  <div className="flex gap-2 mb-3">
                    <Button
                      type="button"
                      variant={!useCustomDorm ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCustomDorm(false)}
                      className="flex-1"
                    >
                      เลือกหอพักที่มีอยู่
                    </Button>
                    <Button
                      type="button"
                      variant={useCustomDorm ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCustomDorm(true)}
                      className="flex-1"
                    >
                      เพิ่มหอพักใหม่
                    </Button>
                  </div>
                  
                  {!useCustomDorm ? (
                    <Select value={selectedDorm} onValueChange={setSelectedDorm} required>
                      <SelectTrigger id="dorm">
                        <SelectValue placeholder="เลือกหอพักของคุณ" />
                      </SelectTrigger>
                      <SelectContent>
                        {dorms.map((dorm) => (
                          <SelectItem key={dorm.id} value={dorm.id.toString()}>
                            {dorm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-3">
                      <Field>
                        <FieldLabel htmlFor="custom-dorm-name">ชื่อหอพัก</FieldLabel>
                        <Input
                          id="custom-dorm-name"
                          value={customDormName}
                          onChange={(e) => setCustomDormName(e.target.value)}
                          placeholder="ระบุชื่อหอพัก"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="electricity-rate">อัตราค่าไฟฟ้า (บาท/หน่วย)</FieldLabel>
                        <Input
                          id="electricity-rate"
                          value={electricityRate}
                          onChange={(e) => setElectricityRate(e.target.value)}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="เช่น 8.00"
                          required
                        />
                      </Field>
                    </div>
                  )}
                </Field>
              </FieldGroup>
              {registerState?.error && (
                <p className="text-sm text-destructive mt-2">{registerState.error}</p>
              )}
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={registerPending || (!useCustomDorm && !selectedDorm) || (useCustomDorm && (!customDormName || !electricityRate))}
              >
                {registerPending && <Spinner className="mr-2" />}
                สร้างบัญชี
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
