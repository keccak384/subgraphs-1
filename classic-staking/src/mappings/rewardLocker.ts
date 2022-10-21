import { log, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { KyberFairLaunch } from '../types/schema'
import { KyberFairLaunch as KyberFairLaunchTemplate } from '../types/templates'
import { KyberFairLaunch as KyberFairLaunchContract } from '../types/templates/KyberFairLaunch/KyberFairLaunch'
import { RewardContractAdded } from '../types/KyberRewardLocker/KyberRewardLocker'
import { ZERO_BI } from './utils'

export function handleRewardContractAdded(event: RewardContractAdded): void {
  let fairLaunch = KyberFairLaunch.load(event.params.rewardContract.toHex())
  if (fairLaunch !== null) {
    return
  }
  KyberFairLaunchTemplate.create(event.params.rewardContract)
  // init reward contract
  fairLaunch = new KyberFairLaunch(event.params.rewardContract.toHex())
  let fairLaunchContract = KyberFairLaunchContract.bind(event.params.rewardContract)
  let poolLength = fairLaunchContract.poolLength()
  let stakeTokens: Bytes[] = []
  if (poolLength.notEqual(ZERO_BI)) {
    for (let i: i32 = 0; i < poolLength.toI32(); i++) {
      stakeTokens.push(fairLaunchContract.getPoolInfo(BigInt.fromI32(i)).value1)
    }
  }
  fairLaunch.stakeTokens = stakeTokens
  fairLaunch.save()
}
