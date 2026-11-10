import { Button, Field, Input, Textarea, Select } from "@/components/ui";
import { PublishInfo } from "@/components/publish-info";
import { MunicipalityOptions } from "@/components/municipality-options";
import { JOB_SECTORS, CONTRACT_TYPES, PILOT_MUNICIPALITY } from "@/lib/taxonomy";

export type JobDefaults = {
  id: string;
  companyName: string;
  sector: string;
  title: string;
  contractType: string;
  workday: string | null;
  salary: number | null;
  functions: string;
  requirements: string;
  experience: string | null;
  municipality: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  active: boolean;
};

/** Formulario de vacante, compartido por "Publicar vacante" y "Editar vacante". */
export function JobForm({
  action,
  job,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  job?: JobDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="p-4 space-y-4">
      {job ? (
        <input type="hidden" name="id" value={job.id} />
      ) : (
        <PublishInfo
          items={[
            "Empresa y sector",
            "Cargo, tipo de contrato y jornada",
            "Salario aproximado y municipio",
            "Funciones, requisitos y experiencia requerida",
            "Dirección aproximada",
            "Datos de contacto (teléfono, WhatsApp o correo)",
          ]}
        />
      )}

      {job && (
        <label className="flex items-start gap-2.5 text-sm rounded-2xl border border-line bg-surface p-3">
          <input type="checkbox" name="active" defaultChecked={job.active} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-strong" />
          <span>
            <b className="text-ink">Vacante activa</b>
            <span className="block text-ink-soft">Si la desmarcas se oculta de los listados sin borrarla.</span>
          </span>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Empresa" required>
          <Input name="companyName" placeholder="Nombre de la empresa" defaultValue={job?.companyName} required />
        </Field>
        <Field label="Sector">
          <Select name="sector" defaultValue={job?.sector}>
            {JOB_SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Cargo / puesto" required>
        <Input name="title" placeholder="Ej: Auxiliar de cocina" defaultValue={job?.title} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo de contrato">
          <Select name="contractType" defaultValue={job?.contractType}>
            {CONTRACT_TYPES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Jornada">
          <Input name="workday" placeholder="Diurna / Nocturna" defaultValue={job?.workday ?? ""} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Salario aproximado">
          <Input name="salary" type="number" inputMode="numeric" placeholder="1300000" defaultValue={job?.salary ?? ""} />
        </Field>
        <Field label="Municipio">
          <Select name="municipality" defaultValue={job?.municipality ?? PILOT_MUNICIPALITY}>
            <MunicipalityOptions current={job?.municipality} />
          </Select>
        </Field>
      </div>

      <Field label="Funciones del cargo" required>
        <Textarea name="functions" placeholder="Describe las funciones principales." defaultValue={job?.functions} required />
      </Field>
      <Field label="Requisitos">
        <Textarea name="requirements" placeholder="Requisitos del candidato." defaultValue={job?.requirements} />
      </Field>
      <Field label="Experiencia requerida">
        <Input name="experience" placeholder="Ej: 6 meses a 1 año" defaultValue={job?.experience ?? ""} />
      </Field>

      <Field label="Dirección aproximada">
        <Input name="address" placeholder="Sector / dirección" defaultValue={job?.address ?? ""} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono">
          <Input name="phone" type="tel" placeholder="3XX XXX XXXX" defaultValue={job?.phone ?? ""} />
        </Field>
        <Field label="WhatsApp">
          <Input name="whatsapp" type="tel" placeholder="3XX XXX XXXX" defaultValue={job?.whatsapp ?? ""} />
        </Field>
      </div>
      <Field label="Correo de contacto">
        <Input name="email" type="email" placeholder="rrhh@empresa.co" defaultValue={job?.email ?? ""} />
      </Field>

      <Button size="lg" className="w-full">{submitLabel}</Button>
    </form>
  );
}
