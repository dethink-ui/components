import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CarouselFeatureHighlights } from "@/examples/carousel/feature-highlights";
import { CarouselImageGallery } from "@/examples/carousel/image-gallery";
import { CarouselPricing } from "@/examples/carousel/pricing";
import { CarouselTestimonials } from "@/examples/carousel/testimonials";
import {
  carouselContentProps,
  carouselDotsProps,
  carouselProps,
} from "@/lib/props/carousel";

export const metadata: Metadata = {
  title: "Carousel",
  description:
    "Stage focused feature cards, image collections, pricing plans, and customer stories with accessible controls, drag, and reduced-motion-safe depth.",
};

export default function CarouselPage() {
  return (
    <DocsPage
      name="Carousel"
      description="A staged, keyboard-accessible carousel for content that benefits from one clear focal point. Use flat staging for media, tilt for comparable cards, and floor for a more editorial, spatial composition."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="These are compositional patterns, not separate components. Navigate with the controls, dots, or Arrow/Home/End keys after focusing a carousel. Every example uses the same Carousel primitives and its tokenized staging system."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="carousel/feature-highlights.tsx"
            title="Feature highlights"
            description="Tilt staging gives product capabilities a sense of depth while keeping their titles, context, and supporting metric readable at a glance."
            wide
          >
            <CarouselFeatureHighlights />
          </ExampleBlock>
          <ExampleBlock
            file="carousel/image-gallery.tsx"
            title="Editorial image gallery"
            description="Flat staging lets the image lead. Captions preserve enough context to browse a place, project, portfolio, or product collection without a separate detail view."
            wide
          >
            <CarouselImageGallery />
          </ExampleBlock>
          <ExampleBlock
            file="carousel/pricing.tsx"
            title="Plan explorer"
            description="A controlled carousel keeps an external purchase action synchronized with a compact, touch-friendly plan comparison."
            wide
          >
            <CarouselPricing />
          </ExampleBlock>
          <ExampleBlock
            file="carousel/testimonials.tsx"
            title="Customer testimonials"
            description="Floor staging gives longer quotes a deliberate presentation surface while retaining direct, labelled ways to move between stories."
            wide
          >
            <CarouselTestimonials />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="carousel"
        importCode={`import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@dethink/components";`}
      />

      <DocsSection
        id="accessibility"
        title="Accessibility"
        description="Carousel provides the landmark, slide semantics, focus safety, and motion fallback. The content you place inside each slide still needs a clear structure and an accurate accessible name."
      >
        <ul className="text-muted-foreground grid gap-3 text-sm leading-6 sm:grid-cols-2">
          <li className="border-border rounded-lg border p-4">
            Give every carousel a specific <code>aria-label</code> or
            <code>aria-labelledby</code> that identifies the content set.
          </li>
          <li className="border-border rounded-lg border p-4">
            Focus the viewport, then use Left/Right Arrow, Home, or End to
            navigate. Previous and next controls disable at the boundaries.
          </li>
          <li className="border-border rounded-lg border p-4">
            Label dots with their destination, such as a plan or testimonial,
            rather than an opaque number whenever the destination has a name.
          </li>
          <li className="border-border rounded-lg border p-4">
            Off-stage slides become inert and reduced motion flattens the 3D
            presentation into a calm opacity transition.
          </li>
        </ul>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="The root, content, and dots accept their standard native div attributes in addition to the documented API. Items and previous/next controls accept their native div and IconButton attributes respectively."
      >
        <div className="space-y-8">
          <PropsTable caption="Carousel props" rows={carouselProps} />
          <PropsTable
            caption="CarouselContent props"
            rows={carouselContentProps}
          />
          <PropsTable caption="CarouselDots props" rows={carouselDotsProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
