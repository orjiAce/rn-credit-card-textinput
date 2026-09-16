import Module from 'node:module';

type NodeModuleLoader = (
  module: { exports: unknown },
  filename: string,
) => void;

const moduleExtensions = (
  Module as unknown as { _extensions: Record<string, NodeModuleLoader> }
)._extensions;

moduleExtensions['.png'] = (module, filename) => {
  module.exports = filename;
};
