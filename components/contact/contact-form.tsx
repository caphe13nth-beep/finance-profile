"use client";

import { useActionState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitContactAction } from "@/app/actions/contact";
import { useToast } from "@/components/toast";
import { useTranslations } from "next-intl";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(submitContactAction, {
    success: false,
    error: null,
  });

  const {
    register,
    formState: { errors },
    reset,
    trigger,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const { toast } = useToast();

  // Reset form on success
  useEffect(() => {
    if (state.success) {
      reset();
      toast(t("sentToast"), "success");
    }
    if (state.error) {
      toast(state.error, "error");
    }
  }, [state.success, state.error, reset, toast]);

  async function handleSubmit(formData: FormData) {
    const valid = await trigger();
    if (!valid) return;
    action(formData);
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";
  const labelClass = "text-sm font-medium text-foreground";
  const errorClass = "mt-1 text-xs text-destructive";

  if (state.success) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-accent/30 bg-accent/5 px-6 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-accent" />
        <h3 className="mt-4 font-heading text-xl font-bold">{t("successHeading")}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("successDescription")}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          {t("name")} <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          {...register("name")}
          placeholder={t("namePlaceholder")}
          className={`mt-1.5 ${inputClass}`}
          disabled={pending}
        />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          {t("email")} <span className="text-destructive">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          placeholder={t("emailPlaceholder")}
          className={`mt-1.5 ${inputClass}`}
          disabled={pending}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className={labelClass}>
          {t("subject")}
        </label>
        <input
          id="subject"
          {...register("subject")}
          placeholder={t("subjectPlaceholder")}
          className={`mt-1.5 ${inputClass}`}
          disabled={pending}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClass}>
          {t("message")} <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          {...register("message")}
          rows={5}
          placeholder={t("messagePlaceholder")}
          className={`mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50`}
          disabled={pending}
        />
        {errors.message && (
          <p className={errorClass}>{errors.message.message}</p>
        )}
      </div>

      {/* Server error */}
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
      >
        {pending ? (
          t("sending")
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t("send")}
          </>
        )}
      </button>
    </form>
  );
}
