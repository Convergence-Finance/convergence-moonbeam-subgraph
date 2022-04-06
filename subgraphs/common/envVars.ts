import { Address } from "@graphprotocol/graph-ts";

let ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export enum SUBGRAPH_MODE {
  GET_TOKEN_DETAIL_FROM_PROD = 0,
  GET_TOKEN_DETAIL_FROM_DEV = 1,
}

let var_subgraph_mode: string = "${VARS_SUBGRAPH_MODE}";
export let subgraphMode: SUBGRAPH_MODE =
  var_subgraph_mode == "0"
    ? SUBGRAPH_MODE.GET_TOKEN_DETAIL_FROM_PROD
    : SUBGRAPH_MODE.GET_TOKEN_DETAIL_FROM_DEV;

//conv-x 部分
export const swapfactory_address_str: string = "${VARS_SWAPFACTORY_ADDRESS}";
export const swaprouter_address_str: string = "${VARS_SWAPROUTER_ADDRESS}";
export const wglmr_address_str: string = "${VARS_WGLMR_ADDRESS}";
export const receive_fee_address_str: string = "${VARS_RECEIVE_FEE_ADDRESS}";
export const usdt_address_str: string = "${VARS_USDT_ADDRESS}";
export const usdc_address_str: string = "${VARS_USDC_ADDRESS}";
export const conv_address_str: string = "${VARS_CONV_ADDRESS}";
export const busd_address_str: string = "${VARS_BUSD_ADDRESS}";
export const weth_address_str: string = "${VARS_WETH_ADDRESS}";
export const wbtc_address_str: string = "${VARS_WBTC_ADDRESS}";

export let swapfactory_address =
  swapfactory_address_str != ""
    ? Address.fromString(swapfactory_address_str)
    : ADDRESS_ZERO;
export let swaprouter_address =
  swaprouter_address_str != ""
    ? Address.fromString(swaprouter_address_str)
    : ADDRESS_ZERO;
export let wglmr_address =
  wglmr_address_str != ""
    ? Address.fromString(wglmr_address_str)
    : ADDRESS_ZERO;
export let receive_fee_address =
  receive_fee_address_str != ""
    ? Address.fromString(receive_fee_address_str)
    : ADDRESS_ZERO;
export let usdt_address =
  usdt_address_str != "" ? Address.fromString(usdt_address_str) : ADDRESS_ZERO;
export let usdc_address =
  usdc_address_str != "" ? Address.fromString(usdc_address_str) : ADDRESS_ZERO;
export let conv_address =
  conv_address_str != "" ? Address.fromString(conv_address_str) : ADDRESS_ZERO;
export let busd_address =
  busd_address_str != "" ? Address.fromString(busd_address_str) : ADDRESS_ZERO;
export let weth_address =
  weth_address_str != "" ? Address.fromString(weth_address_str) : ADDRESS_ZERO;
export let wbtc_address =
  wbtc_address_str != "" ? Address.fromString(wbtc_address_str) : ADDRESS_ZERO;

//conv-o 部分
export const fmatic_token_address_str: string = "${VARS_FMATIC_TOKEN_ADDRESS}";
export const fmatic_prenium_address_str: string =
  "${VARS_FMATIC_PRENIUM_ADDRESS}";
export const fmatic_normal_address_str: string =
  "${VARS_FMATIC_NORMAL_ADDRESS}";

export let fmatic_token_address =
  fmatic_token_address_str != ""
    ? Address.fromString(fmatic_token_address_str)
    : ADDRESS_ZERO;
export let fmatic_prenium_address =
  fmatic_prenium_address_str != ""
    ? Address.fromString(fmatic_prenium_address_str)
    : ADDRESS_ZERO;
export let fmatic_normal_address =
  fmatic_normal_address_str != ""
    ? Address.fromString(fmatic_normal_address_str)
    : ADDRESS_ZERO;
