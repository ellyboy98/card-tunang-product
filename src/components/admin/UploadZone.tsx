"use client";

import { useId, useRef, useState } from "react";
import { Button } from "./ui";

type Props = {
  kind: "music" | "background";
  label: string;
  hint: string;
  accept: string;
  value: string | null;
  onChange: (url: string | null) => void;
};

/** Dashed drop zone with progress. Uses XHR because fetch has no upload progress events. */
export function UploadZone({ kind, label, hint, accept, value, onChange }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function upload(file: File) {
    setError(null);
    setProgress(0);
    const body = new FormData();
    body.append("kind", kind);
    body.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      let data: { url?: string; error?: string } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) onChange(data.url);
      else setError(data?.error ?? `Muat naik gagal (${xhr.status})`);
    };
    xhr.onerror = () => {
      setProgress(null);
      setError("Tidak dapat menghantar fail. Cuba lagi.");
    };
    xhr.open("POST", "/api/admin/upload");
    xhr.send(body);
  }

  const fileName = value ? decodeURIComponent(value.split("/").pop() ?? "") : null;

  return (
    <div className="flex flex-col gap-1">
      <span id={`${id}-label`} className="text-[13px] font-semibold">
        {label}
      </span>
      <div role="group" aria-labelledby={`${id}-label`} className="rounded-lg border border-dashed border-line bg-paper/60 p-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        {value ? (
          <div className="flex items-center gap-3">
            {kind === "background" && (
              // eslint-disable-next-line @next/next/no-img-element -- thumbnail of an arbitrary upload URL; next/image would need a remotePatterns entry per storage host
              <img src={value} alt="" className="h-12 w-12 rounded object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px]">{fileName}</p>
              <a href={value} target="_blank" rel="noreferrer" className="text-[12px] text-accent underline">
                Buka fail
              </a>
            </div>
            <Button size="sm" disabled={progress !== null} onClick={() => inputRef.current?.click()}>
              Tukar
            </Button>
            <Button size="sm" variant="danger" disabled={progress !== null} onClick={() => onChange(null)}>
              Buang
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] text-muted">{hint}</p>
            <Button size="sm" disabled={progress !== null} onClick={() => inputRef.current?.click()}>
              Muat naik
            </Button>
          </div>
        )}
        {progress !== null && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-line" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan muat naik">
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && (
          <p className="mt-2 text-[12px] text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
