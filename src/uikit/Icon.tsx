import React, { Component } from "react";

export const icons = {
  "add-circle": "../../public/icons/add-circle.svg",
  "arrow-down": "../../public/icons/arrow-down.svg",
  "arrow-right": "../../public/icons/arrow-right.svg",
  "cross-circle": "../../public/icons/cross-circle.svg",
  "cursor-down": "../../public/icons/cursor-down.svg",
  "cursor-left": "../../public/icons/cursor-left.svg",
  "cursor-right": "../../public/icons/cursor-right.svg",
  "earn-stroke": "../../public/icons/earn-stroke.svg",
  "switch-horizontal": "../../public/icons/switch-horizontal.svg",
  "switch-vertical": "../../public/icons/switch-vertical.svg",
  "warning-green": "../../public/icons/warning-green.svg",
  "gas-green": "../../public/icons/gas-green.svg",
  "stroke-favorite": "../../public/icons/stroke-favorite.svg",
  "social-sent": "../../public/icons/social-sent.svg",
  "tick-circle": "../../public/icons/tick-circle.svg",
  "play-player": "../../public/icons/play-player.svg",
  "lost-wifi": "../../public/icons/lost-wifi.svg",
  "nft-in": "../../public/icons/nft-in.svg",
  "nft-out": "../../public/icons/nft-out.svg",
  refresh: "../../public/icons/refresh.svg",
  copy: "../../public/icons/copy.svg",
  add: "../../public/icons/add.svg",
  bell: "../../public/icons/bell.svg",
  book: "../../public/icons/book.svg",
  cross: "../../public/icons/cross.svg",
  crypto: "../../public/icons/crypto.svg",
  del: "../../public/icons/del.svg",
  earn: "../../public/icons/earn.svg",
  technical: "../../public/icons/technical.svg",
  tick: "../../public/icons/tick.svg",
  tourch: "../../public/icons/tourch.svg",
  unstake: "../../public/icons/unstake.svg",
  web: "../../public/icons/web.svg",
  binance: "../../public/icons/binance.svg",
  touchid: "../../public/icons/touchid.svg",
  lock: "../../public/icons/lock.svg",
  card: "../../public/icons/card.svg",
  question: "../../public/icons/question.svg",
  near: "../../public/icons/near.svg",
  download: "../../public/icons/download.svg",
  keys: "../../public/icons/keys.svg",
  back: "../../public/icons/back.svg",
  clock: "../../public/icons/clock.svg",
  score: "../../public/icons/score.svg",
  warning: "../../public/icons/warning.svg",
  edit: "../../public/icons/edit.svg",
  link: "../../public/icons/link.svg",
  social: "../../public/icons/social.svg",
  options: "../../public/icons/options.svg",
  plus: "../../public/icons/plus.svg",
  orderly: "../../public/icons/orderly.svg",
  search: "../../public/icons/search.svg",
  verified: "../../public/icons/verified.svg",
  star: "../../public/icons/star.svg",
  trash: "../../public/icons/trash.svg",
  idea: "../../public/icons/idea.svg",
  gas: "../../public/icons/gas.svg",
  percent: "../../public/icons/percent.svg",
  phone: "../../public/icons/phone.svg",
  faceid: "../../public/icons/faceid.svg",
  key: "../../public/icons/key.svg",
  logout: "../../public/icons/logout.svg",
  support: "../../public/icons/support.svg",
  user: "../../public/icons/user.svg",
  document: "../../public/icons/document.svg",
  settings: "../../public/icons/settings.svg",
  favorite: "../../public/icons/favorite.svg",
  qr: "../../public/icons/qr.svg",
} as const;

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
    if (icons[name] == null) return null;
    return <img {...props} style={style} src={new URL(icons[name], import.meta.url).href} />;
  }
}

export default Icon;
