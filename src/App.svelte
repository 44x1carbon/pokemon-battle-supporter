<script lang="ts">
  import { onMount } from "svelte";
  import PartyPokemonInput from "./components/PartyPokemonInput.svelte";
  import SelectInput from "./components/SelectInput.svelte";
  import { InvalidCharacteristic } from "./lib/InvalidCharacteristic";
  import type { Party } from "./lib/Party";
  import type { Pokemon } from "./lib/Pokemon";
  import { PokemonData } from "./lib/PokemonData";
  import {
    calcAttackLeverage,
    calcDefenceLeverage,
    TypeCompatibilityList,
    type PokemonType,
  } from "./lib/PokemonTypes";
  import type { Skill } from "./lib/Skill";
  import { SkillData } from "./lib/SkillData";

  const SAVE_KEY = "POKEMON-BATTLE-SUPPORTER";

  let party: Party = [null, null, null, null, null, null];

  onMount(() => {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (data !== null) {
      party = data;
    }
  });

  $: {
    if (party.filter((p) => p !== null).length) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(party));
    }
  }

  let targetPokemon: Pokemon | null = null;

  $: _party =
    targetPokemon === null
      ? []
      : party
          .filter((p) => p !== null)
          .map((p) => {
            const targetSkills = [
              ...targetPokemon.tl.split("/").map((seg) => seg.split(",")[0]),
              ...targetPokemon.tm.split("/"),
              ...targetPokemon.tt.split("/"),
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
              .filter((skill) => skill !== undefined);

            const defenceLeverage = targetSkills.map((s) => {
              return {
                ...s,
                isCharacteristic:
                  p.characteristic && p.characteristic.type === s.type,
                leverage: calcAttackLeverage(
                  p.type1,
                  p.type2,
                  s.type,
                  targetPokemon.type1,
                  targetPokemon.type2 === "" ? undefined : targetPokemon.type2,
                  p.characteristic
                ),
              };
            });

            return {
              ...p,
              defenceLeverage: defenceLeverage,
              skills: [
                ...p.skills,
                ...(p.skills.filter((s) => s).length !== 0
                  ? []
                  : [
                      { id: "", name: "", type: p.type1 },
                      ...(p.type2 ? [{ id: "", name: "", type: p.type2 }] : []),
                    ]),
              ]
                .filter((s) => s)
                .map((s) => {
                  if (s === null) {
                    return null;
                  }

                  const characteristicList = [
                    targetPokemon.sc1,
                    targetPokemon.sc2,
                  ]
                    .map((sc) =>
                      InvalidCharacteristic.find((c) => c.name === sc)
                    )
                    .filter((c) => c)
                    .filter((c) => c.type === s.type);
                  return {
                    ...s,
                    isCharacteristic: characteristicList.length !== 0,
                    leverage: calcAttackLeverage(
                      targetPokemon.type1,
                      targetPokemon.type2 === ""
                        ? undefined
                        : targetPokemon.type2,
                      s.type,
                      p.type1,
                      p.type2,
                      characteristicList[0]
                    ),
                  };
                }),
            };
          })
          .sort((a, b) => {
            return (
              Math.max(
                ...b.skills.filter((s) => s !== null).map((s) => s.leverage)
              ) -
              Math.max(
                ...b.defenceLeverage
                  .filter((s) => s !== null)
                  .map((s) => s.leverage)
              ) -
              (Math.max(
                ...a.skills.filter((s) => s !== null).map((s) => s.leverage)
              ) -
                Math.max(
                  ...a.defenceLeverage
                    .filter((s) => s !== null)
                    .map((s) => s.leverage)
                ))
            );
          });

  function summarizeSkills(
    skills: (Skill & { leverage: number; isCharacteristic: boolean })[],
    isExcludeX1: boolean = false,
    isDASC: boolean = false
  ): (Skill & { leverage: number; isCharacteristic: boolean })[] {
    return Object.values(
      skills
        .filter((s) => s !== null)
        .reduce((p, c) => {
          if (p[c.type] === undefined) {
            p[c.type] = c;
          }
          return p;
        }, {} as { [type in PokemonType]: Skill & { leverage: number; isCharacteristic: boolean } })
    )
      .filter((s) => {
        if (isExcludeX1) {
          return s.leverage !== 1;
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        if (isDASC) {
          return b.leverage - a.leverage;
        } else {
          return a.leverage - b.leverage;
        }
      });
  }
</script>

<div class="p-2">
  <div class="bg-blue-50">
    {#each party as partyPokemon, i}
      <div class="flex items-start border p-1 ">
        <div>
          <div
            class="text-sm p-1 bg-blue-500 text-white mr-2 w-16 text-center rounded-sm align-top inline-block font-bold"
          >
            手持ち{i + 1}
          </div>
        </div>
        <PartyPokemonInput bind:partyPokemon />
      </div>
    {/each}
  </div>

  <div class="mt-4 p-1 bg-yellow-100 border">
    <div class="text-gray-600 font-bold">敵のポケモン</div>
    <SelectInput
      value={targetPokemon}
      items={PokemonData}
      let:item={pokemon}
      on:change={(e) => (targetPokemon = e.detail)}
    >
      {pokemon.name}
    </SelectInput>
  </div>

  <div class="flex flex-wrap mt-4">
    {#each _party as partyPokemon, i}
      <div class="w-1/3 p-1 border text-gray-600 bg-gray-50 text-sm">
        <div class="bg-gray-600 text-white -mx-1 -mt-1 px-1   font-bold">
          {#if i === 0}おすすめ
          {:else}
            &nbsp;
          {/if}
        </div>

        <div class="p-1">{partyPokemon.name}</div>

        <div class="">
          <div class="bg-red-400 -mx-1 px-1 text-white  text-sm">
            攻撃をした時
          </div>
          <div class="p-1" style="height: 5.5rem;">
            {#each summarizeSkills(partyPokemon.skills, false, true) as skill}
              <div>
                {skill.type} ×{skill.leverage}
                <span class="text-xs"
                  >{skill.isCharacteristic ? "(特性)" : ""}</span
                >
              </div>
            {/each}
          </div>
        </div>

        <div class="">
          <div class="bg-blue-400 -mx-1 px-1 text-white text-sm">
            わざを受けた時
          </div>
          <div class="p-1">
            {#each summarizeSkills(partyPokemon.defenceLeverage, true, true) as skill}
              <div>
                {skill.type} ×{skill.leverage}
                <span class="text-xs"
                  >{skill.isCharacteristic ? "(特性)" : ""}</span
                >
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style global>
  @tailwind utilities;
  @tailwind components;
  @tailwind base;
</style>
