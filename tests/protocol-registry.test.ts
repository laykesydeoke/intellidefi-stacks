import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("protocol-registry", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("can whitelist a protocol address", () => {
    const { result } = simnet.callPublicFn(
      "protocol-registry",
      "whitelist-protocol",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects whitelist from non-owner", () => {
    const { result } = simnet.callPublicFn(
      "protocol-registry",
      "whitelist-protocol",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(300));
  });

  it("can register a whitelisted protocol", () => {
    simnet.callPublicFn(
      "protocol-registry",
      "whitelist-protocol",
      [Cl.principal(wallet1)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "protocol-registry",
      "register-protocol",
      [
        Cl.stringAscii("alex-dex"),
        Cl.principal(wallet1),
        Cl.uint(1),
        Cl.uint(30),
        Cl.uint(4),
        Cl.stringAscii("deposit"),
        Cl.stringAscii("withdraw"),
        Cl.stringAscii("get-balance"),
        Cl.stringAscii("claim-rewards")
      ],
      deployer
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("rejects unwhitelisted protocol registration", () => {
    const { result } = simnet.callPublicFn(
      "protocol-registry",
      "register-protocol",
      [
        Cl.stringAscii("unknown-protocol"),
        Cl.principal(wallet2),
        Cl.uint(1),
        Cl.uint(30),
        Cl.uint(4),
        Cl.stringAscii("deposit"),
        Cl.stringAscii("withdraw"),
        Cl.stringAscii("get-balance"),
        Cl.stringAscii("claim-rewards")
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(301));
  });

  it("can update protocol status", () => {
    simnet.callPublicFn(
      "protocol-registry",
      "whitelist-protocol",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "protocol-registry",
      "register-protocol",
      [
        Cl.stringAscii("velar-dex"),
        Cl.principal(wallet1),
        Cl.uint(1),
        Cl.uint(25),
        Cl.uint(3),
        Cl.stringAscii("deposit"),
        Cl.stringAscii("withdraw"),
        Cl.stringAscii("get-balance"),
        Cl.stringAscii("claim-rewards")
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "protocol-registry",
      "update-protocol-status",
      [Cl.uint(1), Cl.bool(false)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("can pause and unpause registry", () => {
    const pause = simnet.callPublicFn(
      "protocol-registry",
      "pause-registry",
      [],
      deployer
    );
    expect(pause.result).toBeOk(Cl.bool(true));

    const unpause = simnet.callPublicFn(
      "protocol-registry",
      "unpause-registry",
      [],
      deployer
    );
    expect(unpause.result).toBeOk(Cl.bool(true));
  });

  it("rejects registration when paused", () => {
    simnet.callPublicFn(
      "protocol-registry",
      "whitelist-protocol",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "protocol-registry",
      "pause-registry",
      [],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "protocol-registry",
      "register-protocol",
      [
        Cl.stringAscii("blocked-protocol"),
        Cl.principal(wallet1),
        Cl.uint(2),
        Cl.uint(20),
        Cl.uint(3),
        Cl.stringAscii("deposit"),
        Cl.stringAscii("withdraw"),
        Cl.stringAscii("get-balance"),
        Cl.stringAscii("claim-rewards")
      ],
      deployer
    );
    expect(result).toBeErr(Cl.uint(302));
  });

  it("can update protocol TVL", () => {
    simnet.callPublicFn(
      "protocol-registry",
      "whitelist-protocol",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "protocol-registry",
      "register-protocol",
      [
        Cl.stringAscii("tvl-test"),
        Cl.principal(wallet1),
        Cl.uint(3),
        Cl.uint(15),
        Cl.uint(2),
        Cl.stringAscii("deposit"),
        Cl.stringAscii("withdraw"),
        Cl.stringAscii("get-balance"),
        Cl.stringAscii("claim-rewards")
      ],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "protocol-registry",
      "update-protocol-tvl",
      [Cl.uint(1), Cl.uint(5000000)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("returns none for non-existent protocol", () => {
    const { result } = simnet.callReadOnlyFn(
      "protocol-registry",
      "get-protocol",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeNone();
  });
});
