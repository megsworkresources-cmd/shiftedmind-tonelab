import ZodiacSky from './ZodiacSky';

/**
 * The decorative layer.
 *
 * It is the only element with a z-index below content, sits inside an isolated
 * wrapper, and is capped in height so it can never sit behind reading copy.
 * The audit's biggest visual bug was decoration painting over the hero sentence;
 * this component makes that impossible by construction.
 */
export default function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-base" />
      <div className="starfield" />
      <ZodiacSky />
      <div
        className="sky-cloud cloud-a"
        style={{ width: '34rem', height: '9rem', top: '7rem', left: '46%', opacity: 0.22 }}
      />
      <div
        className="sky-cloud cloud-b"
        style={{ width: '26rem', height: '7rem', top: '15rem', left: '12%', opacity: 0.16 }}
      />
      <div
        className="sky-cloud cloud-a"
        style={{ width: '42rem', height: '10rem', top: '21rem', left: '58%', opacity: 0.14 }}
      />
      <div className="sky-scrim" />
    </div>
  );
}
