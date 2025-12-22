import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("strategy-engine", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can create a strategy", () => {
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("btc-momentum"), Cl.uint(1000), Cl.uint(1000000), Cl.uint(5)],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("rejects strategy with zero min amount", () => {
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("bad-strategy"), Cl.uint(0), Cl.uint(1000000), Cl.uint(5)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(104));
  });

  it("rejects risk level above 10", () => {
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("risky"), Cl.uint(100), Cl.uint(1000000), Cl.uint(11)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(104));
  });

  it("can invest in an active strategy", () => {
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("yield-farm"), Cl.uint(500), Cl.uint(500000), Cl.uint(3)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "invest-in-strategy",
      [Cl.uint(1), Cl.uint(5000)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects investment below minimum", () => {
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("high-min"), Cl.uint(10000), Cl.uint(500000), Cl.uint(5)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "invest-in-strategy",
      [Cl.uint(1), Cl.uint(100)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(102));
  });

  it("can withdraw from strategy", () => {
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("withdraw-test"), Cl.uint(100), Cl.uint(100000), Cl.uint(4)],
      wallet1
    );
    simnet.callPublicFn(
      "strategy-engine",
      "invest-in-strategy",
      [Cl.uint(1), Cl.uint(5000)],
      wallet2
    );
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "withdraw-from-strategy",
      [Cl.uint(1), Cl.uint(2000)],
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects withdrawal exceeding balance", () => {
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("small-bal"), Cl.uint(100), Cl.uint(100000), Cl.uint(3)],
      wallet1
    );
    simnet.callPublicFn(
      "strategy-engine",
      "invest-in-strategy",
      [Cl.uint(1), Cl.uint(1000)],
      wallet2
    );
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "withdraw-from-strategy",
      [Cl.uint(1), Cl.uint(5000)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(102));
  });

  it("can toggle strategy status", () => {
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("toggle-test"), Cl.uint(100), Cl.uint(100000), Cl.uint(5)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "toggle-strategy-status",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects toggle from non-creator", () => {
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("auth-test"), Cl.uint(100), Cl.uint(100000), Cl.uint(5)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "strategy-engine",
      "toggle-strategy-status",
      [Cl.uint(1)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(100));
  });

  it("increments strategy counter", () => {
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("counter-a"), Cl.uint(100), Cl.uint(100000), Cl.uint(3)],
      wallet1
    );
    simnet.callPublicFn(
      "strategy-engine",
      "create-strategy",
      [Cl.stringAscii("counter-b"), Cl.uint(200), Cl.uint(200000), Cl.uint(7)],
      wallet1
    );
    const { result } = simnet.callReadOnlyFn(
      "strategy-engine",
      "get-strategy-counter",
      [],
      deployer
    );
    expect(result).toBeUint(2);
  });

  it("returns none for non-existent strategy", () => {
    const { result } = simnet.callReadOnlyFn(
      "strategy-engine",
      "get-strategy",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeNone();
  });
});
