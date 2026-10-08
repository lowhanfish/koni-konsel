const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib tersedia untuk smoke test admin");
}

let cookie = "";
let createdId = "";
let createdMessageId = "";
let createdUserId = "";
let createdAnnouncementId = "";
let uploadedMediaId = "";
let originalSettings = null;

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...init.headers,
    },
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";", 1)[0];
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  return { response, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function settingsPayload(settings) {
  return {
    organizationName: settings.organizationName,
    description: settings.description,
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    youtubeUrl: settings.youtubeUrl,
  };
}

try {
  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  assert(login.response.ok && cookie, `Login gagal (${login.response.status})`);

  const list = await request("/api/content?kind=NEWS&page=1&pageSize=1");
  assert(list.response.ok && list.body?.meta?.statusCounts, `Daftar konten gagal (${list.response.status})`);

  const uploadBody = new FormData();
  uploadBody.set("purpose", "attachment");
  uploadBody.set("file", new File([new TextEncoder().encode("%PDF-1.4\n%%EOF")], "lampiran-smoke.pdf", { type: "application/pdf" }));
  const uploadResponse = await fetch(`${baseUrl}/api/media`, { method: "POST", headers: { Cookie: cookie }, body: uploadBody });
  const upload = await uploadResponse.json().catch(() => null);
  assert(uploadResponse.status === 201 && upload?.data?.id, `Unggah lampiran gagal (${uploadResponse.status})`);
  uploadedMediaId = upload.data.id;

  const announcement = await request("/api/content", {
    method: "POST",
    body: JSON.stringify({
      kind: "ANNOUNCEMENT",
      title: `Smoke Test Lampiran ${Date.now()}`,
      status: "PUBLISHED",
      summary: "<p>Pengumuman sementara untuk menguji lampiran.</p>",
      metadata: {
        attachmentUrl: upload.data.url,
        attachmentFileId: upload.data.id,
        attachmentName: upload.data.name,
        attachmentMimeType: upload.data.mimeType,
        attachmentSize: upload.data.size,
      },
    }),
  });
  assert(announcement.response.status === 201 && announcement.body?.data?.id, `Buat pengumuman berlampiran gagal (${announcement.response.status})`);
  createdAnnouncementId = announcement.body.data.id;
  const mediaResponse = await fetch(`${baseUrl}${upload.data.url}`);
  assert(mediaResponse.ok && mediaResponse.headers.get("content-type") === "application/pdf", `Baca lampiran gagal (${mediaResponse.status})`);
  const deleteAnnouncement = await request(`/api/content/${createdAnnouncementId}`, { method: "DELETE" });
  assert(deleteAnnouncement.response.status === 204, `Hapus pengumuman berlampiran gagal (${deleteAnnouncement.response.status})`);
  createdAnnouncementId = "";
  const deletedMedia = await fetch(`${baseUrl}${upload.data.url}`);
  assert(deletedMedia.status === 404, `File lampiran belum ikut terhapus (${deletedMedia.status})`);
  uploadedMediaId = "";

  const contentTitle = `Smoke Test Admin ${Date.now()}`;
  const create = await request("/api/content", {
    method: "POST",
    body: JSON.stringify({ kind: "NEWS", title: contentTitle, category: "Pengujian", summary: "<p>Record <strong>sementara</strong> untuk verifikasi CRUD.</p><script>alert('xss')</script>", status: "DRAFT" }),
  });
  assert(create.response.status === 201 && create.body?.data?.id, `Create gagal (${create.response.status})`);
  assert(create.body.data.summary.includes("<strong>sementara</strong>") && !create.body.data.summary.includes("<script"), "Sanitasi rich-text gagal");
  createdId = create.body.data.id;

  const update = await request(`/api/content/${createdId}`, {
    method: "PATCH",
    body: JSON.stringify({ summary: "<h2>Hasil pengujian</h2><p>Record sementara berhasil diperbarui.</p>", status: "PUBLISHED" }),
  });
  assert(update.response.ok && update.body?.data?.summary.includes("diperbarui"), `Update gagal (${update.response.status})`);

  const detail = await request(`/api/content/${createdId}`);
  assert(detail.response.ok && detail.body?.data?.id === createdId, `Detail gagal (${detail.response.status})`);

  const publicList = await request(`/api/public/content?kind=NEWS&q=${encodeURIComponent(contentTitle)}&page=1&pageSize=10`);
  assert(publicList.response.ok && publicList.body?.data?.some((item) => item.id === createdId), `Publikasi konten gagal (${publicList.response.status})`);

  const publicDetail = await fetch(`${baseUrl}/berita/${create.body.data.slug}`);
  assert(publicDetail.ok && (await publicDetail.text()).includes(contentTitle), `Halaman detail publik gagal (${publicDetail.status})`);

  const remove = await request(`/api/content/${createdId}`, { method: "DELETE" });
  assert(remove.response.status === 204, `Delete gagal (${remove.response.status})`);
  createdId = "";

  const missing = await request(`/api/content/${create.body.data.id}`);
  assert(missing.response.status === 404, `Verifikasi delete gagal (${missing.response.status})`);

  const messageSubject = `Smoke Test Pesan ${Date.now()}`;
  const contact = await request("/api/contact", {
    method: "POST",
    body: JSON.stringify({ name: "Penguji Admin", email: "smoke@example.com", subject: messageSubject, message: "Pesan sementara untuk memverifikasi kotak masuk admin.", website: "" }),
  });
  assert(contact.response.status === 201 && contact.body?.data?.id, `Kirim pesan gagal (${contact.response.status})`);
  createdMessageId = contact.body.data.id;

  const messages = await request(`/api/messages?q=${encodeURIComponent(messageSubject)}&page=1&pageSize=10`);
  assert(messages.response.ok && messages.body?.data?.some((message) => message.id === createdMessageId), `Daftar pesan gagal (${messages.response.status})`);

  const readMessage = await request(`/api/messages/${createdMessageId}`, { method: "PATCH", body: JSON.stringify({ status: "READ" }) });
  assert(readMessage.response.ok && readMessage.body?.data?.status === "READ", `Update pesan gagal (${readMessage.response.status})`);

  const deleteMessage = await request(`/api/messages/${createdMessageId}`, { method: "DELETE" });
  assert(deleteMessage.response.status === 204, `Hapus pesan gagal (${deleteMessage.response.status})`);
  createdMessageId = "";

  const userEmail = `smoke-${Date.now()}@example.com`;
  const createUser = await request("/api/users", { method: "POST", body: JSON.stringify({ name: "Pengguna Smoke", email: userEmail, password: "SmokeTest!123", role: "EDITOR", isActive: true }) });
  assert(createUser.response.status === 201 && createUser.body?.data?.id, `Buat pengguna gagal (${createUser.response.status})`);
  createdUserId = createUser.body.data.id;

  const users = await request(`/api/users?q=${encodeURIComponent(userEmail)}&page=1&pageSize=10`);
  assert(users.response.ok && users.body?.data?.some((user) => user.id === createdUserId), `Daftar pengguna gagal (${users.response.status})`);

  const updateUser = await request(`/api/users/${createdUserId}`, { method: "PATCH", body: JSON.stringify({ name: "Pengguna Smoke Diperbarui", isActive: false }) });
  assert(updateUser.response.ok && updateUser.body?.data?.isActive === false, `Update pengguna gagal (${updateUser.response.status})`);

  const selfDelete = await request(`/api/users/${login.body.data.id}`, { method: "DELETE" });
  assert(selfDelete.response.status === 400, `Proteksi hapus akun sendiri gagal (${selfDelete.response.status})`);

  const deleteUser = await request(`/api/users/${createdUserId}`, { method: "DELETE" });
  assert(deleteUser.response.status === 204, `Hapus pengguna gagal (${deleteUser.response.status})`);
  createdUserId = "";

  const settings = await request("/api/settings");
  assert(settings.response.ok && settings.body?.data?.organizationName, `Baca pengaturan gagal (${settings.response.status})`);
  originalSettings = settings.body.data;
  const settingsInput = settingsPayload(originalSettings);
  const updateSettings = await request("/api/settings", { method: "PATCH", body: JSON.stringify({ ...settingsInput, description: `${settingsInput.description} [smoke]` }) });
  assert(updateSettings.response.ok && updateSettings.body?.data?.description.endsWith("[smoke]"), `Update pengaturan gagal (${updateSettings.response.status})`);
  const restoreSettings = await request("/api/settings", { method: "PATCH", body: JSON.stringify(settingsInput) });
  assert(restoreSettings.response.ok && restoreSettings.body?.data?.description === settingsInput.description, `Pemulihan pengaturan gagal (${restoreSettings.response.status})`);
  originalSettings = null;

  const logout = await request("/api/auth/logout", { method: "POST" });
  assert(logout.response.ok, `Logout gagal (${logout.response.status})`);

  console.log("Smoke test admin lulus: autentikasi, CRUD dan publikasi konten, formulir kontak, kotak masuk, pengguna, pengaturan, dan logout.");
} finally {
  if (createdId) await request(`/api/content/${createdId}`, { method: "DELETE" }).catch(() => undefined);
  if (createdMessageId) await request(`/api/messages/${createdMessageId}`, { method: "DELETE" }).catch(() => undefined);
  if (createdUserId) await request(`/api/users/${createdUserId}`, { method: "DELETE" }).catch(() => undefined);
  if (createdAnnouncementId) await request(`/api/content/${createdAnnouncementId}`, { method: "DELETE" }).catch(() => undefined);
  if (uploadedMediaId) await request(`/api/media/${uploadedMediaId}`, { method: "DELETE" }).catch(() => undefined);
  if (originalSettings) {
    await request("/api/settings", { method: "PATCH", body: JSON.stringify(settingsPayload(originalSettings)) }).catch(() => undefined);
  }
}
