<script lang="ts">
  import { temporarilyDownModalStore } from '$lib/stores/temporarily-down-modal.store';
  import { fade } from 'svelte/transition';
</script>

{#if $temporarilyDownModalStore}
  <div class="modal-overlay" transition:fade={{ duration: 300 }}>
    <div class="modal-content" transition:fade={{ duration: 300, delay: 150 }}>
      <div class="modal-header">
        <h2>We're temporarily down 😢</h2>
        <button
          class="close-btn"
          on:click={() => ($temporarilyDownModalStore = false)}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      <div class="modal-body">
        <p>
          Songsterr has recently changed their API, causing my app and others to
          no longer be functioning 💔
        </p>
        <p>
          Luckily, Songsterr has updated the UI/UX for downloading tabs, so this
          app does not have much of a purpose anymore.
        </p>
        <p>
          Thank you to everyone that has used this app, and for all the kind
          words and support.
        </p>
        <p>
          If anyone has any ideas for future apps, or any useful software tools,
          please send me a message, and I will gladly develop it!
        </p>
        <p>
          With over 100k daily active users, I never made a $ from this. If
          anyone wants to buy me a coffee, I'd greatly appreciate it!
        </p>

        <a href="https://www.buymeacoffee.com/ryanroberts" target="_blank"
          ><img
            src="https://cdn.buymeacoffee.com/buttons/default-yellow.png"
            alt="Buy Me A Coffee"
            height="41"
            width="174"
          /></a
        >

        <p />
        <p>
          Take care, and stay safe!<br />
          - Ryan
        </p>
      </div>
      <div class="modal-footer">
        <button
          class="close-btn-main"
          on:click={() => ($temporarilyDownModalStore = false)}
        >
          Close
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
    border-bottom: 1px solid #eee;
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
    border-top: 1px solid #eee;
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
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .close-btn-main:hover {
    background-color: #dc2626;
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
