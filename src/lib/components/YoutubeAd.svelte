<script lang="ts">
  import { trackYouTubeVideoClicked } from '$lib/analytics/mixpanel';

  const VIDEO_ID = 'SsIMY8xmDNY';
  const href = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
  const thumbnail = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;
</script>

<div class="wrap">
  <a
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class="card"
    on:click={trackYouTubeVideoClicked}
  >
    <div class="thumb">
      <img src={thumbnail} alt="How I built this app" />
      <div class="play">
        <svg viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg">
          <path
            class="play-bg"
            d="M66.5 7.7a8.5 8.5 0 0 0-6-6C56 0 34 0 34 0S12 0 7.5 1.7a8.5 8.5 0 0 0-6 6C0 12.3 0 24 0 24s0 11.7 1.6 16.3a8.5 8.5 0 0 0 6 6C12 48 34 48 34 48s22 0 26.5-1.7a8.5 8.5 0 0 0 6-6C68 35.7 68 24 68 24s0-11.7-1.5-16.3z"
          />
          <path class="play-arrow" d="M27 34l18-10-18-10v20z" />
        </svg>
      </div>
    </div>
    <p class="label">See how I built this app!</p>
  </a>
</div>

<style>
  .wrap {
    display: flex;
    justify-content: center;
    padding: 1rem;
    margin-top: 1rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-decoration: none;
    max-width: 320px;
    width: 100%;
  }

  .thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    background: #000;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 0.2s ease;
  }

  .card:hover .thumb img {
    opacity: 0.85;
  }

  .play {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .play svg {
    width: 48px;
    height: 34px;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
    transition: transform 0.15s ease;
  }

  .card:hover .play svg {
    transform: scale(1.08);
  }

  .play-bg {
    fill: #ff0000;
    opacity: 0.9;
  }

  .play-arrow {
    fill: #fff;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
    margin: 0 auto;
    text-align: center;
  }
</style>
