import type { Rarity } from "@/types";

export interface Skin {
  id: string;
  weapon: string;
  name: string;
  price: string;
  priceNum: number;
  rarity: Rarity;
  float: number;
  stattrak?: boolean;
  imageUrl: string;
  featured?: boolean;
}

const STEAM_CDN = "https://community.steamstatic.com/economy/image";

export const SKINS: Skin[] = [
  {
    id: "awp-dragon-lore",
    weapon: "AWP",
    name: "Dragon Lore",
    price: "12.400,00",
    priceNum: 12400,
    rarity: "covert",
    float: 0.038,
    featured: true,
    imageUrl: `${STEAM_CDN}/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV/360fx360f`,
  },
  {
    id: "karambit-doppler",
    weapon: "★ Karambit",
    name: "Doppler",
    price: "4.890,00",
    priceNum: 4890,
    rarity: "knife",
    float: 0.011,
    stattrak: true,
    featured: true,
    imageUrl: `${STEAM_CDN}/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i4gKJk4jxNWXFb1cpDJR2FOFbsBTql9bjYbzq7gPZiN1MxH7_2ytNuCdpte1UB_Ui5OSJ2GbkVqni/360fx360f`,
  },
  {
    id: "m4a4-howl",
    weapon: "M4A4",
    name: "Howl",
    price: "8.750,00",
    priceNum: 8750,
    rarity: "covert",
    float: 0.195,
    featured: true,
    imageUrl: `${STEAM_CDN}/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afVSKP-EAm6extF6ueZhW2exwkl2tmTXwt39eCiUPQR2DMN4TOVetUK8xoLgM-K341eM2otDnC6okGoXufBz_TAB/360fx360f`,
  },
  {
    id: "ak47-redline",
    weapon: "AK-47",
    name: "Redline",
    price: "189,90",
    priceNum: 190,
    rarity: "classified",
    float: 0.142,
    stattrak: true,
    imageUrl: `${STEAM_CDN}/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA/360fx360f`,
  },
  {
    id: "glock-fade",
    weapon: "Glock-18",
    name: "Fade",
    price: "1.290,00",
    priceNum: 1290,
    rarity: "restricted",
    float: 0.022,
    imageUrl: `${STEAM_CDN}/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1a7s2oaaBoH_yaCW-Ej-8u5bZvHnq1w0Vz62TUzNj4eCiVblMmXMAkROJeskLpkdXjMrzksVTAy9US8PY25So/360fx360f`,
  },
  {
    id: "deagle-blaze",
    weapon: "Desert Eagle",
    name: "Blaze",
    price: "2.340,00",
    priceNum: 2340,
    rarity: "classified",
    float: 0.066,
    imageUrl: `${STEAM_CDN}/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7vORbqhsLfWAMWuZxuZi_uI_TX6wxxkjsGXXnImsJ37COlUoWcByEOMOtxa5kdXmNu3htVPZjN1bjXKpkHLRfQU/360fx360f`,
  },
];

export const FEATURED_SKINS = SKINS.filter((s) => s.featured);
