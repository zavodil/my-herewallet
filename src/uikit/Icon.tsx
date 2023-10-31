import React, { Component } from "react";

import add_circle from "../icons/add-circle.svg?url";
import arrow_down from "../icons/arrow-down.svg?url";
import arrow_right from "../icons/arrow-right.svg?url";
import cross_circle from "../icons/cross-circle.svg?url";
import cursor_down from "../icons/cursor-down.svg?url";
import cursor_left from "../icons/cursor-left.svg?url";
import cursor_right from "../icons/cursor-right.svg?url";
import earn_stroke from "../icons/earn-stroke.svg?url";
import switch_horizontal from "../icons/switch-horizontal.svg?url";
import switch_vertical from "../icons/switch-vertical.svg?url";
import warning_green from "../icons/warning-green.svg?url";
import gas_green from "../icons/gas-green.svg?url";
import stroke_favorite from "../icons/stroke-favorite.svg?url";
import social_sent from "../icons/social-sent.svg?url";
import tick_circle from "../icons/tick-circle.svg?url";
import play_player from "../icons/play-player.svg?url";
import lost_wifi from "../icons/lost-wifi.svg?url";
import nft_in from "../icons/nft-in.svg?url";
import nft_out from "../icons/nft-out.svg?url";
import refresh from "../icons/refresh.svg?url";
import copy from "../icons/copy.svg?url";
import add from "../icons/add.svg?url";
import bell from "../icons/bell.svg?url";
import book from "../icons/book.svg?url";
import cross from "../icons/cross.svg?url";
import crypto from "../icons/crypto.svg?url";
import del from "../icons/del.svg?url";
import earn from "../icons/earn.svg?url";
import technical from "../icons/technical.svg?url";
import tick from "../icons/tick.svg?url";
import tourch from "../icons/tourch.svg?url";
import unstake from "../icons/unstake.svg?url";
import web from "../icons/web.svg?url";
import binance from "../icons/binance.svg?url";
import touchid from "../icons/touchid.svg?url";
import lock from "../icons/lock.svg?url";
import card from "../icons/card.svg?url";
import question from "../icons/question.svg?url";
import near from "../icons/near.svg?url";
import download from "../icons/download.svg?url";
import keys from "../icons/keys.svg?url";
import clock from "../icons/clock.svg?url";
import score from "../icons/score.svg?url";
import warning from "../icons/warning.svg?url";
import edit from "../icons/edit.svg?url";
import link from "../icons/link.svg?url";
import social from "../icons/social.svg?url";
import options from "../icons/options.svg?url";
import plus from "../icons/plus.svg?url";
import orderly from "../icons/orderly.svg?url";
import search from "../icons/search.svg?url";
import verified from "../icons/verified.svg?url";
import star from "../icons/star.svg?url";
import trash from "../icons/trash.svg?url";
import idea from "../icons/idea.svg?url";
import gas from "../icons/gas.svg?url";
import percent from "../icons/percent.svg?url";
import phone from "../icons/phone.svg?url";
import faceid from "../icons/faceid.svg?url";
import key from "../icons/key.svg?url";
import logout from "../icons/logout.svg?url";
import support from "../icons/support.svg?url";
import user from "../icons/user.svg?url";
import document from "../icons/document.svg?url";
import settings from "../icons/settings.svg?url";
import favorite from "../icons/favorite.svg?url";
import qr from "../icons/qr.svg?url";

export const icons = {
  add_circle,
  arrow_down,
  arrow_right,
  cross_circle,
  cursor_down,
  cursor_left,
  cursor_right,
  earn_stroke,
  switch_horizontal,
  switch_vertical,
  warning_green,
  gas_green,
  stroke_favorite,
  social_sent,
  tick_circle,
  play_player,
  lost_wifi,
  nft_in,
  nft_out,
  refresh,
  copy,
  add,
  bell,
  book,
  cross,
  crypto,
  del,
  earn,
  technical,
  tick,
  tourch,
  unstake,
  web,
  binance,
  touchid,
  lock,
  card,
  question,
  near,
  download,
  keys,
  clock,
  score,
  warning,
  edit,
  link,
  social,
  options,
  plus,
  orderly,
  search,
  verified,
  star,
  trash,
  idea,
  gas,
  percent,
  phone,
  faceid,
  key,
  logout,
  support,
  user,
  document,
  settings,
  favorite,
  qr,
} as Record<string, string>;

interface Props {
  name: keyof typeof icons;
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  rotate?: boolean;
  color?: string;
  style?: any;
}

class Icon extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { name, style, ...props } = this.props;
    const icon = icons[name.replaceAll("-", "_")];
    if (icon == null) return null;
    return <img {...props} style={style} src={icon} />;
  }
}

export default Icon;
