import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, Check, Copy, X } from 'lucide-react';
import type { CarOption, PaintOption } from '../data/cars';
import type { Theme } from '../hooks/useTheme';
import { CarArtwork } from './CarVisual';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  car: CarOption;
  paint: PaintOption;
  theme: Theme;
}

async function portableSvg(svg: SVGSVGElement, finalPaint: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '1600');
  clone.setAttribute('height', '768');
  clone.querySelector('.paint-grade')?.setAttribute('values', finalPaint);
  for (const image of clone.querySelectorAll('image')) {
    const source = image.getAttribute('href');
    if (!source) continue;
    const response = await fetch(source);
    if (!response.ok) throw new Error('The vehicle artwork could not be downloaded.');
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    image.setAttribute('href', dataUrl);
  }
  return new XMLSerializer().serializeToString(clone);
}

export function ShareDialog({ open, onClose, car, paint, theme }: ShareDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('car', car.id);
  url.searchParams.set('paint', paint.id);
  url.searchParams.set('theme', theme);
  const shareUrl = url.toString();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStatus('');
      setCopied(false);
      dialog.showModal();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  const copyLink = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setStatus('Link copied. Your vehicle, paint and theme are included.');
    } catch {
      linkRef.current?.focus();
      linkRef.current?.select();
      setStatus('Your link is selected. Press Ctrl+C or Command+C to copy it.');
    }
  };

  const downloadArtwork = async () => {
    const svg = previewRef.current?.querySelector('svg');
    if (!svg) return;
    setDownloading(true);
    try {
      const artwork = await portableSvg(svg, paint.colorMatrix);
      const objectUrl = URL.createObjectURL(new Blob([artwork], { type: 'image/svg+xml;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `itzfizz-${car.id}-${paint.id}.svg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setStatus('Your self-contained vehicle artwork is ready to save.');
    } catch {
      setStatus('The artwork could not be saved. Please try again, or copy your configuration link.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="share-dialog" aria-labelledby="share-title" onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="dialog-content">
        <div className="dialog-topline flex items-center justify-between"><span className="eyebrow">THE ITZFIZZ GARAGE</span><button className="dialog-close" type="button" onClick={onClose} aria-label="Close configuration"><X size={20} strokeWidth={1.5} /></button></div>
        <h2 id="share-title">A drive that's all you.</h2>
        <p className="dialog-description">Keep the configuration. Pass on the inspiration.</p>
        <div className="share-preview" ref={previewRef}>{open && <CarArtwork key={car.id} car={car} paint={paint} />}</div>
        <div className="configuration-summary flex items-center justify-between">
          <div><span className="eyebrow">{car.category} / {car.number}</span><h3>{car.name}</h3></div>
          <span className="summary-paint"><i style={{ backgroundColor: paint.hex }} aria-hidden="true" />{paint.name}</span>
        </div>
        <label className="share-link-label" htmlFor="share-url">Your configuration link</label>
        <input ref={linkRef} id="share-url" className="share-link-input" value={shareUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
        <div className="dialog-actions flex">
          <button className="primary-button inline-flex items-center justify-center" type="button" onClick={() => void copyLink()}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Link copied' : 'Copy link'}</button>
          <button className="download-button inline-flex items-center justify-center" type="button" onClick={() => void downloadArtwork()} disabled={downloading}><ArrowDownToLine size={16} />{downloading ? 'Preparing...' : 'Save artwork'}</button>
        </div>
        <p role="status" className="share-status">{status}</p>
      </div>
    </dialog>
  );
}