import { render, screen, fireEvent } from "@testing-library/react";
import SavedNightCard from "../components/SavedNightCard";
import { paidNight } from "./nightFixture";

const FALLBACK_HOST = "images.unsplash.com/photo-1514525253161-7a46d19cd819";

const setup = (night = paidNight) =>
  render(<SavedNightCard night={night} onUnsave={jest.fn()} onBuyTickets={jest.fn()} />);

describe("SavedNightCard image", () => {
  test("uses the night image as src", () => {
    setup();
    const img = screen.getByRole("img", { name: paidNight.title });
    expect(img).toHaveAttribute("src", paidNight.image);
  });

  test("uses the night title as alt text", () => {
    setup();
    expect(screen.getByAltText(paidNight.title)).toBeInTheDocument();
  });

  test("swaps to the fallback image when the image fails to load", () => {
    setup();
    const img = screen.getByRole("img", { name: paidNight.title });

    fireEvent.error(img);

    expect(img.getAttribute("src")).toContain(FALLBACK_HOST);
  });

  test("keeps the original image when no error occurs", () => {
    setup();
    const img = screen.getByRole("img", { name: paidNight.title });
    expect(img.getAttribute("src")).not.toContain(FALLBACK_HOST);
  });

  test("the heart svg is not exposed as an image", () => {
    setup();
    // Only the poster should have the img role
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});