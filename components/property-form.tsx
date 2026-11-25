import { Button, Field, Input, Textarea, Select } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { PublishInfo } from "@/components/publish-info";
import { MunicipalityOptions } from "@/components/municipality-options";
import { OFFER_TYPES, PILOT_MUNICIPALITY, PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/taxonomy";

export type PropertyDefaults = {
  id: string;
  offerType: string;
  propertyType: string;
  municipality: string;
  neighborhood: string | null;
  address: string | null;
  area: number | null;
  rooms: number | null;
  bathrooms: number | null;
  parking: boolean;
  stratum: number | null;
  price: number | null;
  description: string;
  services: string | null;
  ownerName: string;
  phone: string;
  whatsapp: string | null;
  status: string;
  photos: string[];
};

/** Formulario de inmueble, compartido por "Publicar inmueble" y "Editar inmueble". */
export function PropertyForm({
  action,
  property,
  defaultName,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  property?: PropertyDefaults;
  /** Nombre del responsable por defecto al crear. */
  defaultName?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="p-4 space-y-4">
      {property ? (
        <>
          <input type="hidden" name="id" value={property.id} />
          <Field label="Estado del anuncio" hint="Los inmuebles cerrados no aparecen en los listados.">
            <Select name="status" defaultValue={property.status}>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </Select>
          </Field>
        </>
      ) : (
        <PublishInfo
          items={[
            "Tipo de oferta (arriendo, venta o permuta) y tipo de inmueble",
            "Ubicación: municipio, barrio y dirección aproximada",
            "Precio, área, habitaciones, baños y estrato",
            "Descripción y servicios incluidos",
            "Datos de contacto (teléfono / WhatsApp)",
            "De 1 a 5 fotografías del inmueble",
          ]}
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo de oferta" required>
          <Select name="offerType" defaultValue={property?.offerType}>
            {OFFER_TYPES.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de inmueble" required>
          <Select name="propertyType" defaultValue={property?.propertyType}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Municipio">
          <Select name="municipality" defaultValue={property?.municipality ?? PILOT_MUNICIPALITY}>
            <MunicipalityOptions current={property?.municipality} />
          </Select>
        </Field>
        <Field label="Barrio / sector">
          <Input name="neighborhood" defaultValue={property?.neighborhood ?? ""} placeholder="Ej: Centro" />
        </Field>
      </div>

      <Field label="Dirección aproximada">
        <Input name="address" defaultValue={property?.address ?? ""} placeholder="Calle 00 # 0-00" />
      </Field>

      <Field label="Precio (COP)" required hint="Valor de arriendo o venta">
        <Input name="price" defaultValue={property?.price ?? ""} type="number" inputMode="numeric" placeholder="900000" />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Habitaciones">
          <Input name="rooms" defaultValue={property?.rooms ?? ""} type="number" inputMode="numeric" placeholder="3" />
        </Field>
        <Field label="Baños">
          <Input name="bathrooms" defaultValue={property?.bathrooms ?? ""} type="number" inputMode="numeric" placeholder="2" />
        </Field>
        <Field label="Área m²">
          <Input name="area" defaultValue={property?.area ?? ""} type="number" inputMode="numeric" placeholder="80" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <Field label="Estrato">
          <Input name="stratum" defaultValue={property?.stratum ?? ""} type="number" inputMode="numeric" placeholder="3" />
        </Field>
        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" name="parking" defaultChecked={property?.parking} className="h-5 w-5 accent-brand-strong" />
          <span className="text-sm font-medium">Tiene parqueadero</span>
        </label>
      </div>

      <Field label="Descripción">
        <Textarea name="description" defaultValue={property?.description} placeholder="Describe el inmueble, su ubicación y ventajas." />
      </Field>
      <Field label="Servicios incluidos">
        <Input name="services" defaultValue={property?.services ?? ""} placeholder="Agua, luz, gas, internet…" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono" required>
          <Input name="phone" type="tel" defaultValue={property?.phone} placeholder="3XX XXX XXXX" required />
        </Field>
        <Field label="WhatsApp">
          <Input name="whatsapp" defaultValue={property?.whatsapp ?? ""} type="tel" placeholder="3XX XXX XXXX" />
        </Field>
      </div>
      <Field label="Nombre del responsable">
        <Input name="ownerName" defaultValue={property?.ownerName ?? defaultName} />
      </Field>

      <Field label="Fotografías" hint="Mínimo 1, máximo 5">
        <ImageUpload name="photos" max={5} label="Fotos del inmueble" initial={property?.photos} />
      </Field>

      <Button size="lg" className="w-full">{submitLabel}</Button>
    </form>
  );
}
