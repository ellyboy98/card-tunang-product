import Link from "next/link";
import { presetVars } from "@/components/card/Card";
import { Sprig } from "@/components/card/Sprig";

// Static, so it uses the default preset rather than reading the database at build time.
export default function NotFound() {
  return (
    <div className="card" style={presetVars("blush", "classic")}>
      <main className="card__page card__status">
        <Sprig width={90} />
        <p className="card__eyebrow">404</p>
        <h1 className="card__heading">Halaman tidak dijumpai</h1>
        <p className="card__body card__muted">Pautan ini mungkin tersilap atau sudah tidak digunakan.</p>
        <div className="card__btn-row">
          <Link href="/" className="card__btn card__btn--filled">
            Ke kad jemputan
          </Link>
        </div>
      </main>
    </div>
  );
}
