"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Message, Position } from "@/lib/supabase/types";

interface MessagesPanelProps {
  incidentId: string;
  incidentName: string;
  positions: Position[];
  messages: Message[];
  canEdit: boolean;
}

interface NewMessageForm {
  to_name: string;
  to_position_code: string;
  from_name: string;
  from_position_code: string;
  subject: string;
  sent_date: string;
  sent_time: string;
  body: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toTimeString().slice(0, 5);
}

function emptyForm(): NewMessageForm {
  return {
    to_name: "",
    to_position_code: "",
    from_name: "",
    from_position_code: "",
    subject: "",
    sent_date: today(),
    sent_time: now(),
    body: "",
  };
}

function fieldClass() {
  return "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30";
}

export function MessagesPanel({ incidentId, incidentName, positions, messages, canEdit }: MessagesPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showNew, setShowNew] = useState(false);
  const [newMessage, setNewMessage] = useState<NewMessageForm>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("messages").insert({
      incident_id: incidentId,
      incident_name: incidentName,
      to_name: newMessage.to_name.trim() || null,
      to_position_code: newMessage.to_position_code || null,
      from_name: newMessage.from_name.trim() || null,
      from_position_code: newMessage.from_position_code || null,
      subject: newMessage.subject.trim() || null,
      sent_date: newMessage.sent_date || null,
      sent_time: newMessage.sent_time || null,
      body: newMessage.body.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNewMessage(emptyForm());
    setShowNew(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          {!showNew ? (
            <button
              onClick={() => setShowNew(true)}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              New message
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    To — Name
                  </label>
                  <input
                    required
                    value={newMessage.to_name}
                    onChange={(e) => setNewMessage((v) => ({ ...v, to_name: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    To — Position
                  </label>
                  <select
                    value={newMessage.to_position_code}
                    onChange={(e) => setNewMessage((v) => ({ ...v, to_position_code: e.target.value }))}
                    className={fieldClass()}
                  >
                    <option value="">—</option>
                    {positions.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    From — Name
                  </label>
                  <input
                    required
                    value={newMessage.from_name}
                    onChange={(e) => setNewMessage((v) => ({ ...v, from_name: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    From — Position
                  </label>
                  <select
                    value={newMessage.from_position_code}
                    onChange={(e) => setNewMessage((v) => ({ ...v, from_position_code: e.target.value }))}
                    className={fieldClass()}
                  >
                    <option value="">—</option>
                    {positions.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Subject</label>
                <input
                  required
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage((v) => ({ ...v, subject: e.target.value }))}
                  className={fieldClass()}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date</label>
                  <input
                    type="date"
                    required
                    value={newMessage.sent_date}
                    onChange={(e) => setNewMessage((v) => ({ ...v, sent_date: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Time</label>
                  <input
                    type="time"
                    required
                    value={newMessage.sent_time}
                    onChange={(e) => setNewMessage((v) => ({ ...v, sent_time: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Message</label>
                <textarea
                  required
                  rows={4}
                  value={newMessage.body}
                  onChange={(e) => setNewMessage((v) => ({ ...v, body: e.target.value }))}
                  className={fieldClass()}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  {submitting ? "Sending..." : "Send"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNew(false);
                    setNewMessage(emptyForm());
                    setError(null);
                  }}
                  className="rounded-md border border-black/10 px-4 py-1.5 text-sm dark:border-white/10"
                >
                  Cancel
                </button>
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </form>
          )}
        </section>
      )}

      <section className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">No messages yet.</p>
        ) : (
          messages.map((m) => <MessageCard key={m.id} message={m} canEdit={canEdit} />)
        )}
      </section>
    </div>
  );
}

function MessageCard({ message, canEdit }: { message: Message; canEdit: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const [showApprove, setShowApprove] = useState(false);
  const [approveName, setApproveName] = useState("");
  const [approvePosition, setApprovePosition] = useState("");
  const [approveSignature, setApproveSignature] = useState("");
  const [approving, setApproving] = useState(false);

  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyPosition, setReplyPosition] = useState("");
  const [replying, setReplying] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  const isApproved = Boolean(message.approved_by_name);
  const hasReply = Boolean(message.reply_body);

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    setApproving(true);
    setActionError(null);

    const { error } = await supabase
      .from("messages")
      .update({
        approved_by_name: approveName.trim() || null,
        approved_by_position: approvePosition.trim() || null,
        approved_by_signature: approveSignature.trim() || null,
      })
      .eq("id", message.id);

    setApproving(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setShowApprove(false);
    router.refresh();
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setReplying(true);
    setActionError(null);

    const { error } = await supabase
      .from("messages")
      .update({
        reply_body: replyBody.trim() || null,
        replied_by_name: replyName.trim() || null,
        replied_by_position: replyPosition.trim() || null,
        reply_date: today(),
        reply_time: now(),
      })
      .eq("id", message.id);

    setReplying(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setShowReply(false);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="grid grid-cols-1 divide-y divide-black/10 border-b border-black/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-white/10 dark:border-white/10">
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-zinc-500">To</span>
          <p className="text-black dark:text-zinc-50">
            {message.to_name ?? "—"}
            {message.to_position_code && (
              <span className="text-zinc-500"> ({message.to_position_code})</span>
            )}
          </p>
        </div>
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-zinc-500">From</span>
          <p className="text-black dark:text-zinc-50">
            {message.from_name ?? "—"}
            {message.from_position_code && (
              <span className="text-zinc-500"> ({message.from_position_code})</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-black/10 border-b border-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10 dark:border-white/10">
        <div className="col-span-1 px-3 py-2">
          <span className="text-xs font-medium text-zinc-500">Subject</span>
          <p className="text-black dark:text-zinc-50">{message.subject ?? "—"}</p>
        </div>
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-zinc-500">Date</span>
          <p className="text-black dark:text-zinc-50">{message.sent_date ?? "—"}</p>
        </div>
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-zinc-500">Time</span>
          <p className="text-black dark:text-zinc-50">{message.sent_time ?? "—"}</p>
        </div>
      </div>

      <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="text-xs font-medium text-zinc-500">Message</span>
        <p className="whitespace-pre-wrap text-black dark:text-zinc-50">{message.body ?? "—"}</p>
      </div>

      <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="block text-xs font-medium text-zinc-500">Approved by</span>
        {isApproved ? (
          <p className="text-black dark:text-zinc-50">
            {message.approved_by_name}
            {message.approved_by_position && ` · ${message.approved_by_position}`}
            {message.approved_by_signature && ` · signed: ${message.approved_by_signature}`}
          </p>
        ) : canEdit ? (
          showApprove ? (
            <form onSubmit={handleApprove} className="mt-1 space-y-2">
              <input
                required
                placeholder="Name"
                value={approveName}
                onChange={(e) => setApproveName(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Position/Title"
                value={approvePosition}
                onChange={(e) => setApprovePosition(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Signature (typed name)"
                value={approveSignature}
                onChange={(e) => setApproveSignature(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={approving}
                  className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  {approving ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApprove(false)}
                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowApprove(true)}
              className="mt-1 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Approve
            </button>
          )
        ) : (
          <p className="text-zinc-500">Not yet approved</p>
        )}
      </div>

      <div className="px-3 py-2">
        <span className="block text-xs font-medium text-zinc-500">Reply</span>
        {hasReply ? (
          <div>
            <p className="whitespace-pre-wrap text-black dark:text-zinc-50">{message.reply_body}</p>
            <p className="mt-1 text-xs text-zinc-500">
              — {message.replied_by_name}
              {message.replied_by_position && `, ${message.replied_by_position}`}
              {message.reply_date && ` · ${message.reply_date}`}
              {message.reply_time && ` ${message.reply_time}`}
            </p>
          </div>
        ) : canEdit ? (
          showReply ? (
            <form onSubmit={handleReply} className="mt-1 space-y-2">
              <textarea
                required
                rows={2}
                placeholder="Reply message"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className={fieldClass()}
              />
              <input
                required
                placeholder="Replied by — Name"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Position/Title"
                value={replyPosition}
                onChange={(e) => setReplyPosition(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={replying}
                  className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  {replying ? "Saving..." : "Send reply"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReply(false)}
                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowReply(true)}
              className="mt-1 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Reply
            </button>
          )
        ) : (
          <p className="text-zinc-500">No reply yet</p>
        )}
      </div>

      {actionError && (
        <p className="border-t border-black/10 px-3 py-2 text-xs text-red-600 dark:border-white/10 dark:text-red-400">
          {actionError}
        </p>
      )}
    </div>
  );
}
