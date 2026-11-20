import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SavedNightCard from "../components/SavedNightCard";
import { paidNight } from "./nightFixture";

describe("SavedNightCard interactions", () => {
  test("calls onUnsave with the night id when the heart is clicked", async () => {
    const user = userEvent.setup();
    const onUnsave = jest.fn();
    render(
      <SavedNightCard night={paidNight} onUnsave={onUnsave} onBuyTickets={jest.fn()} />
    );

    await user.click(screen.getByRole("button", { name: `Unsave ${paidNight.title}` }));

    expect(onUnsave).toHaveBeenCalledTimes(1);
    expect(onUnsave).toHaveBeenCalledWith(paidNight.id);
  });

  test("calls onBuyTickets with the whole night object", async () => {
    const user = userEvent.setup();
    const onBuyTickets = jest.fn();
    render(
      <SavedNightCard night={paidNight} onUnsave={jest.fn()} onBuyTickets={onBuyTickets} />
    );

    await user.click(screen.getByRole("button", { name: /get tickets/i }));

    expect(onBuyTickets).toHaveBeenCalledTimes(1);
    expect(onBuyTickets).toHaveBeenCalledWith(paidNight);
  });

  test("clicking unsave does not trigger onBuyTickets", async () => {
    const user = userEvent.setup();
    const onUnsave = jest.fn();
    const onBuyTickets = jest.fn();
    render(
      <SavedNightCard night={paidNight} onUnsave={onUnsave} onBuyTickets={onBuyTickets} />
    );

    await user.click(screen.getByRole("button", { name: `Unsave ${paidNight.title}` }));

    expect(onBuyTickets).not.toHaveBeenCalled();
  });

  test("clicking get tickets does not trigger onUnsave", async () => {
    const user = userEvent.setup();
    const onUnsave = jest.fn();
    const onBuyTickets = jest.fn();
    render(
      <SavedNightCard night={paidNight} onUnsave={onUnsave} onBuyTickets={onBuyTickets} />
    );

    await user.click(screen.getByRole("button", { name: /get tickets/i }));

    expect(onUnsave).not.toHaveBeenCalled();
  });

  test("buttons are reachable and activatable by keyboard", async () => {
    const user = userEvent.setup();
    const onUnsave = jest.fn();
    render(
      <SavedNightCard night={paidNight} onUnsave={onUnsave} onBuyTickets={jest.fn()} />
    );

    await user.tab();
    expect(screen.getByRole("button", { name: `Unsave ${paidNight.title}` })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onUnsave).toHaveBeenCalledWith(paidNight.id);
  });
});