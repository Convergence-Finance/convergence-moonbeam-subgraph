# Convergence Moonbeam Subgraph

This Subgraph sources events from contracts of ConvX of Convergence Finance on Moonbeam chain.

# Example Query

Here we have an example query for getting contract address of pairs, their respective contract addresses of tokens and symbols, reserves, price in USD.

```
pairs (orderBy: timestamp, orderDirection: desc) {
  id
  token0 {
    id
    symbol
  }
  token1 {
    id
    symbol
  }
  reserve0
  reserve1
  token0Price
  token1Price
}
```
