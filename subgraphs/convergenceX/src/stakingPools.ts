import {
  Staked as StakedEvent,
  Unstaked as UnstakedEvent,
  RewardRedeemed as RewardRedeemedEvent,
  PoolCreated as PoolCreatedEvent,
  RewardInfoChanged as RewardInfoChangedEvent,
  PoolEndBlockExtended as PoolEndBlockExtendedEvent,
  PoolMigrated as PoolMigratedEvent,
  RewardInfoAdded as RewardInfoAddedEvent,
} from "../generated/StakingPools/StakingPools";

import { StakingPoolRewarder as StakingPoolRewarderContract } from "../generated/StakingPools/StakingPoolRewarder";

import {
  StakingPair,
  Pool,
  Stake,
  UnStaked,
  RewardRedeemed,
  UserReward,
  UserPoolData,
  UserPoolDataSnapshot,
  PoolInfoAndDataSnapshot,
  Pair,
  RewardInfo,
} from "../generated/schema";

import { BigInt, Address, BigDecimal, ethereum } from "@graphprotocol/graph-ts";

import {
  BI_18,
  convertTokenToDecimal,
  ZERO_BD,
  ADDRESS_ZERO,
  ZERO,
} from "../../common";
import {
  fetchTokenAddressesFromPair,
  fetchTokenDecimals,
  fetchTokenSymbol,
} from "./swapFactory";

import { conv_address } from "../../common/envVars";

let ACCU_REWARD_MULTIPLIER = BigInt.fromI32(1000000000)
  .times(BigInt.fromI32(1000000000))
  .times(BigInt.fromI32(100));

