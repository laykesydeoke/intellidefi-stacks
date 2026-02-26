import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("ai-oracle", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can register an oracle", () => {
    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "register-oracle",
      [
        Cl.stringAscii("market-analyzer"),
        Cl.uint(1),
        Cl.stringAscii("https://api.intellidefi.com/oracle/market"),
        Cl.uint(10)
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("rejects oracle registration from non-owner", () => {
    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "register-oracle",
      [
        Cl.stringAscii("unauthorized"),
        Cl.uint(1),
        Cl.stringAscii("https://fake.com"),
        Cl.uint(10)
      ],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(400));
  });

  it("rejects invalid oracle type", () => {
    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "register-oracle",
      [
        Cl.stringAscii("bad-type"),
        Cl.uint(6),
        Cl.stringAscii("https://api.test.com"),
        Cl.uint(10)
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(402));
  });

  it("can authorize an updater", () => {
    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "authorize-updater",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can update oracle data", () => {
    simnet.callPublicFn(
      "ai-oracle",
      "register-oracle",
      [
        Cl.stringAscii("price-oracle"),
        Cl.uint(1),
        Cl.stringAscii("https://api.intellidefi.com/prices"),
        Cl.uint(6)
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "update-oracle-data",
      [Cl.uint(1), Cl.stringAscii("btc-price"), Cl.stringAscii("67500.00"), Cl.uint(9500)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects data below confidence threshold", () => {
    simnet.callPublicFn(
      "ai-oracle",
      "register-oracle",
      [
        Cl.stringAscii("low-conf"),
        Cl.uint(2),
        Cl.stringAscii("https://api.test.com"),
        Cl.uint(6)
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "update-oracle-data",
      [Cl.uint(1), Cl.stringAscii("test-key"), Cl.stringAscii("test"), Cl.uint(5000)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(404));
  });

  it("can create an AI prediction", () => {
    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "create-ai-prediction",
      [Cl.uint(1), Cl.uint(1500), Cl.uint(4), Cl.uint(4320), Cl.uint(8500)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("can get AI recommendation", () => {
    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "get-ai-recommendation",
      [Cl.uint(1)],
      deployer
    );
    expect(result.type).toBe("ok");
  });

  it("can toggle oracle status", () => {
    simnet.callPublicFn(
      "ai-oracle",
      "register-oracle",
      [
        Cl.stringAscii("toggle-oracle"),
        Cl.uint(3),
        Cl.stringAscii("https://api.test.com"),
        Cl.uint(12)
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "toggle-oracle-status",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can set confidence threshold", () => {
    const { result } = simnet.callPublicFn(
      "ai-oracle",
      "set-confidence-threshold",
      [Cl.uint(8000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("returns none for non-existent oracle", () => {
    const { result } = simnet.callReadOnlyFn(
      "ai-oracle",
      "get-oracle",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeNone();
  });
});
