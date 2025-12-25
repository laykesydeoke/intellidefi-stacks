import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("compliance-monitor", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("user can register for compliance", () => {
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(2)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects invalid risk tier", () => {
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(6)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(701));
  });

  it("rejects duplicate registration", () => {
    simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(2)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(3)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(704));
  });

  it("owner can verify a user", () => {
    simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(3)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "verify-user",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );
    expect(result.type).toBe(7); // ok
  });

  it("rejects verification from non-officer", () => {
    simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(2)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "verify-user",
      [Cl.principal(wallet1), Cl.bool(true)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(700));
  });

  it("compliance officer can verify users", () => {
    simnet.callPublicFn(
      "compliance-monitor",
      "appoint-compliance-officer",
      [Cl.principal(wallet2)],
      deployer
    );
    simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(1)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "verify-user",
      [Cl.principal(wallet1), Cl.bool(true)],
      wallet2
    );
    expect(result.type).toBe(7); // ok
  });

  it("can check transaction compliance", () => {
    simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(2)],
      wallet1
    );
    simnet.callPublicFn(
      "compliance-monitor",
      "verify-user",
      [Cl.principal(wallet1), Cl.bool(true)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "check-transaction-compliance",
      [Cl.principal(wallet1), Cl.uint(1000000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects non-compliant user transaction", () => {
    simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(2)],
      wallet1
    );
    // Not verified - still pending

    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "check-transaction-compliance",
      [Cl.principal(wallet1), Cl.uint(1000000)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(703));
  });

  it("can suspend a user", () => {
    simnet.callPublicFn(
      "compliance-monitor",
      "register-user",
      [Cl.uint(3)],
      wallet1
    );
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "suspend-user",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can set compliance rules", () => {
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "set-compliance-rule",
      [Cl.uint(1), Cl.stringAscii("large-transfer-limit"), Cl.uint(50000000000), Cl.uint(144), Cl.bool(true)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can update transaction limits", () => {
    const { result } = simnet.callPublicFn(
      "compliance-monitor",
      "set-max-transaction-amount",
      [Cl.uint(200000000000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("unregistered user has no compliance", () => {
    const { result } = simnet.callReadOnlyFn(
      "compliance-monitor",
      "is-user-compliant",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result).toBeBool(false);
  });
});
