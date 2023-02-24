export interface AnalyticsConfig {
  open?: Record<string, any>;
  close?: Record<string, any>;
  [key: string]: Record<string, any> | undefined;
}

export interface AnalyticsEvents {
  app: {
    open: { from: string };
    close: {};
    connect_wallet: { walletId: string };
    logout: {};
  };

  tip_claim: {
    open: {};
    close: {};
    learn_more: {};
  };

  tip_unstake: {
    open: {};
    close: {};
    app_store: {};
    google_play: {};
  };

  tip_install_app: {
    open: {};
    close: {};
    app_store: {};
    google_play: {};
  };

  tip_buy_nft: {
    open: {};
    close: {};
    buy_nft: {};
  };

  login_screen: {
    open: {};
    close: {};
    open_selector: {};
  };

  first_stake: {
    open: {};
    close: {};
    select_max: {};
    stake: {};
    stake_failed: {};
    stake_success: {};
  };

  dashboard: {
    open: {};
    close: {};
    claim: {};
    claim_failed: {};
    claim_success: {};
    open_trx: {};
    open_edit: {};
  };

  edit: {
    open: {};
    close: {};
    select_max: {};
    switch_to_fiat: {};
    switch_to_near: {};
    switch_to_stake: {};
    switch_to_unstake: {};

    stake: {};
    stake_success: {};
    stake_failed: {};

    unstake: {};
    unstake_success: {};
    unstake_failed: {};
  };
}
