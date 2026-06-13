'use strict';

const UID = 'api::entity-attachment.entity-attachment';

const SUBJECT_TYPES = new Set([
  'contact',
  'deal',
  'lead_company',
  'client_account',
  'task',
  'project',
  'meeting',
]);

function mediaFileName(file) {
  if (!file || typeof file !== 'object') return 'file';
  return file.name || file.filename || 'file';
}

function mediaUrl(file) {
  if (!file || typeof file !== 'object') return null;
  return file.url || null;
}

function normalizeAttachmentInput(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id ?? raw.mediaId ?? raw.fileId;
  if (id == null) return null;
  const name = String(raw.name || raw.fileName || 'file').trim() || 'file';
  const url = raw.url != null ? String(raw.url) : null;
  const mime = raw.mime != null ? String(raw.mime) : raw.mimeType != null ? String(raw.mimeType) : null;
  const size = raw.size != null ? Number(raw.size) : null;
  return {
    id: Number(id),
    name,
    url,
    mime,
    size: Number.isFinite(size) ? size : null,
  };
}

function normalizeAttachmentsPayload(payload) {
  const list = payload?.attachments;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeAttachmentInput).filter(Boolean).slice(0, 10);
}

async function loadUploadFile(strapi, fileId) {
  const id = Number(fileId);
  if (!Number.isFinite(id) || id < 1) return null;
  try {
    return await strapi.entityService.findOne('plugin::upload.file', id);
  } catch {
    return null;
  }
}

async function attachmentFromFileId(strapi, fileId) {
  const file = await loadUploadFile(strapi, fileId);
  if (!file) return null;
  return {
    id: file.id,
    name: mediaFileName(file),
    url: mediaUrl(file),
    mime: file.mime || null,
    size: file.size != null ? Number(file.size) : null,
  };
}

async function enrichAttachments(strapi, attachments) {
  const out = [];
  for (const item of attachments) {
    if (item.url) {
      out.push(item);
      continue;
    }
    const loaded = await attachmentFromFileId(strapi, item.id);
    if (loaded) out.push(loaded);
  }
  return out;
}

function buildCommentMeta({ comment, commentKind = 'general', attachments = [] }) {
  const meta = { comment };
  if (commentKind === 'next_connect') meta.commentKind = 'next_connect';
  if (attachments.length) meta.attachments = attachments;
  return meta;
}

async function createEntityAttachment(strapi, {
  organizationId,
  userId,
  subjectType,
  subjectId,
  fileId,
  source = 'files_tab',
  crmActivityId = null,
}) {
  const file = await loadUploadFile(strapi, fileId);
  if (!file) return null;

  return strapi.entityService.create(UID, {
    data: {
      organization: organizationId,
      uploadedBy: userId ?? null,
      subjectType,
      subjectId: Number(subjectId),
      source,
      file: file.id,
      fileName: mediaFileName(file),
      crmActivity: crmActivityId ?? null,
    },
    populate: ['file', 'uploadedBy'],
  });
}

async function syncChatAttachments(strapi, {
  organizationId,
  userId,
  subjectType,
  subjectId,
  attachments,
  crmActivityId,
}) {
  const created = [];
  for (const att of attachments) {
    const row = await createEntityAttachment(strapi, {
      organizationId,
      userId,
      subjectType,
      subjectId,
      fileId: att.id,
      source: 'chat',
      crmActivityId,
    });
    if (row) created.push(row);
  }
  return created;
}

function serializeAttachmentRow(row) {
  const file = row?.file;
  const fileObj = file && typeof file === 'object' ? file : null;
  return {
    id: row.id,
    subjectType: row.subjectType,
    subjectId: row.subjectId,
    source: row.source,
    fileName: row.fileName || mediaFileName(fileObj),
    createdAt: row.createdAt,
    uploadedBy: row.uploadedBy ?? null,
    file: fileObj
      ? {
          id: fileObj.id,
          name: mediaFileName(fileObj),
          url: mediaUrl(fileObj),
          mime: fileObj.mime || null,
          size: fileObj.size != null ? Number(fileObj.size) : null,
        }
      : null,
  };
}

module.exports = {
  SUBJECT_TYPES,
  UID,
  normalizeAttachmentsPayload,
  enrichAttachments,
  buildCommentMeta,
  createEntityAttachment,
  syncChatAttachments,
  serializeAttachmentRow,
  attachmentFromFileId,
};
