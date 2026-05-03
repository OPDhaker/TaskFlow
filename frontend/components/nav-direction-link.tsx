"use client";

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, PropsWithChildren } from "react";

import { setNavDirection, type NavDirection } from "../lib/nav-direction";

type Props = PropsWithChildren<
  LinkProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
      direction: NavDirection;
    }
>;

export function NavDirectionLink({ children, direction, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        setNavDirection(direction);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
