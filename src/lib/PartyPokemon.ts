import type { Characteristic } from "./Characteristic"
import type { PokemonType } from "./PokemonTypes"
import type { Skill } from "./Skill"

export type PartyPokemon = {
    name: string
    type1: PokemonType
    type2: PokemonType | null
    characteristic: Characteristic | null
    skills: [Skill | null, Skill | null, Skill | null, Skill | null],
    s: number
    b: number
    d: number
}