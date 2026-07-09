import styles from './VideoPlaceholder.module.css';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
};

export default function VideoPlaceholder({
  src = null,
  poster = null,
  label = '[ MEDIA À VENIR ]',
  ratio = '16/9',
  autoPlay = false,
  loop = false,
  muted = false,
  controls = false,
  className = '',
  fill = false
}) {
  const style = fill ? {} : { aspectRatio: ratio };
  const wrapClass = `${styles.wrap} ${fill ? styles.fill : ''} ${className}`;
  const ytId = getYouTubeId(src);

  if (ytId) {
    if (autoPlay || controls) {
      return (
        <div className={wrapClass} style={style}>
          <iframe
            className={styles.video}
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&rel=0`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      );
    }
    return (
      <div className={wrapClass} style={style}>
        <img
          src={poster || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
          alt={label}
          className={styles.video}
        />
      </div>
    );
  }

  if (src) {
    return (
      <div className={wrapClass} style={style}>
        <video
          src={src}
          poster={poster || undefined}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          playsInline
          className={styles.video}
        />
      </div>
    );
  }

  if (poster) {
    return (
      <div className={wrapClass} style={style}>
        <img src={poster} alt={label} className={styles.video} />
      </div>
    );
  }

  return (
    <div className={wrapClass} style={style}>
      <div className={styles.placeholder}>
        <span className={styles.label}>{label}</span>
        <span className={styles.cross} aria-hidden="true" />
      </div>
    </div>
  );
}
