import React, { Component } from "react";

import add_circle from "jsx:../icons/add-circle.svg";
import arrow_left from "jsx:../icons/arrow-left.svg";
import arrow_down from "jsx:../icons/arrow-down.svg";
import arrow_right from "jsx:../icons/arrow-right.svg";
import cross_circle from "jsx:../icons/cross-circle.svg";
import cursor_down from "jsx:../icons/cursor-down.svg";
import cursor_left from "jsx:../icons/cursor-left.svg";
import cursor_right from "jsx:../icons/cursor-right.svg";
import earn_stroke from "jsx:../icons/earn-stroke.svg";
import switch_horizontal from "jsx:../icons/switch-horizontal.svg";
import switch_vertical from "jsx:../icons/switch-vertical.svg";
import warning_green from "jsx:../icons/warning-green.svg";
import gas_green from "jsx:../icons/gas-green.svg";
import stroke_favorite from "jsx:../icons/stroke-favorite.svg";
import social_sent from "jsx:../icons/social-sent.svg";
import tick_circle from "jsx:../icons/tick-circle.svg";
import play_player from "jsx:../icons/play-player.svg";
import lost_wifi from "jsx:../icons/lost-wifi.svg";
import nft_in from "jsx:../icons/nft-in.svg";
import nft_out from "jsx:../icons/nft-out.svg";
import refresh from "jsx:../icons/refresh.svg";
import copy from "jsx:../icons/copy.svg";
import add from "jsx:../icons/add.svg";
import bell from "jsx:../icons/bell.svg";
import book from "jsx:../icons/book.svg";
import cross from "jsx:../icons/cross.svg";
import crypto from "jsx:../icons/crypto.svg";
import del from "jsx:../icons/del.svg";
import earn from "jsx:../icons/earn.svg";
import technical from "jsx:../icons/technical.svg";
import tick from "jsx:../icons/tick.svg";
import tourch from "jsx:../icons/tourch.svg";
import unstake from "jsx:../icons/unstake.svg";
import web from "jsx:../icons/web.svg";
import binance from "jsx:../icons/binance.svg";
import touchid from "jsx:../icons/touchid.svg";
import lock from "jsx:../icons/lock.svg";
import card from "jsx:../icons/card.svg";
import question from "jsx:../icons/question.svg";
import near from "jsx:../icons/near.svg";
import download from "jsx:../icons/download.svg";
import keys from "jsx:../icons/keys.svg";
import clock from "jsx:../icons/clock.svg";
import score from "jsx:../icons/score.svg";
import warning from "jsx:../icons/warning.svg";
import edit from "jsx:../icons/edit.svg";
import link from "jsx:../icons/link.svg";
import social from "jsx:../icons/social.svg";
import options from "jsx:../icons/options.svg";
import plus from "jsx:../icons/plus.svg";
import orderly from "jsx:../icons/orderly.svg";
import search from "jsx:../icons/search.svg";
import verified from "jsx:../icons/verified.svg";
import star from "jsx:../icons/star.svg";
import trash from "jsx:../icons/trash.svg";
import idea from "jsx:../icons/idea.svg";
import gas from "jsx:../icons/gas.svg";
import percent from "jsx:../icons/percent.svg";
import phone from "jsx:../icons/phone.svg";
import faceid from "jsx:../icons/faceid.svg";
import key from "jsx:../icons/key.svg";
import logout from "jsx:../icons/logout.svg";
import support from "jsx:../icons/support.svg";
import user from "jsx:../icons/user.svg";
import document from "jsx:../icons/document.svg";
import settings from "jsx:../icons/settings.svg";
import favorite from "jsx:../icons/favorite.svg";
import qr from "jsx:../icons/qr.svg";
import mission from "jsx:../icons/mission.svg";

export const icons = {
  mission,
  "arrow-left": arrow_left,
  "add-circle": add_circle,
  "arrow-down": arrow_down,
  "arrow-right": arrow_right,
  "cross-circle": cross_circle,
  "cursor-down": cursor_down,
  "cursor-left": cursor_left,
  "cursor-right": cursor_right,
  "earn-stroke": earn_stroke,
  "switch-horizontal": switch_horizontal,
  "switch-vertical": switch_vertical,
  "warning-green": warning_green,
  "gas-green": gas_green,
  "stroke-favorite": stroke_favorite,
  "social-sent": social_sent,
  "tick-circle": tick_circle,
  "play-player": play_player,
  "lost-wifi": lost_wifi,
  "nft-in": nft_in,
  "nft-out": nft_out,
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
};

interface Props extends React.SVGAttributes<SVGElement> {
  name: keyof typeof icons;
}

class Icon extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { name, style, ...props } = this.props;
    const Icon = icons[name];
    if (Icon == null) return null;
    return <Icon {...props} style={style} />;
  }
}

export default Icon;
