"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { projectType } from "./sanity/schemaTypes/project";

export default defineConfig({
  name: "webuilder",
  title: "Webuilder",
  basePath: "/studio",
  projectId: projectId || "unconfigured",
  dataset,
  plugins: [structureTool()],
  schema: { types: [projectType] },
});
