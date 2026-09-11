import Button from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ReactNode } from "react";

export default function WhatsAppButton({
  message,
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}: {
  message: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "md" | "lg";
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <Button
      href={buildWhatsAppLink(message)}
      external
      variant={variant}
      size={size}
      className={className}
      icon={icon}
    >
      {children}
    </Button>
  );
}
