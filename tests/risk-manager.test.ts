import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("risk-manager", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can initialize risk parameters", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "initialize-risk-parameters",
      [],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can set user risk profile", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "set-user-risk-profile",
      [Cl.uint(5), Cl.uint(1000000), Cl.uint(3)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects invalid risk tolerance", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "set-user-risk-profile",
      [Cl.uint(11), Cl.uint(1000000), Cl.uint(3)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(201));
  });

  it("rejects zero max exposure", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "set-user-risk-profile",
      [Cl.uint(5), Cl.uint(0), Cl.uint(3)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(203));
  });

  it("can update strategy risk metrics", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "update-strategy-risk-metrics",
      [Cl.uint(1), Cl.uint(5), Cl.uint(2000), Cl.uint(1500), Cl.uint(12000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects risk metrics from non-owner", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "update-strategy-risk-metrics",
      [Cl.uint(1), Cl.uint(5), Cl.uint(2000), Cl.uint(1500), Cl.uint(12000)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(200));
  });

  it("can validate investment against risk profile", () => {
    simnet.callPublicFn(
      "risk-manager",
      "initialize-risk-parameters",
      [],
      deployer
    );
    simnet.callPublicFn(
      "risk-manager",
      "set-user-risk-profile",
      [Cl.uint(6), Cl.uint(1000000), Cl.uint(2)],
      wallet1
    );
    simnet.callPublicFn(
      "risk-manager",
      "update-strategy-risk-metrics",
      [Cl.uint(1), Cl.uint(5), Cl.uint(2000), Cl.uint(1500), Cl.uint(12000)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "risk-manager",
      "validate-investment",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(50000)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can set global risk multiplier", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "set-global-risk-multiplier",
      [Cl.uint(150)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects multiplier out of range", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "set-global-risk-multiplier",
      [Cl.uint(400)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(203));
  });

  it("can update portfolio risk", () => {
    const { result } = simnet.callPublicFn(
      "risk-manager",
      "update-portfolio-risk",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("returns none for unknown user profile", () => {
    const { result } = simnet.callReadOnlyFn(
      "risk-manager",
      "get-user-risk-profile",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeNone();
  });
});
