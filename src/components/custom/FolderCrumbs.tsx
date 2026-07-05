import { useLocation, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { useMemo } from 'react';

export function FolderCrumbs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>-</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const renderCrumbs = useMemo(() => {
    return segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const cumulativePath = '/' + segments.slice(0, index + 1).join('/');

      return (
        <BreadcrumbItem key={cumulativePath}>
          {isLast ? (
            <BreadcrumbPage>{segment}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              onClick={(e) => {
                e.preventDefault();
                navigate(cumulativePath);
              }}
              href={cumulativePath}
            >
              {segment}
            </BreadcrumbLink>
          )}
          {!isLast && <BreadcrumbSeparator />}
        </BreadcrumbItem>
      );
    });
  }, [segments]);

  return (
    <Breadcrumb>
      <BreadcrumbList>{renderCrumbs}</BreadcrumbList>
    </Breadcrumb>
  );
}
