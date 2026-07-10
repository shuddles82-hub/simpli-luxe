import SipRecipe, { sipTagLine } from './SipRecipe';

// Full-screen recipe overlay. Kept for quick-view use; the sip grid
// now links to /sip/[id] detail pages instead.
export default function SipModal({ sip, open, onClose }) {
  return (
    <div className={`rm${open ? ' open' : ''}`}>
      <div className="rmh">
        <div>
          <div className="rm-tag">{sipTagLine(sip)}</div>
          <div className="rm-title">{sip.title}</div>
        </div>
        <button className="rm-close" onClick={onClose}>
          ← Back to Sips
        </button>
      </div>
      <div className="rcrd">
        <SipRecipe sip={sip} />
      </div>
    </div>
  );
}
