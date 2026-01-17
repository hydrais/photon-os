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
import { useSubmitApp } from "@/hooks/useSubmitApp";

type FormData = {
  bundleId: string;
  name: string;
  url: string;
  iconUrl: string;
  description: string;
};

type SubmitAppFormProps = {
  developerId: string;
  developerDisplayName: string;
  onSuccess?: () => void;
};

export function SubmitAppForm({
  developerId,
  developerDisplayName,
  onSuccess,
}: SubmitAppFormProps) {
  const { submit, loading, error } = useSubmitApp();
  const [formData, setFormData] = useState<FormData>({
    bundleId: "",
    name: "",
    url: "",
    iconUrl: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.bundleId.trim()) {
      errors.bundleId = "Bundle ID is required";
    } else if (!/^[a-z0-9]+(\.[a-z0-9]+)+$/i.test(formData.bundleId.trim())) {
      errors.bundleId = "Invalid format (e.g., com.example.myapp)";
    }

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

    const success = await submit({
      bundleId: formData.bundleId.trim(),
      name: formData.name.trim(),
      url: formData.url.trim(),
      iconUrl: formData.iconUrl?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      developerId,
      developerDisplayName,
    });

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
        <Field data-invalid={!!fieldErrors.bundleId}>
          <FieldLabel htmlFor="bundleId">Bundle ID</FieldLabel>
          <Input
            id="bundleId"
            placeholder="com.example.myapp"
            value={formData.bundleId}
            onChange={handleChange("bundleId")}
            aria-invalid={!!fieldErrors.bundleId}
          />
          <FieldError>{fieldErrors.bundleId}</FieldError>
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
          <FieldLabel>Author</FieldLabel>
          <Input value={developerDisplayName} disabled />
          <p className="text-xs text-muted-foreground mt-1">
            From your developer profile
          </p>
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

        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner className="size-4" /> : "Submit App"}
        </Button>
      </FieldGroup>
    </form>
  );
}
