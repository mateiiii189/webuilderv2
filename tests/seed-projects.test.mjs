import test from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import {
  buildProjects,
  createCover,
  seedProjects,
} from "../scripts/seed-projects.mjs";

function mockClient(initial = []) {
  const documents = new Map(initial.map((doc) => [doc._id, doc]));
  let uploads = 0;
  return {
    documents,
    get uploads() {
      return uploads;
    },
    async fetch(_query, params) {
      return [...documents.values()]
        .filter(
          (doc) =>
            params.ids.includes(doc._id) ||
            params.slugs.includes(doc.slug?.current),
        )
        .map((doc) => ({ _id: doc._id, slug: doc.slug?.current }));
    },
    assets: {
      async upload(type, bytes) {
        assert.equal(type, "image");
        assert.equal(bytes.subarray(1, 4).toString(), "PNG");
        uploads++;
        return { _id: `image-${"a".repeat(40)}-800x600-png` };
      },
    },
    transaction() {
      const pending = [];
      return {
        createIfNotExists(doc) {
          pending.push(doc);
          return this;
        },
        async commit() {
          for (const doc of pending)
            if (!documents.has(doc._id)) documents.set(doc._id, doc);
        },
      };
    },
  };
}

test("seed creates 15 published concepts with covers and preserves edits on rerun", async () => {
  const client = mockClient();
  const quiet = () => {};
  assert.deepEqual(await seedProjects(client, quiet), {
    created: 15,
    skipped: 0,
  });
  assert.equal(client.documents.size, 15);
  assert.equal(
    new Set([...client.documents.values()].map((doc) => doc.slug.current)).size,
    15,
  );
  for (const doc of client.documents.values()) {
    assert.equal(doc._type, "project");
    assert.equal(doc.isConcept, true);
    assert.equal(doc.featured, false);
    assert.ok(doc.cover.asset._ref);
    assert.ok(doc.cover.alt);
    assert.equal(doc.clientName, undefined);
    assert.equal(doc._id.startsWith("drafts."), false);
  }
  client.documents.get("webuilder-demo-01").title = "Edited in Studio";
  assert.deepEqual(await seedProjects(client, quiet), {
    created: 0,
    skipped: 15,
  });
  assert.equal(
    client.documents.get("webuilder-demo-01").title,
    "Edited in Studio",
  );
  assert.equal(client.uploads, 15);
});

test("seed preserves existing drafts and slug collisions", async () => {
  const projects = buildProjects();
  const draft = { ...projects[0], _id: `drafts.${projects[0]._id}` };
  const unrelated = {
    ...projects[1],
    _id: "existing-real-project",
    isConcept: false,
  };
  const client = mockClient([draft, unrelated]);
  assert.deepEqual(await seedProjects(client, () => {}), {
    created: 13,
    skipped: 2,
  });
  assert.equal(client.documents.has(projects[0]._id), false);
  assert.equal(client.documents.has(projects[1]._id), false);
  assert.deepEqual(client.documents.get(unrelated._id), unrelated);
});

test("all generated PNG covers decode to the advertised RGB dimensions", () => {
  for (let index = 0; index < 15; index++) {
    const png = createCover(index);
    assert.equal(png.readUInt32BE(16), 800);
    assert.equal(png.readUInt32BE(20), 600);
    const chunks = [];
    for (let offset = 8; offset < png.length;) {
      const length = png.readUInt32BE(offset);
      if (png.toString("ascii", offset + 4, offset + 8) === "IDAT")
        chunks.push(png.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    assert.equal(
      inflateSync(Buffer.concat(chunks)).length,
      600 * (1 + 800 * 3),
    );
  }
});
