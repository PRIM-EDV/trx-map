import { SvgAssetPath } from "../../../../assets/assets";

export const ICON_PATHS: {units: SvgAssetPath[], enemies: SvgAssetPath[], objects: SvgAssetPath[], base: SvgAssetPath[], symbols: SvgAssetPath[]} = {
  units: [
    'icons/icon_friend.svg',
    'icons/icon_friend10.svg',
    'icons/icon_friend15.svg',
    'icons/icon_friend20.svg',
    'icons/icon_friend25.svg',
    'icons/icon_friend30.svg',
  ],
  enemies: [
    'icons/icon_foe.svg',
    'icons/icon_foe10.svg',
    'icons/icon_foe15.svg',
    'icons/icon_foe20.svg',
    'icons/icon_foe25.svg',
    'icons/icon_foe30.svg',
  ],
  objects: [
    'icons/icon_object.svg',
  ],
  base: [
    'icons/icon_friend_base.svg',
  ],
  symbols: [
    'symbols/crosshair.svg',
    'symbols/medkit.svg',
    'symbols/tools.svg',
    'symbols/leader.svg'
  ]
};

export const ICON_SIZE = 48; 