import { useMemo, useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { Link, useNavigate, useParams } from 'react-router-dom';
import qrcode from 'qrcode-generator';
import { Band, Label, PillButton, RowNum, SectionHead, StatStrip } from '../../design/primitives';
import { LineChart } from '../../design/Charts';
import { Ladder } from '../../design/Ladder';
import { PATHWAY_STAGES } from '../../data/mission2036';
import { passportFor, VERIFIED_LABEL } from '../../data/passport';
import { RURAL_TALENT } from '../../data/inclusion';
import { useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import './passport.css';

/** QR code as one SVG path, so it stays sharp at any size and prints cleanly. */
function Qr({ text, label }: { text: string; label: string }) {
  const { d, n } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const size = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (qr.isDark(r, c)) path += `M${c + 2} ${r + 2}h1v1h-1z`;
    return { d: path, n: size + 4 };
  }, [text]);
  return (
    <svg className="pp__qr" viewBox={`0 0 ${n} ${n}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      <path d={d} fill="#10140f" />
    </svg>
  );
}

/** Public, read-only athlete passport. Verified performance only. */
export function PassportPage() {
  const { id } = useParams();
  const p = passportFor(id);
  const t = useT();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const invited = useStore((s) => s.invited);
  const toggleInvite = useStore((s) => s.toggleInvite);
  const [copied, setCopied] = useState(false);

  if (!p) {
    return (
      <div className="pp pp--missing">
        <Label>Athlete passport</Label>
        <h1 className="D pp__name">{t('Passport not found')}</h1>
        <Link to="/" className="textbtn">
          {t('← Back')}
        </Link>
      </div>
    );
  }

  const url = `${window.location.origin}/passport/${p.id}`;
  const canInvite = user?.role === 'board' && RURAL_TALENT.some((r) => r.id === p.id);
  const on = invited.includes(p.id);
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `${p.name} · AtheLead passport`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      /* Share sheet closed. */
    }
  };

  return (
    <div className="pp">
      <div className="pp__bar">
        <button type="button" className="textbtn" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
          {t('← Back')}
        </button>
        <Label>Athlete passport</Label>
      </div>

      <Band tone="cobalt" i={0} aria-label="Athlete">
        <div className="labelrow">
          <Label>Velora Sports Union · India</Label>
          <span className="M pp__num">{p.number}</span>
        </div>
        <h1 className="D pp__name">{p.name}</h1>
        <p className="pp__event">
          <SportTag of={p.id} sportOnly className="pp__sport" />
          {t(p.event)} · PB {p.pb}
        </p>
        <p className="M pp__home">
          {p.village}, {p.district}, {p.state}
          {p.origin === 'rural' && <span className="tag tag--rural pp__tag">{t('Rural')}</span>}
        </p>
      </Band>

      <Band rule="ink" i={1} aria-label="Summary">
        <StatStrip
          items={[
            { value: p.pb, label: t('Personal best') },
            { value: p.devIndex, label: p.nextGate ? t('Dev index · gate {g}', { g: p.nextGate }) : t('Dev index') },
            { value: `▲${p.trend}`, label: t('Last 90 days'), tone: 'ok' },
          ]}
        />
        <div className="pp__ladder">
          <Label>{t('Pathway · {s}', { s: t(PATHWAY_STAGES[p.stage]) })}</Label>
          <Ladder stages={PATHWAY_STAGES} current={p.stage} />
        </div>
      </Band>

      <Band i={2} flush aria-label="Verified results">
        <SectionHead title="Verified results" aside={t('{n} on record', { n: p.results.length })} />
        <ul className="rows">
          {p.results.map((r, i) => (
            <li key={`${r.label}-${r.date}`}>
              <div className="row pp__row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{t(r.label)}</span>
                  <span className="M">
                    {r.where} · {r.date}
                  </span>
                  <span className={`M pp__by pp__by--${r.by}`}>✓ {t(VERIFIED_LABEL[r.by])}</span>
                </span>
                <span className="D row__val">{r.value}</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      {p.progression && (
        <Band rule="ink" i={3} aria-label="Progression">
          <SectionHead title="Progression" aside={t('{e} · lower is faster', { e: p.results[0].label })} />
          <LineChart
            values={p.progression.values}
            labels={p.progression.labels}
            format={(v) => `${v.toFixed(2)} ${p.progression!.unit}`}
            label={t('PB progression')}
          />
        </Band>
      )}

      <Band tone="panel" i={4} aria-label="Sign-off">
        <Label>Signed off</Label>
        <p className="pp__sign">
          {p.signedBy} · {p.signedOn}
        </p>
        <p className="M pp__fine">
          {t('Coach: {c}', { c: p.coach })} · {t('Found via {how}', { how: t(p.discovered) })}
        </p>
        <p className="pp__privacy">
          {t('Performance data only. Health, wellbeing, fitness-band and diet data never appear on a passport.')}
        </p>
      </Band>

      <Band i={5} aria-label="Share">
        <div className="pp__share">
          <Qr text={url} label={t('QR code for {name}’s passport', { name: p.name })} />
          <div className="pp__sharetext">
            <Label>Scan at trials</Label>
            <p className="pp__sharelede">{t('Selectors scan this code to open the verified record on any phone.')}</p>
            <PillButton variant="outline" className="pill--sm" onClick={share}>
              {copied ? t('Link copied ✓') : t('Share link')}
            </PillButton>
          </div>
        </div>
        {canInvite && (
          <PillButton variant={on ? 'ink' : 'coral'} block aria-pressed={on} onClick={() => toggleInvite(p.id)} className="pp__invite">
            {on ? t('Invited to national trials ✓') : t('Invite to national trials')}
          </PillButton>
        )}
      </Band>
    </div>
  );
}
