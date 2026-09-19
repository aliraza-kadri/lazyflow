"use client";

import { useState } from "react";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import type { ContactFormValues } from "@/lib/types";

const industries = [
  "Retail",
  "Garments",
  "Restaurants & Cafes",
  "Salons",
  "Clinics",
  "Real Estate",
  "E-commerce",
  "Service Business",
  "Other",
];

const initialValues: ContactFormValues = {
  name: "",
  business: "",
  whatsapp: "",
  email: "",
  industry: "",
  problem: "",
  process: "",
};

type Errors = Partial<Record<keyof ContactFormValues, string>>;

function validate(values: ContactFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.business.trim()) errors.business = "Please enter your business name.";

  if (!values.whatsapp.trim()) {
    errors.whatsapp = "Please enter your WhatsApp number.";
  } else if (!/^[+]?[\d\s-]{8,15}$/.test(values.whatsapp.trim())) {
    errors.whatsapp = "Enter a valid phone number.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.industry) errors.industry = "Please select your industry.";

  if (!values.problem.trim()) {
    errors.problem = "Please tell us what problem you're facing.";
  } else if (values.problem.trim().length < 10) {
    errors.problem = "Please add a little more detail (10+ characters).";
  }

  if (!values.process.trim()) {
    errors.process = "Please tell us which process takes too much time.";
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  function update<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          business: values.business,
          phone: values.whatsapp,
          email: values.email,
          industry: values.industry,
          problem: values.problem,
          process: values.process,
          website_hp: honeypot,
          source: "Website Form",
          status: "New",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-lf-border bg-lf-card px-8 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full lf-gradient-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-6 text-2xl font-bold text-lf-ink">Thanks, {values.name.split(" ")[0]}.</h3>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-lf-muted">
          We&apos;ve received your details. Our team will review your business and get back to
          you on WhatsApp or email shortly.
        </p>
        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => {
            setValues(initialValues);
            setSubmitted(false);
          }}
        >
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-lf-border bg-lf-card p-6 md:p-10">
      {/* Anti-spam honeypot (hidden from real users) */}
      <input
        type="text"
        name="website_hp"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden opacity-0 pointer-events-none absolute -left-[9999px]"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full Name" error={errors.name}>
          <TextInput
            placeholder="Your name"
            value={values.name}
            error={!!errors.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>

        <Field label="Business Name" error={errors.business}>
          <TextInput
            placeholder="Your business name"
            value={values.business}
            error={!!errors.business}
            onChange={(e) => update("business", e.target.value)}
          />
        </Field>

        <Field label="WhatsApp Number" error={errors.whatsapp}>
          <TextInput
            placeholder="+91 98765 43210"
            value={values.whatsapp}
            error={!!errors.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            placeholder="you@business.com"
            value={values.email}
            error={!!errors.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Industry" error={errors.industry}>
            <Select
              value={values.industry}
              error={!!errors.industry}
              onChange={(e) => update("industry", e.target.value)}
            >
              <option value="">Select your industry</option>
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="What problem are you facing?" error={errors.problem}>
            <TextArea
              placeholder="e.g. We miss leads because no one replies fast enough on WhatsApp"
              value={values.problem}
              error={!!errors.problem}
              onChange={(e) => update("problem", e.target.value)}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="What process takes too much time?" error={errors.process}>
            <TextArea
              placeholder="e.g. Manually updating our spreadsheet for every order"
              value={values.process}
              error={!!errors.process}
              onChange={(e) => update("process", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start gap-4">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? "Sending..." : "Send Details"}
        </Button>
        <p className="text-xs text-lf-muted">
          We usually respond within one business day. No spam, ever.
        </p>
      </div>
    </form>
  );
}