export function handleStaked(event: StakedEvent): void {
  let stake = new Stake(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  let pool = Pool.load(event.params.poolId.toString());

  stake.stakingPair = pool.stakingPair;
  stake.transactionHash = event.transaction.hash;
  stake.token = event.params.token;
  stake.staker = event.params.staker;
  stake.amount = convertTokenToDecimal(event.params.amount, pool.decimals);
  stake.timestamp = event.block.timestamp;
  stake.block = event.block.number;
  stake.save();

  pool.totalStakeAmount = pool.totalStakeAmount.plus(event.params.amount);
  pool.totalStakeAmount_BD = convertTokenToDecimal(
    pool.totalStakeAmount,
    pool.decimals
  );
  pool.save();

  let userPoolData = UserPoolData.load(
    event.params.poolId.toString() + "-" + event.params.staker.toHexString()
  );

  if (userPoolData == null) {
    // Create new record when user stake to the pool for the first time
    userPoolData = new UserPoolData(
      event.params.poolId.toString() + "-" + event.params.staker.toHexString()
    );
    userPoolData.user = event.params.staker;
    userPoolData.poolId = event.params.poolId;
    userPoolData.stakeToken = pool.token;
    userPoolData.stakeAmount = ZERO;
    userPoolData.stakeAmount_BD = ZERO_BD;
    userPoolData.pendingReward = ZERO;
    userPoolData.entryAccuRewardPerShare = ZERO;
  }

  userPoolData.stakeAmount = userPoolData.stakeAmount.plus(event.params.amount);
  userPoolData.stakeAmount_BD = convertTokenToDecimal(
    userPoolData.stakeAmount,
    pool.decimals
  );
  userPoolData.save();
}

export function handleUnstaked(event: UnstakedEvent): void {
  let unStaked = new UnStaked(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  let pool = Pool.load(event.params.poolId.toString());

  unStaked.stakingPair = pool.stakingPair;
  unStaked.transactionHash = event.transaction.hash;
  unStaked.token = event.params.token;
  unStaked.staker = event.params.staker;
  unStaked.amount = convertTokenToDecimal(event.params.amount, pool.decimals);
  unStaked.timestamp = event.block.timestamp;
  unStaked.block = event.block.number;
  unStaked.save();

  pool.totalStakeAmount = pool.totalStakeAmount.minus(event.params.amount);
  pool.totalStakeAmount_BD = convertTokenToDecimal(
    pool.totalStakeAmount,
    pool.decimals
  );
  pool.save();

  let userPoolData = UserPoolData.load(
    event.params.poolId.toString() + "-" + event.params.staker.toHexString()
  );
  userPoolData.stakeAmount = userPoolData.stakeAmount.minus(
    event.params.amount
  );
  userPoolData.stakeAmount_BD = convertTokenToDecimal(
    userPoolData.stakeAmount,
    pool.decimals
  );
  userPoolData.save();
}

export function handleRewardInfoAdded(event: RewardInfoAddedEvent): void {
  let stakingPoolRewarderContract = StakingPoolRewarderContract.bind(
    event.params.rewarder
  );
  let rewardToken = stakingPoolRewarderContract.rewardToken();
  let id =
    event.params.poolId.toString() + "-" + event.params.rewarder.toHexString();
  // Make sure conv comes first
  if (rewardToken == conv_address) {
    id = "0-" + id;
  }

  let pool = Pool.load(event.params.poolId.toString());
  let rewardInfo = RewardInfo.load(id);
  if (rewardInfo == null) {
    rewardInfo = new RewardInfo(id);
    rewardInfo.rewarder = event.params.rewarder;
    rewardInfo.rewardRate = event.params.rewardRate;
    rewardInfo.rewarderIdx = BigInt.fromI32(event.params.rewarderIdx);
    rewardInfo.rewardToken = rewardToken;
    rewardInfo.rewardSymbol = fetchTokenSymbol(rewardToken);
  }

  let rewardInfos = pool.rewardInfos;
  rewardInfos.push(rewardInfo.id);
  pool.rewardInfos = rewardInfos;
  rewardInfo.save();
  pool.save();
}

export function handleRewardRedeemed(event: RewardRedeemedEvent): void {
  let rewardRedeemed = new RewardRedeemed(event.transaction.hash.toHex());
  let pool = Pool.load(event.params.poolId.toString());

  rewardRedeemed.stakingPair = pool.stakingPair;
  rewardRedeemed.transactionHash = event.transaction.hash;
  rewardRedeemed.token = pool.token;
  rewardRedeemed.staker = event.params.staker;
  rewardRedeemed.rewarder = event.params.rewarder;
  rewardRedeemed.amount = convertTokenToDecimal(event.params.amount, BI_18);
  rewardRedeemed.timestamp = event.block.timestamp;
  rewardRedeemed.block = event.block.number;
  rewardRedeemed.save();

  let userReward = UserReward.load(
    event.params.poolId.toString() +
      "-" +
      event.params.rewarder.toHexString() +
      "-" +
      event.params.staker.toHexString()
  );
  if (userReward == null) {
    userReward = new UserReward(
      event.params.poolId.toString() +
        "-" +
        event.params.rewarder.toHexString() +
        "-" +
        event.params.staker.toHexString()
    );
    userReward.token = pool.token;
    userReward.poolId = event.params.poolId;
    userReward.user = event.params.staker;
    userReward.redeemableRewards = ZERO_BD;
    userReward.rewarder = event.params.rewarder;
  }

  userReward.redeemableRewards = userReward.redeemableRewards.plus(
    rewardRedeemed.amount
  );
  userReward.lastClaimedTimestamp = event.block.timestamp;
  userReward.save();

  let userPoolData = UserPoolData.load(
    event.params.poolId.toString() + "-" + event.params.staker.toHexString()
  );
  userPoolData.pendingReward = BigInt.fromI32(0);
  userPoolData.save();
}

export function handlePoolCreated(event: PoolCreatedEvent): void {
  let pool = Pool.load(event.params.poolId.toString());
  if (pool == null) {
    pool = new Pool(event.params.poolId.toString());

    let symbol = fetchTokenSymbol(event.params.token);
    if (symbol == "CLP") {
      let token0 = ADDRESS_ZERO;
      let token1 = ADDRESS_ZERO;
      let pair = Pair.load(event.params.token.toString());
      if (pair == null) {
        let tokenAddrs = fetchTokenAddressesFromPair(event.params.token);
        token0 = tokenAddrs[0];
        token1 = tokenAddrs[1];
      } else {
        token0 = Address.fromString(pair.token0);
        token1 = Address.fromString(pair.token1);
      }

      let stakingPair = StakingPair.load(event.params.token.toHexString());
      if (stakingPair == null) {
        stakingPair = new StakingPair(event.params.token.toHexString());
        stakingPair.token0Address = token0;
        stakingPair.token1Address = token1;
        stakingPair.token0Symbol = fetchTokenSymbol(token0);
        stakingPair.token1Symbol = fetchTokenSymbol(token1);
        stakingPair.save();
      }
      pool.stakingPair = stakingPair.id;
      pool.token0 = token0;
      pool.token1 = token1;
    }

    pool.decimals = fetchTokenDecimals(event.params.token);
    pool.token = event.params.token;
    pool.startBlock = event.params.startBlock;
    pool.endBlock = event.params.endBlock;
    pool.migrationBlock = event.params.migrationBlock;
    pool.totalStakeAmount = BigInt.fromI32(0);
    pool.totalStakeAmount_BD = ZERO_BD;
    pool.accuRewardPerShare = BigInt.fromI32(0);
    pool.accuRewardLastUpdateBlock = event.params.startBlock;
    pool.rewardInfos = [];
    pool.timestamp = event.block.timestamp;
    pool.block = event.block.number;
    pool.save();
  }
}

export function handleRewardInfoChanged(event: RewardInfoChangedEvent): void {
  let stakingPoolRewarderContract = StakingPoolRewarderContract.bind(
    event.params.rewarder
  );
  let rewardToken = stakingPoolRewarderContract.rewardToken();
  let id =
    event.params.poolId.toString() + "-" + event.params.rewarder.toHexString();
  // Make sure conv comes first
  if (rewardToken == conv_address) {
    id = "0-" + id;
  }
  let rewardInfo = RewardInfo.load(id);
  rewardInfo.rewardRate = event.params.newRewardRate;
  rewardInfo.save();
}

export function handlePoolEndBlockExtended(
  event: PoolEndBlockExtendedEvent
): void {
  let pool = Pool.load(event.params.poolId.toString());
  pool.endBlock = event.params.newEndBlock;
  pool.save();
}

export function handlePoolMigrated(event: PoolMigratedEvent): void {
  let pool = Pool.load(event.params.poolId.toString());
  pool.token = event.params.newToken;

  let symbol = fetchTokenSymbol(event.params.newToken);
  if (symbol == "CLP") {
    let token0 = ADDRESS_ZERO;
    let token1 = ADDRESS_ZERO;
    let pair = Pair.load(event.params.newToken.toString());
    if (pair == null) {
      let tokenAddrs = fetchTokenAddressesFromPair(event.params.newToken);
      token0 = tokenAddrs[0];
      token1 = tokenAddrs[1];
    } else {
      token0 = Address.fromString(pair.token0);
      token1 = Address.fromString(pair.token1);
    }

    let stakingPair = StakingPair.load(event.params.newToken.toHexString());
    if (stakingPair == null) {
      stakingPair = new StakingPair(event.params.newToken.toHexString());
      stakingPair.token0Address = token0;
      stakingPair.token1Address = token1;
      stakingPair.token0Symbol = fetchTokenSymbol(token0);
      stakingPair.token1Symbol = fetchTokenSymbol(token1);
      stakingPair.save();
    }
    pool.stakingPair = stakingPair.id;
  }

  pool.save();
}
