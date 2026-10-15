import { LINKS } from '../config.js';
import { SpotifyIcon, DeezerIcon, AppleMusicIcon, DiscIcon, InstaIcon } from './Icons.jsx';
import styles from './StreamingLinks.module.css';

const PLATFORMS = [
  { key: 'spotify', label: 'SPOTIFY', Icon: SpotifyIcon },
  { key: 'deezer', label: 'DEEZER', Icon: DeezerIcon },
  { key: 'appleMusic', label: 'APPLE MUSIC', Icon: AppleMusicIcon },
  { key: 'ep', label: 'LIEN DE L’EP', Icon: DiscIcon },
  { key: 'instagram', label: 'INSTAGRAM', Icon: InstaIcon }
];

export default function StreamingLinks({ only, dark = false }) {
  // Un lien vide n'est pas affiché (rien « à venir » sur le site).
  const items = (only ? PLATFORMS.filter((p) => only.includes(p.key)) : PLATFORMS).filter((p) => LINKS[p.key]);
  return (
    <div className={`${styles.grid} ${dark ? styles.dark : ''}`}>
      {items.map(({ key, label, Icon }) => (
        <a key={key} href={LINKS[key]} target="_blank" rel="noopener noreferrer" className={styles.link}>
          <Icon /> <span>{label}</span> <span className={styles.arrow}>↗</span>
        </a>
      ))}
    </div>
  );
}
