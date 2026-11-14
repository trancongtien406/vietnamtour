"use client";

import Form from "next/form";
import type { ComponentProps } from "react";

/** A GET form that re-submits whenever a select or checkbox changes. */
export function AutoSubmitForm(props: ComponentProps<typeof Form>) {
  return (
    <Form
      {...props}
      onChange={(e) => {
        const t = e.target as HTMLElement;
        if (t instanceof HTMLSelectElement || (t instanceof HTMLInputElement && (t.type === "checkbox" || t.type === "radio"))) {
          e.currentTarget.requestSubmit();
        }
      }}
    />
  );
}
