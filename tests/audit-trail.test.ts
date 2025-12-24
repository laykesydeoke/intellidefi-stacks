import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("audit-trail", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("owner can log an action", () => {
    const { result } = simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(1), Cl.uint(100), Cl.uint(50000), Cl.stringAscii("User deposited funds")],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("rejects log from unauthorized caller", () => {
    const { result } = simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(1), Cl.uint(100), Cl.uint(50000), Cl.stringAscii("Unauthorized log")],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(603));
  });

  it("authorized logger can log actions", () => {
    simnet.callPublicFn(
      "audit-trail",
      "authorize-logger",
      [Cl.principal(wallet1)],
      deployer
    );
    const { result } = simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(3), Cl.uint(1), Cl.uint(0), Cl.stringAscii("Strategy created")],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("rejects invalid action type", () => {
    const { result } = simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(9), Cl.uint(1), Cl.uint(0), Cl.stringAscii("Invalid action")],
      deployer
    );
    expect(result).toBeErr(Cl.uint(601));
  });

  it("rejects empty description", () => {
    const { result } = simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(1), Cl.uint(1), Cl.uint(5000), Cl.stringAscii("")],
      deployer
    );
    expect(result).toBeErr(Cl.uint(601));
  });

  it("can revoke logger authorization", () => {
    simnet.callPublicFn(
      "audit-trail",
      "authorize-logger",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "audit-trail",
      "revoke-logger",
      [Cl.principal(wallet1)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(2), Cl.uint(1), Cl.uint(3000), Cl.stringAscii("Should fail")],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(603));
  });

  it("can toggle audit on and off", () => {
    const disable = simnet.callPublicFn(
      "audit-trail",
      "toggle-audit",
      [Cl.bool(false)],
      deployer
    );
    expect(disable.result).toBeOk(Cl.bool(true));

    const { result } = simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(1), Cl.uint(1), Cl.uint(1000), Cl.stringAscii("Should fail")],
      deployer
    );
    expect(result).toBeErr(Cl.uint(603));
  });

  it("increments entry counter", () => {
    simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(1), Cl.uint(1), Cl.uint(1000), Cl.stringAscii("First entry")],
      deployer
    );
    simnet.callPublicFn(
      "audit-trail",
      "log-action",
      [Cl.uint(2), Cl.uint(2), Cl.uint(2000), Cl.stringAscii("Second entry")],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "audit-trail",
      "get-entry-counter",
      [],
      deployer
    );
    expect(result).toBeUint(2);
  });

  it("returns none for non-existent entry", () => {
    const { result } = simnet.callReadOnlyFn(
      "audit-trail",
      "get-audit-entry",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeNone();
  });
});
