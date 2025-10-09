'use client';
import DotGrid from '@/components/DotGrid';

export default function TestDotGridPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <div className="relative z-10 p-8">
        <h1 className="text-white text-3xl font-bold">DotGrid Test Page</h1>
        <p className="text-white mt-4">If you can see the dot grid background, it's working!</p>
      </div>
    </div>
  );
}