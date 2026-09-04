import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
};

export function Container({ children, className = "", as: Tag = "div", id }: Props) {
  return (
    <Tag id={id} className={`container-x ${className}`.trim()}>
      {children}
    </Tag>
  );
}
