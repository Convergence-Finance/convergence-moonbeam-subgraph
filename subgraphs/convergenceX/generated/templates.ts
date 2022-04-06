// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  Address,
  DataSourceTemplate,
  DataSourceContext
} from "@graphprotocol/graph-ts";

export class ERC20 extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("ERC20", [address.toHex()]);
  }

  static createWithContext(address: Address, context: DataSourceContext): void {
    DataSourceTemplate.createWithContext("ERC20", [address.toHex()], context);
  }
}

export class SwapPair extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("SwapPair", [address.toHex()]);
  }

  static createWithContext(address: Address, context: DataSourceContext): void {
    DataSourceTemplate.createWithContext(
      "SwapPair",
      [address.toHex()],
      context
    );
  }
}