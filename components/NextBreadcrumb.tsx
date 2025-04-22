"use client";
import React, { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/shadcn/ui/breadcrumbs"

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({
  listClasses,
  activeClasses,
  capitalizeLinks,
}: TBreadCrumbProps) => {
  const router = useRouter();
  const paths = usePathname();
  if (!paths) return (<></>)

  const pathNames = paths.split('/').filter((path) => path);

  return (
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathNames.length > 0 && (<BreadcrumbSeparator />)}
            {pathNames.map((link, index) => {
                let href = `/${pathNames.slice(0, index + 1).join('/')}`;
                let itemClasses =
                  paths === href ? `${listClasses} ${activeClasses}` : listClasses;
                let itemLink = capitalizeLinks
                  ? link[0].toUpperCase() + link.slice(1, link.length)
                  : link;
                return (
                    <BreadcrumbItem key={index}>
                        <BreadcrumbLink className={itemClasses} onClick={() => {
                          router.push(href);
                        }}>{itemLink}</BreadcrumbLink>
                    </BreadcrumbItem>
                )
            })}
        </BreadcrumbList>
    </Breadcrumb>
  );
};

export default NextBreadcrumb;