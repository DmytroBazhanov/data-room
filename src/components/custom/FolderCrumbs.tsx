import { useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const params = useParams<{ roomId: string; '*': string }>();

  const roomId = params.roomId;
  // Splat segments are already decoded by react-router
  const folderSegments = useMemo(() => {
    if (!params['*'] || params['*'].length === 0) return [];
    return params['*'].split('/');
  }, [params]);

  const renderCrumbs = useMemo(() => {
    if (!roomId) {
      return (
        <BreadcrumbItem>
          <BreadcrumbPage>-</BreadcrumbPage>
        </BreadcrumbItem>
      );
    }

    // Build all segments: room name first, then folder segments
    const allSegments = [roomId, ...folderSegments];

    return allSegments.map((segment, index) => {
      const isLast = index === allSegments.length - 1;

      // Build cumulative encoded path
      const encodedParts = allSegments
        .slice(0, index + 1)
        .map(encodeURIComponent);
      const cumulativePath = '/' + encodedParts.join('/');

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
  }, [roomId, folderSegments, navigate]);

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xl">{renderCrumbs}</BreadcrumbList>
    </Breadcrumb>
  );
}
