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

type ProfileFormData = {
  displayName: string;
  description: string;
};

type ProfileFormProps = {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  submitLabel: string;
};

export function ProfileForm({
  initialData,
  onSubmit,
  loading,
  error,
  submitLabel,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: initialData?.displayName || "",
    description: initialData?.description || "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.displayName.trim()) {
      errors.displayName = "Display name is required";
    } else if (formData.displayName.trim().length < 2) {
      errors.displayName = "Display name must be at least 2 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      displayName: formData.displayName.trim(),
      description: formData.description.trim(),
    });
  };

  const handleChange =
    (field: keyof ProfileFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!fieldErrors.displayName}>
          <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
          <Input
            id="displayName"
            placeholder="Your name or company name"
            value={formData.displayName}
            onChange={handleChange("displayName")}
            aria-invalid={!!fieldErrors.displayName}
          />
          <FieldError>{fieldErrors.displayName}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Bio (optional)</FieldLabel>
          <Textarea
            id="description"
            placeholder="Tell others about yourself or your company..."
            value={formData.description}
            onChange={handleChange("description")}
            rows={3}
          />
        </Field>

        {error && <div className="text-destructive text-sm">{error}</div>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner className="size-4" /> : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
