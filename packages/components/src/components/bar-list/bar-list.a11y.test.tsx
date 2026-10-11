import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import { BarList } from ".";

const data = [
  { label: "Direct", value: 4200, href: "#direct" },
  { label: "Search", value: 3100, href: "#search" },
  { label: "Social", value: 900, href: "#social" },
  { label: "Email", value: 450, href: "#email" },
];

it("has no automated accessibility violations", async () => {
  const { container } = render(
    <section aria-label="Traffic sources">
      <BarList
        aria-label="Top sources"
        data={data}
        limit={2}
        labelHeader="Source"
        valueHeader="Visits"
      />
      <BarList
        data={data.map(({ href: _href, ...row }) => row)}
        onItemClick={() => {}}
      />
      <BarList data={[]} aria-label="Nothing yet" />
    </section>,
  );
  expect((await axe(container)).violations).toEqual([]);
});
