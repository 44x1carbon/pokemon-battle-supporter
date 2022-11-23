<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let items: any[];
  export let field: string = "name";
  export let value: any;

  let query: string = "";

  let isFocused = false;
  function onFocus() {
    isFocused = true;
    query = "";
  }
  function onBlur() {
    setTimeout(() => {
      isFocused = false;
    }, 200);
  }

  $: filterdItems = items.filter((item) => {
    const query2 = query.replace(/[ぁ-ん]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) + 0x60);
    });
    return (
      query === "" ||
      item[field].includes(query) ||
      item[field].includes(query2)
    );
  });

  $: {
    query = value ? value[field] : "";
  }

  const dispatch = createEventDispatcher();

  function itemOnClick(item: any | undefined) {
    dispatch("change", item);
    isFocused = false;
    if (item === undefined) {
      query = "";
      return;
    }

    query = item[field];
  }
</script>

<div class="relative">
  <input
    type="text"
    class="border px-1 text-gray-600 w-48"
    placeholder="- - - - -"
    bind:value={query}
    on:focus={onFocus}
    on:blur={onBlur}
  />
  {#if isFocused}
    <ui
      class="border h-48 overflow-y-scroll block w-fit absolute z-10 bg-white px-2 text-gray-600"
    >
      <li class=" cursor-pointer" on:click={() => itemOnClick(undefined)}>
        - - - - -
      </li>
      {#each filterdItems as item}
        <li class=" cursor-pointer" on:click={() => itemOnClick(item)}>
          <slot {item} />
        </li>
      {/each}
    </ui>
  {/if}
</div>
