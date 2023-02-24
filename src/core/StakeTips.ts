import { action, computed, makeObservable, observable, observe } from "mobx";
import UserAccount from "./UserAccount";

class StakeTips {
  public statistics = {
    stakeCount: +(this.user.storage.get("stake_count") ?? 0),
    unstakeCount: +(this.user.storage.get("unstake_count") ?? 0),
    launchCount: +(this.user.storage.get("launch_count") ?? 0),
    closedInstallDate: +(this.user.storage.get("closed_install_tip_date") ?? 0),
    closedInstallTip: false,
    closedClaimTip: false,
    closedUnstakeTip: false,
    closedNFTTip: false,
  };

  constructor(readonly user: UserAccount) {
    makeObservable(this, {
      hideTipClaim: action,
      hideTipUnstake: action,
      hideTipInstallApp: action,
      hideTipNFT: action,
      unstake: action,
      stake: action,

      tipNFT: computed,
      tipClaim: computed,
      tipUnstake: computed,
      tipInstallApp: computed,
      statistics: observable,
    });

    observe(this.statistics, () => {
      this.user.storage.set("launch_count", this.statistics.launchCount);
      this.user.storage.set("stake_count", this.statistics.stakeCount);
      this.user.storage.set("unstake_count", this.statistics.unstakeCount);
      this.user.storage.set("closed_install_tip_date", this.statistics.closedInstallDate);
    });

    this.statistics.launchCount += 1;
  }

  // After message on the left
  // If user entered the webapp more than twice and haven’t claimed. Show no more than 3 times at all
  get tipClaim() {
    if (this.statistics.closedClaimTip) return false;
    if (this.statistics.closedInstallTip) return true;
    return this.statistics.launchCount > 2 && this.user.state.totalIncome === 0;
  }

  // We show this message if user haven’t downloaded the app in this cases:
  // After first unstake
  // Every 3 unstakes
  get tipUnstake() {
    if (this.statistics.closedUnstakeTip) return false;
    return this.statistics.unstakeCount % 3 === 0;
  }

  // We show this message if user haven’t downloaded the app in this cases:
  // After first stake
  // Once a week
  get tipInstallApp() {
    if (this.statistics.closedInstallTip) return false;
    const diff = Date.now() - this.statistics.closedInstallDate;
    if (diff > 1000 * 3600 * 24 * 7) return true;
    return this.statistics.stakeCount === 1;
  }

  get tipNFT() {
    if (this.statistics.closedNFTTip) return false;
    if (this.statistics.closedClaimTip) return true;
    return false;
  }

  hideTipNFT() {
    this.statistics.closedNFTTip = true;
  }

  hideTipClaim() {
    this.statistics.closedClaimTip = true;
  }

  hideTipUnstake() {
    this.statistics.closedUnstakeTip = true;
  }

  hideTipInstallApp() {
    this.statistics.stakeCount = 2;
    this.statistics.closedInstallTip = true;
    this.statistics.closedInstallDate = Date.now();
  }

  unstake() {
    this.statistics.unstakeCount += 1;
  }

  stake() {
    this.statistics.stakeCount += 1;
  }
}

export default StakeTips;
