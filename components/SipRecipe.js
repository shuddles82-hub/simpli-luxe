// The recipe card body (flavor profile, ingredients, steps, ritual,
// vibe bar). Used by the /sip/[id] detail page and the SipModal.
export default function SipRecipe({ sip }) {
  return (
    <div className="rbd">
      {sip.image && (
        // Hero photo at natural portrait ratio, uncropped; the recipe
        // fields render as real text below it.
        <img className="recipe-hero" src={sip.image} alt={sip.title} />
      )}
      {sip.flavorProfile && (
        <div className="rfl">
          <div className="rfl-l">Flavor Profile</div>
          <div className="rfl-t">{sip.flavorProfile}</div>
        </div>
      )}
      {(sip.ingredients?.length > 0 || sip.howToMake?.length > 0) && (
        <div className="r2c">
          {sip.ingredients?.length > 0 && (
            <div>
              <div className="rch">Ingredients</div>
              <ul className="rl">
                {sip.ingredients.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          {sip.howToMake?.length > 0 && (
            <div>
              <div className="rch">{sip.stepsHeading || 'How to Make It'}</div>
              <div className="rsteps">
                {sip.howToMake.map((x, i) => (
                  <div key={i} className="rstep">
                    <div className="rsn">{i + 1}</div>
                    <div className="rst">{x}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {sip.ritualMoment && (
        <div className="rritual">
          <div className="rrl">{sip.ritualHeading || 'Ritual Moment'}</div>
          <div className="rrt">{sip.ritualMoment}</div>
        </div>
      )}
      {sip.vibeNotes && <div className="vbar">{sip.vibeNotes}</div>}
    </div>
  );
}

export function sipTagLine(sip) {
  return (
    sip.modalTag ||
    [
      sip.epLabel || (sip.episode ? `EP. ${String(sip.episode).padStart(2, '0')}` : ''),
      sip.era,
      sip.season,
    ]
      .filter(Boolean)
      .join(' · ')
  );
}
