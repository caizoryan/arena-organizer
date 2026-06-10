import {auth} from './auth.js'
export async function getUserChannels(userSlugOrId, options = {}) {
  const { page , per  } = options;

	let sort = "created_at_desc"
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

  let data = await response.json();
  return data;
}

export async function streamUserChannels(userSlugOrId, senderFn, options = {}) {
  // Fetch and send first page
  const firstPage = await getUserChannels(userSlugOrId, { ...options, page: 1 });
  senderFn(firstPage.data, firstPage.meta);

  const { total_pages } = firstPage.meta;
  if (total_pages <= 1) return;

  // Fetch remaining pages in parallel, sending each as it resolves
  const remainingPages = Array.from({ length: total_pages - 1 }, (_, i) => i + 2);
	console.log(remainingPages)

  await Promise.all(
    remainingPages.map(async (page) => {
      const result = await getUserChannels(userSlugOrId, { ...options, page });
      senderFn(result.data, result.meta);
    })
  );
}
