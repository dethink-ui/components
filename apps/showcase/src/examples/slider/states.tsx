"use client";
import { DethinkProvider, Slider } from "@dethink/components";

export function SliderStates() {
  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <Slider label="Small" size="sm" defaultValue={25} />
      <Slider label="Medium" defaultValue={50} />
      <Slider label="Large" size="lg" defaultValue={75} />
      <Slider label="Disabled" disabled defaultValue={35} />
      <DethinkProvider density="compact" dir="rtl">
        <Slider label="Compact · right to left" defaultValue={60} />
      </DethinkProvider>
    </div>
  );
}
