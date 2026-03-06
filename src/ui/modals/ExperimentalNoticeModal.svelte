<script lang="ts">
  import { experimentalNoticeModalStore } from '$lib/stores/experimental-notice-modal.store';
  import { fade } from 'svelte/transition';
  import Link from '../common/Link.svelte';
</script>

<svelte:window
  on:keydown={(e) => e.key === 'Escape' && experimentalNoticeModalStore.hide()}
/>

{#if $experimentalNoticeModalStore}
  <div
    class="modal-overlay"
    transition:fade={{ duration: 300 }}
    on:click={() => experimentalNoticeModalStore.hide()}
  >
    <div
      class="modal-content"
      transition:fade={{ duration: 300, delay: 150 }}
      on:click|stopPropagation
    >
      <div class="modal-header">
        <h2 class="">Tab quality is experimental</h2>
        <button
          class="close-btn"
          on:click={() => experimentalNoticeModalStore.hide()}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      <div class="modal-body">
        <p>
          This app is currently an ongoing project focused on converting
          Songsterr JSON revisions into Guitar Pro files.
        </p>
        <p>
          Conversions are not always fully accurate yet. You may see differences
          in instruments, articulations, or notation details on some tabs.
        </p>
        <p>
          If you need the most reliable result right now, please use Songsterr's
          official download flow.
        </p>
        <p>
          <Link
            href="https://github.com/Metaphysics0/songsterr-downloader"
            innerText="Pull requests"
          />
          are very welcome while this conversion pipeline is being improved 🙏
        </p>
      </div>
      <div class="modal-footer">
        <button
          class="close-btn-main"
          on:click={() => experimentalNoticeModalStore.hide()}
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .modal-content {
    background-color: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-body p {
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .modal-footer {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .close-btn-main {
    background-color: transparent;
    color: #333;
    border: 1px solid #ccc;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .close-btn-main:hover {
    background-color: #f5f5f5;
    border-color: #999;
  }

  @media (max-width: 600px) {
    .modal-content {
      width: 95%;
    }

    .modal-header {
      padding: 12px 16px;
    }

    .modal-body {
      padding: 16px;
    }

    .modal-footer {
      padding: 12px 16px;
    }
  }
</style>
