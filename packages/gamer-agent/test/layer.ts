// test/layer.ts — in-process OpenCode location runtime for gamer-agent integration
// tests. Mirrors packages/core/spike/lib/spike-layer.ts (which proved the S4/S5
// mechanism), so the real plugins can register tools + system-context.

import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { AgentV2 } from "@opencode-ai/core/agent"
import { AISDK } from "@opencode-ai/core/aisdk"
import { Catalog } from "@opencode-ai/core/catalog"
import { CommandV2 } from "@opencode-ai/core/command"
import { Credential } from "@opencode-ai/core/credential"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
import { LayerNodePlatform } from "@opencode-ai/core/effect/app-node-platform"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { EventV2 } from "@opencode-ai/core/event"
import { FileSystem } from "@opencode-ai/core/filesystem"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { Integration } from "@opencode-ai/core/integration"
import { Location } from "@opencode-ai/core/location"
import { Npm } from "@opencode-ai/core/npm"
import { PluginV2 } from "@opencode-ai/core/plugin"
import { Project } from "@opencode-ai/core/project"
import { Reference } from "@opencode-ai/core/reference"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { SkillV2 } from "@opencode-ai/core/skill"
import { SystemContextRegistry } from "@opencode-ai/core/system-context/registry"
import { ApplicationTools } from "@opencode-ai/core/tool/application-tools"
import { ToolRegistry } from "@opencode-ai/core/tool/registry"
import { ToolOutputStore } from "@opencode-ai/core/tool-output-store"
import { Effect, Layer } from "effect"

const tempLocationLayer = Layer.unwrap(
  Effect.acquireRelease(
    Effect.promise(() => fs.mkdtemp(path.join(os.tmpdir(), "gamer-agent-test-"))),
    (dir) => Effect.promise(() => fs.rm(dir, { recursive: true, force: true })),
  ).pipe(
    Effect.map((dir) => {
      const ref = Location.Ref.make({ directory: AbsolutePath.make(dir) })
      return Layer.succeed(
        Location.Service,
        Location.Service.of({
          directory: ref.directory,
          workspaceID: ref.workspaceID,
          project: { id: Project.ID.global, directory: ref.directory },
          vcs: undefined,
        } satisfies Location.Interface),
      )
    }),
  ),
)

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
    install: () => Effect.void,
    which: () => Effect.succeed(undefined),
  }),
)

const toolOutputStoreLayer = Layer.succeed(
  ToolOutputStore.Service,
  ToolOutputStore.Service.of({
    limits: () => Effect.succeed({ maxLines: 2000, maxBytes: 50 * 1024 }),
    bound: () => Effect.die("ToolOutputStore.bound is not used by the integration test"),
    cleanup: () => Effect.void,
  }),
)

export const TestLayer = AppNodeBuilder.build(
  LayerNode.group([
    FileSystem.node,
    FSUtil.node,
    Location.node,
    Npm.node,
    Credential.node,
    EventV2.node,
    LayerNodePlatform.httpClient,
    PluginV2.node,
    AgentV2.node,
    AISDK.node,
    Catalog.node,
    CommandV2.node,
    Integration.node,
    Reference.node,
    SkillV2.node,
    SystemContextRegistry.node,
    ApplicationTools.node,
    ToolRegistry.node,
  ]),
  [
    [Location.node, tempLocationLayer],
    [Npm.node, npmLayer],
    [ToolOutputStore.node, toolOutputStoreLayer],
  ],
)
