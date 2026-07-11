"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardTitle,
  DethinkProvider,
} from "@dethink/components";

const products = [
  {
    value: "core",
    title: "Core",
    description: "Shared workspaces and product analytics.",
    arabicTitle: "الأساس",
    arabicDescription: "مساحات عمل وتحليلات مشتركة.",
  },
  {
    value: "guard",
    title: "Guard",
    description: "Access policy, SSO, and audit trails.",
    arabicTitle: "الحماية",
    arabicDescription: "سياسات وصول وسجل تدقيق.",
  },
  {
    value: "relay",
    title: "Relay",
    description: "Automations, webhooks, and scheduled jobs.",
    arabicTitle: "الربط",
    arabicDescription: "أتمتة وخطافات ويب مجدولة.",
  },
] as const;

function ProductItems({ arabic = false }: { arabic?: boolean }) {
  return products.map((product) => (
    <CardScrollerItem
      key={product.value}
      value={product.value}
      label={
        arabic ? `اختيار ${product.arabicTitle}` : `Select ${product.title}`
      }
    >
      <Card as="article" className="min-h-44" shadow="none">
        <CardHeader>
          <CardTitle>{arabic ? product.arabicTitle : product.title}</CardTitle>
          <CardDescription>
            {arabic ? product.arabicDescription : product.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <span className="text-primary text-xs font-semibold tracking-wide uppercase">
            {arabic ? "وحدة المنتج" : "Product module"}
          </span>
        </CardContent>
      </Card>
    </CardScrollerItem>
  ));
}

export function CardScrollerThemes() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <DethinkProvider
        theme="light"
        density="comfortable"
        className="border-border bg-background text-foreground rounded-xl border p-4"
      >
        <p className="mb-4 text-sm font-medium">Light · comfortable</p>
        <CardScroller
          aria-label="Choose a product module in light theme"
          defaultValue="guard"
          maxVisibleCards={2}
        >
          {ProductItems({})}
        </CardScroller>
      </DethinkProvider>

      <DethinkProvider
        theme="dark"
        density="compact"
        dir="rtl"
        className="border-border bg-background text-foreground rounded-xl border p-4"
      >
        <p className="mb-4 text-sm font-medium">
          داكن · مدمج · من اليمين إلى اليسار
        </p>
        <CardScroller
          aria-label="اختيار وحدة المنتج"
          defaultValue="guard"
          maxVisibleCards={2}
          nextLabel="إظهار الوحدات التالية"
          previousLabel="إظهار الوحدات السابقة"
        >
          {ProductItems({ arabic: true })}
        </CardScroller>
      </DethinkProvider>
    </div>
  );
}
