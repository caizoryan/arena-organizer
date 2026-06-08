import {auth} from './auth.js'
async function getUserChannels(userSlugOrId, options = {}) {
  const {
    page = 1,
    per = 24,
    sort = "created_at_desc",
  } = options;

  const params = new URLSearchParams({ page, per, sort });

  const headers = { "Content-Type": "application/json" };
  headers["Authorization"] = `Bearer ${auth}`;

  const response = await fetch(
    `https://api.are.na/v3/users/${userSlugOrId}/contents?${params}&type=Channel`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details?.message ?? `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
}
