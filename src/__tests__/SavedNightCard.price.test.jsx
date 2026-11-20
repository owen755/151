import { render, screen } from "@testing-library/react";
import SavedNightCard from "../components/SavedNightCard";
import { paidNight } from "./nightFixture";

const renderWith = (overrides) =>
  render(
    <SavedNightCard
      night={{ ...paidNight, ...overrides }}
      onUnsave={jest.fn()}
      onBuyTickets={jest.fn()}
    />
  );

describe("SavedNightCard price badge", () => {
  test('shows "Free" when price is the string "free"', () => {
    renderWith({ price: "free" });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  test('shows "Free" regardless of letter case', () => {
    renderWith({ price: "FREE" });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  test('shows "Free" when price is 0 (number)', () => {
    renderWith({ price: 0 });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  test('shows "Free" when price is "0" (string)', () => {
    renderWith({ price: "0" });
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  test("shows the formatted price with the currency", () => {
    renderWith({ price: "4500", currency: "KES" });
    // Computed the same way as the component so it doesn't depend on locale
    const expected = `${Number(4500).toLocaleString()} KES`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("uses the currency from the event", () => {
    renderWith({ price: "20", currency: "USD" });
    expect(screen.getByText("20 USD")).toBeInTheDocument();
  });

  test("defaults the currency to KES when none is given", () => {
    renderWith({ price: "1000", currency: undefined });
    const expected = `${Number(1000).toLocaleString()} KES`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test('does not show "Free" for a paid event', () => {
    renderWith({ price: "4500" });
    expect(screen.queryByText("Free")).not.toBeInTheDocument();
  });
});