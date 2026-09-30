const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib tersedia untuk smoke test admin");
}

let cookie = "";
let createdId = "";

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

try {
  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  assert(login.response.ok && cookie, `Login gagal (${login.response.status})`);

  const list = await request("/api/content?kind=NEWS&page=1&pageSize=1");
  assert(list.response.ok && list.body?.meta?.statusCounts, `Daftar konten gagal (${list.response.status})`);

  const create = await request("/api/content", {
    method: "POST",
    body: JSON.stringify({ kind: "NEWS", title: `Smoke Test Admin ${Date.now()}`, category: "Pengujian", summary: "Record sementara untuk verifikasi CRUD.", status: "DRAFT" }),
  });
  assert(create.response.status === 201 && create.body?.data?.id, `Create gagal (${create.response.status})`);
  createdId = create.body.data.id;

  const update = await request(`/api/content/${createdId}`, {
    method: "PATCH",
    body: JSON.stringify({ summary: "Record sementara berhasil diperbarui." }),
  });
  assert(update.response.ok && update.body?.data?.summary.includes("diperbarui"), `Update gagal (${update.response.status})`);

  const detail = await request(`/api/content/${createdId}`);
  assert(detail.response.ok && detail.body?.data?.id === createdId, `Detail gagal (${detail.response.status})`);

  const remove = await request(`/api/content/${createdId}`, { method: "DELETE" });
  assert(remove.response.status === 204, `Delete gagal (${remove.response.status})`);
  createdId = "";

  const missing = await request(`/api/content/${create.body.data.id}`);
  assert(missing.response.status === 404, `Verifikasi delete gagal (${missing.response.status})`);

  const logout = await request("/api/auth/logout", { method: "POST" });
  assert(logout.response.ok, `Logout gagal (${logout.response.status})`);

  console.log("Smoke test admin lulus: login, list, create, update, detail, delete, dan logout.");
} finally {
  if (createdId) await request(`/api/content/${createdId}`, { method: "DELETE" }).catch(() => undefined);
}
