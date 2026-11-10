import { Button, Field, Input, Textarea, Select } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { PublishInfo } from "@/components/publish-info";
import { MunicipalityOptions } from "@/components/municipality-options";
import { SERVICE_CATEGORIES, PILOT_MUNICIPALITY } from "@/lib/taxonomy";

export type ServiceDefaults = {
  id: string;
  providerName: string;
  category: string;
  serviceType: string;
  municipality: string;
  coverageZone: string | null;
  description: string;
  yearsExperience: number | null;
  phone: string;
  whatsapp: string | null;
  /** Fotos actuales: la principal primero. */
  photos: string[];
};

/** Formulario de servicio, compartido por "Ofrecer servicio" y "Editar servicio". */
export function ServiceForm({
  action,
  service,
  defaultName,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  service?: ServiceDefaults;
  /** Nombre por defecto al crear (el del usuario). */
  defaultName?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="p-4 space-y-4">
      {service ? (
        <input type="hidden" name="id" value={service.id} />
      ) : (
        <PublishInfo
          items={[
            "Tu nombre completo",
            "Categoría y tipo de servicio que ofreces",
            "Municipio, zona de cobertura y años de experiencia",
            "Descripción del servicio",
            "Datos de contacto (teléfono / WhatsApp)",
            "Fotos de trabajos realizados (opcional)",
          ]}
        />
      )}

      <Field label="Nombre completo" required>
        <Input name="providerName" defaultValue={service?.providerName ?? defaultName} required />
      </Field>

      <Field label="Categoría" required>
        <Select name="category" defaultValue={service?.category}>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.icon} {c.name}</option>
          ))}
        </Select>
      </Field>

      <Field label="Tipo de servicio" required>
        <Select name="serviceType" defaultValue={service?.serviceType}>
          {SERVICE_CATEGORIES.map((c) => (
            <optgroup key={c.key} label={c.name}>
              {c.types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Municipio">
          <Select name="municipality" defaultValue={service?.municipality ?? PILOT_MUNICIPALITY}>
            <MunicipalityOptions current={service?.municipality} />
          </Select>
        </Field>
        <Field label="Años de experiencia">
          <Input name="yearsExperience" type="number" inputMode="numeric" placeholder="5" defaultValue={service?.yearsExperience ?? ""} />
        </Field>
      </div>

      <Field label="Zona de cobertura">
        <Input name="coverageZone" placeholder="Ej: Mosquera y alrededores" defaultValue={service?.coverageZone ?? ""} />
      </Field>

      <Field label="Descripción del servicio" required>
        <Textarea name="description" placeholder="Describe los servicios que ofreces." defaultValue={service?.description} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono" required>
          <Input name="phone" type="tel" placeholder="3XX XXX XXXX" defaultValue={service?.phone} required />
        </Field>
        <Field label="WhatsApp">
          <Input name="whatsapp" type="tel" placeholder="3XX XXX XXXX" defaultValue={service?.whatsapp ?? ""} />
        </Field>
      </div>

      <Field label="Fotos de trabajos realizados">
        <ImageUpload name="photos" max={5} label="Fotos (opcional)" initial={service?.photos} />
      </Field>

      <Button size="lg" className="w-full">{submitLabel}</Button>
    </form>
  );
}
