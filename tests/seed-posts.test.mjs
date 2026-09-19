import test from "node:test";
import assert from "node:assert/strict";
import { buildPosts, seedPosts } from "../scripts/seed-posts.mjs";

function mockClient(initial = [], failUpload = false) {
  const docs = [...initial];
  const stats = { uploads: 0, commits: 0 };
  return {
    docs,
    stats,
    fetch: async () => docs.map((d) => ({ _id: d._id, slug: d.slug?.current })),
    assets: {
      upload: async (type, bytes) => {
        stats.uploads++;
        if (failUpload) throw new Error("Upload failed");
        assert.equal(type, "image");
        assert.deepEqual(
          [...bytes.subarray(0, 8)],
          [137, 80, 78, 71, 13, 10, 26, 10],
        );
        return { _id: `image-${stats.uploads}` };
      },
    },
    transaction() {
      const pending = [];
      return {
        createIfNotExists(doc) {
          pending.push(doc);
        },
        async commit() {
          stats.commits++;
          for (const doc of pending)
            if (!docs.some((d) => d._id === doc._id)) docs.push(doc);
        },
      };
    },
  };
}
const quiet = () => {};

test("15 unique, schema-compatible articles with past dates and rich text", () => {
  const now = Date.now();
  const posts = buildPosts(now);
  assert.equal(posts.length, 15);
  assert.equal(new Set(posts.map((p) => p._id)).size, 15);
  assert.equal(new Set(posts.map((p) => p.slug.current)).size, 15);
  for (const p of posts) {
    assert.equal(p._type, "article");
    assert.match(p.slug.current, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(p.title.length <= 120 && p.seoTitle.length <= 70);
    assert.ok(p.excerpt.length <= 320 && p.seoDescription.length <= 170);
    assert.ok(p.category.length <= 50);
    assert.ok(Date.parse(p.publishedAt) < now);
    assert.equal(new Set(p.body.map((b) => b._key)).size, p.body.length);
    assert.equal(p.body.filter((b) => b.style === "h2").length, 3);
    assert.ok(p.body.every((b) => b.children[0].text.length > 0));
  }
});

test("creates 15 covers/posts once and preserves edits on rerun", async () => {
  const client = mockClient();
  assert.deepEqual(await seedPosts(client, quiet), { created: 15, skipped: 0 });
  client.docs[0].title = "Edited in Studio";
  assert.deepEqual(await seedPosts(client, quiet), { created: 0, skipped: 15 });
  assert.equal(client.docs[0].title, "Edited in Studio");
  assert.equal(client.stats.uploads, 15);
  assert.equal(client.stats.commits, 1);
  assert.ok(
    client.docs.every((d) => d.cover.asset._ref && d.cover.alt.length <= 200),
  );
});

test("skips drafts and slug collisions while preserving unrelated content", async () => {
  const posts = buildPosts();
  const original = [
    { ...posts[0], _id: `drafts.${posts[0]._id}` },
    { ...posts[1], _id: "another-id" },
    { _id: "unrelated", title: "Keep me" },
  ];
  const client = mockClient(original);
  assert.deepEqual(await seedPosts(client, quiet), { created: 13, skipped: 2 });
  assert.deepEqual(client.docs.slice(0, 3), original);
});

test("upload failure leaves articles unpublished", async () => {
  const client = mockClient([], true);
  await assert.rejects(seedPosts(client, quiet), /Upload failed/);
  assert.equal(client.docs.length, 0);
  assert.equal(client.stats.commits, 0);
});
