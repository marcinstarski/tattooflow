"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  depositStatus: string;
  depositAmount?: number | null;
  description?: string | null;
  artist: { name: string };
};

type Message = {
  id: string;
  direction: string;
  channel: string;
  body: string;
  createdAt: string;
};

type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  igHandle?: string | null;
  marketingOptIn: boolean;
  notes?: string | null;
  createdAt: string;
  appointments: Appointment[];
  messages: Message[];
  assets: ClientAsset[];
  albums: ClientAlbum[];
};

type ClientAsset = {
  id: string;
  url: string;
  note?: string | null;
  source: string;
  createdAt: string;
  albumId?: string | null;
};

type ClientAlbum = {
  id: string;
  name: string;
  createdAt: string;
};

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState("");
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | "">("");
  const [dragActive, setDragActive] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/clients/${clientId}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = (await res.json()) as Client;
    setClient(data);
    setNotes(data.notes || "");
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    if (clientId) {
      load().catch(() => setLoading(false));
    }
  }, [clientId]);

  const saveNotes = async () => {
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
    await load();
  };

  const toggleMarketing = async () => {
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketingOptIn: !client?.marketingOptIn, unsubscribedAt: null })
    });
    await load();
  };

  const deleteClient = async () => {
    if (!confirm("Czy na pewno usunąć dane klienta? Tej operacji nie da się cofnąć.")) return;
    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/app/clients");
    }
  };

  const addAsset = async () => {
    if (!assetFiles.length) return;
    const formData = new FormData();
    assetFiles.forEach((file) => formData.append("files", file));
    formData.append("albumId", selectedAlbumId || "");
    await fetch(`/api/clients/${clientId}/assets/upload`, {
      method: "POST",
      body: formData
    });
    setAssetFiles([]);
    await load();
  };

  const removeAsset = async (assetId: string) => {
    await fetch(`/api/clients/${clientId}/assets/${assetId}`, { method: "DELETE" });
    await load();
  };

  const createAlbum = async () => {
    if (!albumName) return;
    const res = await fetch(`/api/clients/${clientId}/albums`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: albumName })
    });
    const album = await res.json();
    setAlbumName("");
    if (album?.id) {
      setSelectedAlbumId(album.id);
    }
    await load();
  };

  const removeAlbum = async (albumId: string) => {
    await fetch(`/api/clients/${clientId}/albums/${albumId}`, { method: "DELETE" });
    if (selectedAlbumId === albumId) {
      setSelectedAlbumId("");
    }
    await load();
  };

  const moveAsset = async (assetId: string, albumId: string | null) => {
    await fetch(`/api/clients/${clientId}/assets/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId })
    });
    await load();
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () => {
    if (lightboxIndex === null || !client) return;
    setLightboxIndex((lightboxIndex - 1 + client.assets.length) % client.assets.length);
  };
  const showNext = () => {
    if (lightboxIndex === null || !client) return;
    setLightboxIndex((lightboxIndex + 1) % client.assets.length);
  };

  const assetIndexById = useMemo(() => {
    if (!client) return new Map<string, number>();
    return new Map(client.assets.map((asset, index) => [asset.id, index]));
  }, [client]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (files.length) {
      setAssetFiles(files);
    }
  };


  if (!mounted || loading) {
    return <div className="text-sm text-ink-400">Ładowanie...</div>;
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-ink-400">Nie znaleziono klienta.</div>
        <Link href="/app/clients" className="text-accent-400">Wróć do listy</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display">{client.name}</h1>
          <div className="text-xs text-ink-400">Utworzono: {new Date(client.createdAt).toLocaleDateString("pl-PL")}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={toggleMarketing}>
            {client.marketingOptIn ? "Wyłącz zgodę marketingową" : "Włącz zgodę marketingową"}
          </Button>
          <Button
            variant="secondary"
            className="border border-red-500/40 text-red-200 hover:bg-red-500/10"
            onClick={deleteClient}
          >
            Usuń dane klienta
          </Button>
        </div>
      </div>

      <Card>
        <div className="text-sm text-ink-400">Dane kontaktowe</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input value={client.email || "Brak email"} readOnly />
          <Input value={client.phone || "Brak telefonu"} readOnly />
          <Input value={client.igHandle || "Brak IG"} readOnly />
          <Input value={client.marketingOptIn ? "Zgoda marketingowa" : "Brak zgody marketingowej"} readOnly />
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Notatki</div>
        <div className="mt-4">
          <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notatki o kliencie" />
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={saveNotes}>Zapisz notatki</Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Zdjęcia referencyjne</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div
            className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-xs text-ink-300 transition ${dragActive ? "border-accent-500 bg-ink-800/80" : "border-ink-700 bg-ink-900/50"}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            Przeciągnij i upuść zdjęcia tutaj
            <span className="mt-1 text-[11px] text-ink-500">albo kliknij, aby wybrać pliki</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => setAssetFiles(Array.from(event.target.files || []))}
          />
          <select
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-2 text-sm"
            value={selectedAlbumId}
            onChange={(event) => setSelectedAlbumId(event.target.value)}
          >
            <option value="">Bez albumu</option>
            {client.albums.map((album) => (
              <option key={album.id} value={album.id}>{album.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <Input placeholder="Nowy album" value={albumName} onChange={(event) => setAlbumName(event.target.value)} />
            <Button onClick={createAlbum} disabled={!albumName}>Dodaj</Button>
          </div>
        </div>
        {assetFiles.length > 0 && (
          <div className="mt-2 text-xs text-ink-400">
            Wybrane pliki: {assetFiles.map((f) => f.name).join(", ")}
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <Button onClick={addAsset} disabled={!assetFiles.length}>Dodaj zdjęcia</Button>
        </div>
        <div className="mt-6 space-y-6">
          {client.albums.map((album) => {
            const assets = client.assets.filter((asset) => asset.albumId === album.id);
            return (
              <div key={album.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">{album.name}</div>
                  <button className="text-xs text-accent-400" onClick={() => removeAlbum(album.id)}>Usuń album</button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {assets.length === 0 && <div className="text-xs text-ink-500">Brak zdjęć w albumie.</div>}
                  {assets.map((asset) => (
                    <div key={asset.id} className="rounded-xl border border-ink-700 p-3 text-sm">
                      <button type="button" onClick={() => openLightbox(assetIndexById.get(asset.id) ?? 0)} className="w-full">
                        <img
                          src={asset.url}
                          alt="Zdjęcie referencyjne"
                          className="h-40 w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                      </button>
                      <div className="mt-2">
                        <select
                          className="w-full rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-xs"
                          value={asset.albumId || ""}
                          onChange={(event) => moveAsset(asset.id, event.target.value || null)}
                        >
                          <option value="">Bez albumu</option>
                          {client.albums.map((alb) => (
                            <option key={alb.id} value={alb.id}>{alb.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-ink-400">
                        <a className="text-accent-400" href={asset.url} download>
                          Pobierz
                        </a>
                        <button className="text-accent-400" onClick={() => removeAsset(asset.id)}>Usuń</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div>
            <div className="mb-3 text-sm font-semibold">Bez albumu</div>
            <div className="grid gap-3 md:grid-cols-3">
              {client.assets.filter((asset) => !asset.albumId).length === 0 && (
                <div className="text-xs text-ink-500">Brak zdjęć bez albumu.</div>
              )}
              {client.assets.filter((asset) => !asset.albumId).map((asset) => (
                <div key={asset.id} className="rounded-xl border border-ink-700 p-3 text-sm">
                  <button type="button" onClick={() => openLightbox(assetIndexById.get(asset.id) ?? 0)} className="w-full">
                    <img
                      src={asset.url}
                      alt="Zdjęcie referencyjne"
                      className="h-40 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  </button>
                  <div className="mt-2">
                    <select
                      className="w-full rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-xs"
                      value={asset.albumId || ""}
                      onChange={(event) => moveAsset(asset.id, event.target.value || null)}
                    >
                      <option value="">Bez albumu</option>
                      {client.albums.map((alb) => (
                        <option key={alb.id} value={alb.id}>{alb.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-ink-400">
                    <a className="text-accent-400" href={asset.url} download>
                      Pobierz
                    </a>
                    <button className="text-accent-400" onClick={() => removeAsset(asset.id)}>Usuń</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {lightboxIndex !== null && client.assets[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={closeLightbox}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={client.assets[lightboxIndex].url}
              alt="Podgląd zdjęcia"
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-100">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={showPrev}>Poprzednie</Button>
                <Button variant="secondary" onClick={showNext}>Następne</Button>
              </div>
              <div className="flex gap-2">
                <a className="rounded-xl border border-ink-700 px-4 py-2 text-sm" href={client.assets[lightboxIndex].url} download>
                  Pobierz
                </a>
                <Button onClick={closeLightbox}>Zamknij</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-400">Wiadomości</div>
          <Link className="text-xs text-accent-400" href={`/app/messages/${client.id}`}>Otwórz wątek</Link>
        </div>
        <div className="mt-4 space-y-3">
          {client.messages.length === 0 && (
            <div className="text-xs text-ink-500">Brak wiadomości.</div>
          )}
          {client.messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-ink-700 p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {msg.direction === "outbound" ? "Wychodzące" : "Przychodzące"} · {msg.channel}
                </div>
                <div className="text-xs text-ink-400">{new Date(msg.createdAt).toLocaleString("pl-PL")}</div>
              </div>
              <div className="mt-2 text-sm text-ink-100">{msg.body}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-sm text-ink-400">Historia wizyt</div>
        <div className="mt-4 space-y-3">
          {client.appointments.length === 0 && (
            <div className="text-xs text-ink-500">Brak wizyt.</div>
          )}
          {client.appointments.map((appt) => (
            <div key={appt.id} className="rounded-xl border border-ink-700 p-4 text-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{new Date(appt.startsAt).toLocaleString("pl-PL")}</div>
                  <div className="text-xs text-ink-400">Artysta: {appt.artist.name}</div>
                  <div className="text-xs text-ink-500">Status: {appt.status}</div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="rounded-lg border border-ink-700 px-3 py-1 text-xs"
                    href={`/api/appointments/${appt.id}/ics`}
                  >
                    ICS
                  </a>
                </div>
              </div>
              {appt.depositAmount ? (
                <div className="mt-2 text-xs text-ink-300">Zadatek: {appt.depositStatus} · {appt.depositAmount} PLN</div>
              ) : null}
              {appt.description ? (
                <div className="mt-2 text-xs text-ink-200">{appt.description}</div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
