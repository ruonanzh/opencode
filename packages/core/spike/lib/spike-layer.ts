// spike-layer.ts — boots a minimal in-process OpenCode location runtime for the
// M0.7 S4/S5 spikes. Mirrors packages/core/test/plugin/fixture.ts and adds the
// services the spikes need (SystemContextRegistry + ToolRegistry/Tools).
//
// Purpose: prove that an external plugin effect (running in the ambient location
// runtime) can reach Tools.Service and SystemContextRegistry.Service directly —
// i.e. custom tool + system-context injection WITHOUT going through MCP.

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
import { Reference } from "@opencode-ai/core/reference"
import { SkillV2 } from "@opencode-ai/core/skill"
import { SystemContextRegistry } from "@opencode-ai/core/system-context/registry"
import { ApplicationTools } from "@opencode-ai/core/tool/application-tools"
import { ToolRegistry } from "@opencode-ai/core/tool/registry"
import { ToolOutputStore } from "@opencode-ai/core/tool-output-store"
import { Effect, Layer } from "effect"
import { tempLocationLayer } from "../../test/fixture/location"

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
    install: () => Effect.void,
    which: () => Effect.succeed(undefined),
  }),
)

// The spikes only call ToolRegistry.materialize(); execution/output-bounding are
// never exercised, so stub ToolOutputStore to avoid pulling Config/Global in.
const toolOutputStoreLayer = Layer.succeed(
  ToolOutputStore.Service,
  ToolOutputStore.Service.of({
    limits: () => Effect.succeed({ maxLines: 2000, maxBytes: 50 * 1024 }),
    bound: () => Effect.die("ToolOutputStore.bound is not used by the spike"),
    cleanup: () => Effect.void,
  }),
)

export const SpikeLayer = AppNodeBuilder.build(
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
