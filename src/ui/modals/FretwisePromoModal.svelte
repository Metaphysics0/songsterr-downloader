<script lang="ts">
  import { fretwisePromoModalStore } from '$lib/stores/fretwise-promo-modal.store';
  import fretwiseImg from '$lib/assets/fretwise-img.png';
  import { fade, scale } from 'svelte/transition';

  const FRETWISE_URL = 'https://fretwise.ai?ref=songsterr-downloader-modal';
</script>

{#if $fretwisePromoModalStore}
  <div
    class="modal-overlay"
    transition:fade={{ duration: 200 }}
    on:click={fretwisePromoModalStore.hide}
    on:keydown={(e) => e.key === 'Escape' && fretwisePromoModalStore.hide()}
    role="button"
    tabindex="0"
  >
    <div
      class="modal-content"
      transition:scale={{ duration: 200, start: 0.95 }}
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="gradient-bar"></div>

      <button
        class="close-btn"
        on:click={fretwisePromoModalStore.hide}
        aria-label="Close modal"
      >
        ✕
      </button>

      <div class="modal-body">
        <span class="badge">fretwise.ai</span>

        <img src={fretwiseImg} alt="Fretwise AI Transcription" class="hero-img" />

        <h2 class="headline">Take Your Guitar Playing Further</h2>
        <p class="subtext">
          Use AI to transcribe any song into accurate guitar tabs. Just paste a
          YouTube link and get tabs in seconds.
        </p>

        <a
          href={FRETWISE_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="cta-btn"
        >
          Try Fretwise Free
        </a>

        <button class="dismiss-link" on:click={fretwisePromoModalStore.hide}>
          Maybe later
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
    position: relative;
    background-color: white;
    border-radius: 16px;
    width: 90%;
    max-width: 550px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .gradient-bar {
    height: 6px;
    background: linear-gradient(135deg, #dc2626, #f97316);
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.05);
    border: none;
    font-size: 1rem;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
    color: #6b7280;
  }

  .close-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .modal-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .badge {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    background: linear-gradient(135deg, #dc2626, #f97316);
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 9999px;
    margin-bottom: 1.25rem;
  }

  .hero-img {
    width: 100%;
    max-width: 450px;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .headline {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.75rem 0;
  }

  .subtext {
    font-size: 1rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
    max-width: 400px;
  }

  .cta-btn {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: linear-gradient(135deg, #dc2626, #f97316);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 14px 0 rgba(220, 38, 38, 0.35);
  }

  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(220, 38, 38, 0.4);
  }

  .dismiss-link {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 0.875rem;
    cursor: pointer;
    margin-top: 1rem;
    padding: 0.5rem;
    transition: color 0.2s;
  }

  .dismiss-link:hover {
    color: #6b7280;
  }

  @media (max-width: 500px) {
    .modal-body {
      padding: 1.5rem;
    }

    .headline {
      font-size: 1.25rem;
    }

    .subtext {
      font-size: 0.9rem;
    }

    .cta-btn {
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
    }
  }
</style>
