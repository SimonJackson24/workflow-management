// core/frontend/src/utils/performance/LazyComponent.tsx

import React, { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LazyLoadProps {
  minHeight?: number | string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ children, minHeight = 200 }) => (
  <Suspense
    fallback={
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={minHeight}
      >
        <CircularProgress />
      </Box>
    }
  >
    {children}
  </Suspense>
);

// Example usage:
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Analytics = React.lazy(() => import('./components/Analytics'));

// core/frontend/src/utils/performance/ImageOptimizer.tsx

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@mui/material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  loading = 'lazy'
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const optimizedSrc = `${src}?w=${width}&q=${quality}`;

  return (
    <>
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          animation="wave"
        />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </>
  );
};

// core/frontend/src/utils/performance/VirtualScroll.tsx

import React, { useCallback } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

interface VirtualScrollProps<T> {
  items: T[];
  itemSize: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => Promise<void>;
  variableSize?: boolean;
}

export function VirtualScroll<T>({
  items,
  itemSize,
  renderItem,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  variableSize = false
}: VirtualScrollProps<T>) {
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  const isItemLoaded = useCallback(
    (index: number) => !hasNextPage || index < items.length,
    [hasNextPage, items.length]
  );

  const Row = useCallback(
    ({ index, style }) => {
      if (!isItemLoaded(index)) {
        return (
          <div style={style}>
            Loading...
          </div>
        );
      }
      return (
        <div style={style}>
          {renderItem(items[index], index)}
        </div>
      );
    },
    [items, renderItem, isItemLoaded]
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadNextPage}
        >
          {({ onItemsRendered, ref }) => (
            variableSize ? (
              <VariableSizeList
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={itemSize as (index: number) => number}
                onItemsRendered={onItemsRendered}
                ref={ref}
              >
                {Row}
              </VariableSizeList>
            ) : (
              <FixedSizeList
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={itemSize as number}
                onItemsRendered={onItemsRendered}
                ref={ref}
              >
                {Row}
              </FixedSizeList>
            )
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  );
}

// core/frontend/src/utils/performance/QueryOptimizer.ts

import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      suspense: true,
    },
  },
});

export const prefetchQueries = async (queries: Array<{ key: string; fn: () => Promise<any> }>) => {
  await Promise.all(
    queries.map(({ key, fn }) =>
      queryClient.prefetchQuery(key, fn, {
        staleTime: 5 * 60 * 1000,
      })
    )
  );
};

// core/frontend/src/utils/performance/MemoHelper.ts

export function memoizeFunction<T extends (...args: any[]) => any>(
  fn: T,
  getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args)
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Usage example:
const expensiveCalculation = memoizeFunction(
  (a: number, b: number) => {
    // Expensive calculation
    return a + b;
  }
);
