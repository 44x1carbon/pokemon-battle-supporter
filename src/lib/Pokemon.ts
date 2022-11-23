import type { PokemonType } from "./PokemonTypes";

export type Pokemon = {
    id: number,
    name: string,
    imageId: string,
    type1: PokemonType,
    type2: PokemonType | "",
    h: number,
    a: number,
    b: number,
    c: number,
    d: number,
    s: number,
    t: number,
    sc1: string,
    sc2: string,
    sc3: string,
    tl: string,
    tm: string,
    tt: string
}