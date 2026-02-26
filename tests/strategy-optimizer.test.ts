import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("strategy-optimizer", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can create optimization config", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "create-optimization-config",
      [Cl.uint(1), Cl.uint(1), Cl.uint(1500), Cl.uint(500), Cl.uint(144)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("rejects invalid optimization type", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "create-optimization-config",
      [Cl.uint(1), Cl.uint(6), Cl.uint(1500), Cl.uint(500), Cl.uint(144)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(502));
  });

  it("rejects zero strategy id", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "create-optimization-config",
      [Cl.uint(0), Cl.uint(1), Cl.uint(1500), Cl.uint(500), Cl.uint(144)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(502));
  });

  it("can optimize a strategy", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "optimize-strategy",
      [Cl.uint(1), Cl.uint(3), Cl.stringAscii("bullish")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("can update strategy performance", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "update-strategy-performance",
      [Cl.uint(1), Cl.uint(2500), Cl.uint(800), Cl.uint(500), Cl.uint(6500)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects performance update from non-owner", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "update-strategy-performance",
      [Cl.uint(1), Cl.uint(2500), Cl.uint(800), Cl.uint(500), Cl.uint(6500)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(500));
  });

  it("rejects win rate above 100 percent", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "update-strategy-performance",
      [Cl.uint(1), Cl.uint(2500), Cl.uint(800), Cl.uint(500), Cl.uint(10001)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(502));
  });

  it("can get optimization recommendation", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "get-optimization-recommendation",
      [Cl.uint(1), Cl.uint(5), Cl.stringAscii("neutral")],
      deployer
    );
    expect(result.type).toBe("ok");
  });

  it("can toggle optimization config", () => {
    simnet.callPublicFn(
      "strategy-optimizer",
      "create-optimization-config",
      [Cl.uint(1), Cl.uint(2), Cl.uint(1000), Cl.uint(300), Cl.uint(288)],
      deployer
    );
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "toggle-optimization-config",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can set rebalance interval", () => {
    const { result } = simnet.callPublicFn(
      "strategy-optimizer",
      "set-rebalance-interval",
      [Cl.uint(288)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("returns none for non-existent config", () => {
    const { result } = simnet.callReadOnlyFn(
      "strategy-optimizer",
      "get-optimization-config",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeNone();
  });
});
