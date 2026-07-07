import styles from './VideoPlaceholder.module.css';

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

  if (src) {
    return (
      <div className={`${styles.wrap} ${fill ? styles.fill : ''} ${className}`} style={style}>
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

  return (
    <div className={`${styles.wrap} ${fill ? styles.fill : ''} ${className}`} style={style}>
      <div className={styles.placeholder}>
        <span className={styles.label}>{label}</span>
        <span className={styles.cross} aria-hidden="true" />
      </div>
    </div>
  );
}
