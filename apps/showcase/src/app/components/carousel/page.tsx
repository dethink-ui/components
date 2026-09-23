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
  description: "Let users browse a series of cards or images.",
};

export default function CarouselPage() {
  return (
    <DocsPage
      name="Carousel"
      description="Let users browse a series of cards or images."
    >
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
        id="examples"
        title="Examples"
        description="These are compositional patterns, not separate components. Navigate with the controls, dots, or Arrow/Home/End keys after focusing a carousel. Every example uses the same Carousel primitives and its tokenized staging system."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="carousel/feature-highlights.tsx"
            title="Feature highlights"
            description="Ribbon staging alternates card angles and heights. Change the presentation to compare all six modes without losing your place."
            wide
          >
            <CarouselFeatureHighlights />
          </ExampleBlock>
          <ExampleBlock
            file="carousel/image-gallery.tsx"
            title="Editorial image gallery"
            description="Arc staging curves the images toward the center while the selected caption and navigation remain level and readable."
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
            description="Fan staging gives each quote an angled, opaque surface. Neighboring cards soften while the active story stays crisp, with gentler angles in narrow containers."
            wide
          >
            <CarouselTestimonials />
          </ExampleBlock>
        </div>
      </DocsSection>

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
            Fan, arc and ribbon make inactive slide content inert. Legacy modes
            retain their visible-neighbor behavior. Reduced motion removes
            angles and blur, showing one centered card in the new modes.
          </li>
        </ul>
      </DocsSection>

      <DocsSection
        id="theming"
        title="Theming and migration"
        description="Existing flat, tilt and floor values remain supported. Choose fan for stories, arc for imagery, or ribbon for feature highlights; the controlled index and navigation API stay the same."
      >
        <div className="text-muted-foreground space-y-3 text-sm leading-6">
          <p>
            Use an opaque <code>bg-background</code> surface on overlapping card
            content. CarouselItem remains unstyled so images and custom surfaces
            compose naturally. Use content-aware heights for long text, rather
            than clipping quotes or attribution.
          </p>
          <p>
            Set <code>{"inactiveBlur={0}"}</code> for sharp previews. Tune{" "}
            <code>--carousel-card-size</code> and <code>--carousel-step</code>{" "}
            on CarouselContent; keep enough room around rotated corners. The new
            modes adapt to their container width, not only the window.
          </p>
          <p>
            Keep controls and captions outside rotated items. Only the active
            slide’s content is interactive in the new modes. Click a visible
            side card to center it, or use the arrows and named dots. Arrow,
            Home and End keys inside nested form controls retain their native
            behavior.
          </p>
          <p>
            Manual acceptance: navigate with Tab and Arrow/Home/End, drag in
            both directions, change reduced motion while mounted, check long
            text at 200% zoom, and verify focus never enters an obscured card.
            Screen-reader acceptance should confirm the region name, slide
            position and updated gallery caption.
          </p>
        </div>
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
