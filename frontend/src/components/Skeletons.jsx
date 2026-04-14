import React from 'react';
import { Card, CardContent } from './ui/card';

// Generic skeleton shimmer box
function Shimmer({ className = '' }) {
  return (
    <div className={`bg-muted rounded-lg animate-pulse ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-4 w-96" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <Card className="border-border h-56 flex items-center justify-center">
            <CardContent className="flex items-center gap-8 p-8">
              <Shimmer className="w-40 h-40 rounded-full" />
              <div className="flex flex-col gap-3 flex-1">
                <Shimmer className="h-7 w-40" />
                <Shimmer className="h-4 w-56" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="border-border flex-1"><CardContent className="p-6"><Shimmer className="h-24 w-full" /></CardContent></Card>
          <Card className="border-border flex-1"><CardContent className="p-6"><Shimmer className="h-24 w-full" /></CardContent></Card>
        </div>
      </div>
      <Card className="border-border">
        <CardContent className="p-6 flex flex-col gap-3">
          <Shimmer className="h-5 w-32" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-4 w-48" />
        </CardContent>
      </Card>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="p-6 flex flex-col gap-4">
            <Shimmer className="w-12 h-12 rounded-xl" />
            <Shimmer className="h-5 w-3/4" />
            <Shimmer className="h-4 w-1/2" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-5/6" />
            <Shimmer className="h-9 w-full rounded-lg mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shimmer className="w-10 h-10 rounded-xl" />
              <div className="flex flex-col gap-2">
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-3 w-16" />
              </div>
            </div>
            <div className="flex gap-6">
              <Shimmer className="h-4 w-16" />
              <Shimmer className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
