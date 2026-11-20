import { render, screen } from "@testing-library/react";
import SavedNightCard from "../components/SavedNightCard";
import { paidNight } from "./nightFixture";

const setup = (night = paidNight) =>
  render(<SavedNightCard night={night} onUnsave={jest.fn()} onBuyTickets={jest.fn()} />);

describe("SavedNightCard rendering", () => {
  test("renders an article element", () => {
    setup();
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  test("renders the title in an h3", () => {
    setup();
    expect(
      screen.getByRole("heading", { level: 3, name: paidNight.title })
    ).toBeInTheDocument();
  });

  test("renders the category", () => {
    setup();
    expect(screen.getByText("music")).toBeInTheDocument();
  });

  test("renders the start and end time", () => {
    setup();
    expect(screen.getByText(/19:00 – Till Dawn/)).toBeInTheDocument();
  });

  test("renders the venue name", () => {
    setup();
    expect(screen.getByText(/Uhuru Gardens/)).toBeInTheDocument();
  });

  test("does not crash when location is missing", () => {
    const { location, ...noLocation } = paidNight;
    setup(noLocation);
    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.queryByText(/Uhuru Gardens/)).not.toBeInTheDocument();
  });

  test("renders the unsave and get tickets buttons", () => {
    setup();
    expect(
      screen.getByRole("button", { name: `Unsave ${paidNight.title}` })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get tickets/i })).toBeInTheDocument();
  });
});