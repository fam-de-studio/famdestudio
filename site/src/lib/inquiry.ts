/**
 * Shared shape and formatting for quote requests, used by the form
 * (WhatsApp / mailto text) and the API route (email body).
 */
export type Inquiry = {
  name: string;
  company: string;
  country: string;
  email: string;
  projectType: string;
  quantity: string;
  finishing: string;
  details: string;
};

export function inquirySubject(i: Pick<Inquiry, "projectType" | "quantity">) {
  return `Quote request — ${i.projectType} (${i.quantity || "qty tbc"})`;
}

export function formatInquiry(i: Inquiry) {
  return [
    `Name: ${i.name}`,
    `Company / Brand: ${i.company || "-"}`,
    `Country: ${i.country || "-"}`,
    `Email: ${i.email}`,
    `Project type: ${i.projectType}`,
    `Estimated quantity: ${i.quantity || "-"}`,
    `Finishing: ${i.finishing || "-"}`,
    "",
    i.details,
  ].join("\n");
}

/** wa.me link with the request prefilled; the visitor only presses Send. */
export function whatsappUrl(number: string, i: Inquiry) {
  const digits = number.replace(/\D/g, "");
  const text = `${inquirySubject(i)}\n\n${formatInquiry(i)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
