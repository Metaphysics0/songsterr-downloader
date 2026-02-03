<script lang="ts">
  import transcriptionImg from '$lib/assets/transcription.webp';
  const FRETWISE_URL = 'https://fretwise.ai?ref=songsterr-downloader';
</script>

<section class="fretwise-ad">
  <a
    href={FRETWISE_URL}
    target="_blank"
    rel="noopener noreferrer"
    class="ad-card"
  >
    <div class="ad-content">
      <div class="text-content">
        <p class="headline">Transcribe any song with AI</p>
        <span class="brand">fretwise.ai <span class="arrow">→</span></span>
      </div>

      <div class="icon-container">
        <img src={transcriptionImg} class="size-5" alt="transcription" />
      </div>
    </div>
  </a>
</section>

<style>
  .fretwise-ad {
    display: flex;
    justify-content: center;
    padding: 1rem;
    margin-top: 1rem;
  }

  .ad-card {
    display: block;
    background: white;
    border-radius: 12px;
    border-left: 4px solid transparent;
    border-image: linear-gradient(180deg, #dc2626, #f97316) 1;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
    padding: 1.5rem 2rem;
    text-decoration: none;
    transition: all 0.2s ease;
    max-width: 500px;
    width: 100%;
  }

  .ad-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .ad-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .icon-container {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .text-content {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .headline {
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
    margin: 0;
    line-height: 1.3;
  }

  .brand {
    font-size: 0.95rem;
    font-weight: 600;
    background: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .arrow {
    transition: transform 0.2s ease;
  }

  .ad-card:hover .arrow {
    transform: translateX(3px);
  }

  @media (max-width: 400px) {
    .ad-card {
      padding: 1.25rem 1.5rem;
    }

    .headline {
      font-size: 0.9rem;
    }

    .icon-container {
      width: 36px;
      height: 36px;
    }

    .waveform-icon {
      width: 20px;
      height: 20px;
    }
  }
</style>
