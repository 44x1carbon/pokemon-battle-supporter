<script lang="ts">
  import type { PartyPokemon } from "../lib/PartyPokemon";
  import type { Pokemon } from "../lib/Pokemon";
  import { PokemonData } from "../lib/PokemonData";
  import type { Skill } from "../lib/Skill";
  import { SkillData } from "../lib/SkillData";
  import SelectInput from "./SelectInput.svelte";
  import { InvalidCharacteristic } from "../lib/InvalidCharacteristic";

  export let partyPokemon: PartyPokemon | undefined = undefined;
  let skills: Skill[] = [];
  let isDetailEdit = false;

  function onSelectPokemon(e: CustomEvent<any>) {
    const pokemon = e.detail as Pokemon | null;

    if (pokemon === null) {
      partyPokemon = null;
      return;
    }

    partyPokemon = {
      name: pokemon.name,
      type1: pokemon.type1,
      type2: pokemon.type2 === "" ? undefined : pokemon.type2,
      s: pokemon.s,
      characteristic: undefined,
      skills: [undefined, undefined, undefined, undefined],
    };
  }

  $: {
    if (partyPokemon !== null) {
      const pokemon = PokemonData.find((p) => p.name === partyPokemon.name);
      console.log([
        ...pokemon.tl.split("/").map((seg) => seg.split(",")[0]),
        ...pokemon.tm.split("/"),
        ...pokemon.tt.split("/"),
      ]);
      skills = [
        ...pokemon.tl.split("/").map((seg) => seg.split(",")[0]),
        ...pokemon.tm.split("/"),
        ...pokemon.tt.split("/"),
      ]
        .reduce((p, c) => {
          if (!p.includes(c)) {
            p.push(c);
          }

          return p;
        }, [])
        .map((skillName) => {
          return SkillData.find((skill) => skill.name === skillName);
        })
        .filter((skill) => skill !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  }
</script>

<div class="flex flex-1 flex-wrap">
  <div class="w-48">
    <SelectInput
      value={partyPokemon}
      items={PokemonData}
      let:item={pokemon}
      on:change={onSelectPokemon}
    >
      {pokemon.name}
    </SelectInput>
  </div>

  {#if partyPokemon !== null}
    <div class="flex-1 text-right">
      <button
        on:click={() => (isDetailEdit = !isDetailEdit)}
        class="text-sm p-1 bg-blue-500 text-white rounded-sm ml-auto"
        >詳細入力</button
      >
    </div>
  {/if}

  {#if isDetailEdit}
    <div class="w-full mt-2">
      <div class="flex border p-1">
        <div
          class="w-16 p-1 text-sm p-1 bg-blue-500 text-white mr-2 w-16 text-center rounded-sm align-top inline-block font-bold"
        >
          特性
        </div>
        <select
          bind:value={partyPokemon.characteristic}
          class="w-48 text-gray-600 border"
        >
          <option value={undefined}>特性</option>
          {#each InvalidCharacteristic as ic}
            <option value={ic}>{ic.name}</option>
          {/each}
        </select>
      </div>

      <div class="flex border  p-1">
        <div>
          <div
            class="w-16  p-1 text-sm p-1 bg-blue-500 text-white mr-2 w-16 text-center rounded-sm align-top inline-block font-bold"
          >
            技
          </div>
        </div>
        <div>
          <ul>
            {#each partyPokemon.skills as _skill, i}
              <li class="mb-1 last:mb-0">
                <SelectInput
                  value={partyPokemon.skills[i]}
                  items={skills}
                  let:item={skill}
                  on:change={(e) => (partyPokemon.skills[i] = e.detail)}
                >
                  {skill.name}
                </SelectInput>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <button
      on:click={() => (isDetailEdit = false)}
      class="w-full p-1 bg-yellow-300 text-gray-600 font-bold text-sm mt-2 rounded-sm"
      >閉じる</button
    >
  {/if}
</div>
