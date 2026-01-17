import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useUpdateApp, type UpdateAppData } from "@/hooks/useUpdateApp";
import type { StoreApp } from "@/lib/supabase/client";

type FormData = {
  name: string;
  tagline: string;
  url: string;
  iconUrl: string;
  description: string;
};

type EditAppFormProps = {
  app: StoreApp;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function EditAppForm({ app, onSuccess, onCancel }: EditAppFormProps) {
  const { update, loading, error } = useUpdateApp();
  const [formData, setFormData] = useState<FormData>({
    name: app.name,
    tagline: app.tagline || "",
    url: app.url,
    iconUrl: app.icon_url || "",
    description: app.description || "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.url.trim()) {
      errors.url = "URL is required";
    } else {
      try {
        new URL(formData.url.trim());
      } catch {
        errors.url = "Invalid URL";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updateData: UpdateAppData = {
      name: formData.name.trim(),
      tagline: formData.tagline?.trim() || null,
      url: formData.url.trim(),
      iconUrl: formData.iconUrl?.trim() || null,
      description: formData.description?.trim() || null,
    };

    const success = await update(app.id, updateData);

    if (success) {
      onSuccess?.();
    }
  };

  const handleChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel>Bundle ID</FieldLabel>
          <Input value={app.bundle_id} disabled />
          <p className="text-xs text-muted-foreground mt-1">
            Bundle ID cannot be changed
          </p>
        </Field>

        <Field data-invalid={!!fieldErrors.name}>
          <FieldLabel htmlFor="name">App Name</FieldLabel>
          <Input
            id="name"
            placeholder="My App"
            value={formData.name}
            onChange={handleChange("name")}
            aria-invalid={!!fieldErrors.name}
          />
          <FieldError>{fieldErrors.name}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="tagline">Tagline (optional)</FieldLabel>
          <Input
            id="tagline"
            placeholder="A short phrase describing your app"
            value={formData.tagline}
            onChange={handleChange("tagline")}
          />
        </Field>

        <Field data-invalid={!!fieldErrors.url}>
          <FieldLabel htmlFor="url">App URL</FieldLabel>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/app"
            value={formData.url}
            onChange={handleChange("url")}
            aria-invalid={!!fieldErrors.url}
          />
          <FieldError>{fieldErrors.url}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="iconUrl">Icon URL (optional)</FieldLabel>
          <Input
            id="iconUrl"
            type="url"
            placeholder="https://example.com/icon.png"
            value={formData.iconUrl}
            onChange={handleChange("iconUrl")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea
            id="description"
            placeholder="A brief description of your app..."
            value={formData.description}
            onChange={handleChange("description")}
            rows={3}
          />
        </Field>

        {error && <div className="text-destructive text-sm">{error}</div>}

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? <Spinner className="size-4" /> : "Save Changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
